const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');

const router = express.Router();

function verificarAutenticacao(req, res, next) {
    if (!req.session.pastor) {
        return res.redirect('/login');
    }
    next();
}

router.get('/', (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = FALSE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar pedidos');
        }

        res.render('index', { pedidos: results });
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

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

router.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

router.post('/cadastro', (req, res) => {
    const { nome, cargo, usuario, senha } = req.body;

    if (!nome || !usuario || !senha) {
        return res.status(400).send('Nome, usuário e senha são obrigatórios.');
    }

    const salt = bcrypt.genSaltSync(10);
    const senhaCriptografada = bcrypt.hashSync(senha, salt);

    db.query(
        'INSERT INTO pastor (nome, cargo, usuario, senha) VALUES (?, ?, ?, ?)',
        [nome.trim(), cargo?.trim() | 'Sem Cargo', usuario.trim(), senhaCriptografada],
        (err) => {
            if (err) {
                console.error('Erro ao cadastrar pastor:', err);
                return res.status(500).send('Erro ao realizar o cadastro. Verifique se o usuário já existe.');
            }
            res.redirect('/login');
        }
    )
});


router.get('/pedidoOracao', (req, res) => {
    res.render('add_pedido');
});


router.post('/pedidoOracao', (req, res) => {
    const { nome, beneficiado, categoria } = req.body;

    if (!nome) {
        return res.status(400).send('O campo nome é obrigatório.');
    }

    const categoriaFinal = categoria?.trim() || 'Geral';

    db.query(
        'INSERT INTO pedidos (nome, beneficiado, categoria, lido, data_pedido) VALUES (?, ?, ?, ?, NOW())',
        [nome.trim(), beneficiado?.trim() || nome.trim(), categoriaFinal, false],
        (err) => {
            if (err) {
                console.error('Erro ao adicionar o pedido de oração:', err);
                return res.status(500).send('Erro ao adicionar o pedido de oração.');
            }
            res.redirect('/pedidoOracao');
        }
    );
});


router.get('/pedidos', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = FALSE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar pedidos pendentes');
        }
        res.render('pedidos', { pedidos: results });
    });
});

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

router.get('/historico', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = TRUE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar histórico de pedidos');
        }
        res.render('historico', { pedidos: results });
    });
});

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
