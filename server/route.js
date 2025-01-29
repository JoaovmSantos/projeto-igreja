const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');

const router = express.Router();

// Middleware para proteger rotas (autenticação)
function verificarAutenticacao(req, res, next) {
    if (!req.session.pastor) {
        return res.redirect('/login');
    }
    next();
}

// Rota para a página principal (index)
router.get('/', (req, res) => {
    // Consultando o banco para pegar os pedidos
    db.query('SELECT * FROM pedidos WHERE lido = FALSE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar pedidos');
        }

        // Certifique-se de que "results" contém os dados corretos
        res.render('index', { pedidos: results });
    });
});



// Página de login do pastor
router.get('/login', (req, res) => {
    res.render('login');
});

// Processar login do pastor
router.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).send('Usuário e senha são obrigatórios');
    }

    db.query('SELECT * FROM pastor WHERE usuario = ?', [usuario], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor ao buscar usuário');
        }

        if (results.length === 0) {
            return res.status(404).send('Usuário não encontrado');
        }

        bcrypt.compare(senha, results[0].senha, (err, match) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao verificar senha');
            }

            if (match) {
                req.session.pastor = true;
                return res.redirect('/pedidos');
            } else {
                return res.status(401).send('Senha incorreta');
            }
        });
    });
});

// Página para adicionar pedidos de oração
router.get('/add', (req, res) => {
    res.render('add_pedido');
});

// Processar novo pedido de oração
router.post('/add', (req, res) => {
    const { nome, descricao, categoria } = req.body;

    // Validações básicas
    if (!nome || !descricao || !categoria) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    db.query(
        'INSERT INTO pedidos (nome, descricao, categoria) VALUES (?, ?, ?)',
        [nome.trim(), descricao.trim(), categoria.trim()],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao adicionar o pedido de oração');
            }
            res.redirect('/add'); // Após adicionar, redireciona para a página de adicionar
        }
    );
});

// Listar pedidos pendentes (somente para pastor)
router.get('/pedidos', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = FALSE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar pedidos pendentes');
        }
        res.render('pedidos', { pedidos: results });
    });
});

// Marcar pedido como lido
router.post('/lido/:id', verificarAutenticacao, (req, res) => {
    const pedidoId = req.params.id;

    db.query('UPDATE pedidos SET lido = TRUE WHERE id = ?', [pedidoId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao atualizar o pedido');
        }
        res.redirect('/pedidos');
    });
});

// Listar pedidos já lidos
router.get('/historico', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = TRUE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar histórico de pedidos');
        }
        res.render('historico', { pedidos: results });
    });
});

// Logout do pastor
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao fazer logout');
        }
        res.redirect('/login');
    });
});

module.exports = router;
