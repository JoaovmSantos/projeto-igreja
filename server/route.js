const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('./db');

const router = express.Router();

// Middleware para verificar autenticação
function verificarAutenticacao(req, res, next) {
    if (!req.session.pastor) {
        return res.redirect('/login');
    }
    next();
}

// Página inicial (lista de pedidos não lidos)
router.get('/', (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = FALSE', (err, results) => {
        if (err) {
            console.error('Erro ao buscar pedidos:', err);
            return res.status(500).send('Erro ao buscar pedidos');
        }
        res.render('index', { pedidos: results });
    });
});

// Página de login
router.get('/login', (req, res) => {
    const mensagem = req.session.mensagem;
    req.session.mensagem = null; // Limpa a mensagem após exibir
    res.render('login', { mensagem });
});

// Processo de login
router.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.json({ success: false, message: 'Usuário e senha são obrigatórios!' });
    }

    db.query('SELECT * FROM pastor WHERE usuario = ? AND senha = ?', [usuario, senha], (err, results) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: 'Erro no servidor ao buscar usuário!' });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: 'Usuário ou senha incorretos!' });
        }

        // Se encontrou um usuário com as credenciais corretas, cria a sessão
        req.session.pastor = true;
        return res.json({ success: true, message: 'Login realizado com sucesso!' });
    });
});

// Formulário para pedido de oração
router.get('/pedidoOracao', (req, res) => {
    res.render('add_pedido');
});

// Registro de um novo pedido de oração
router.post('/pedidoOracao', (req, res) => {
    console.log("Recebendo dados do formulário:", req.body); 

    const { nome, beneficiado, categoria } = req.body;

    if (!nome) {
        return res.json({ success: false, message: 'O campo nome é obrigatório.' });
    }

    if(!beneficiado){
        return res.json({succes: false, message: 'Preencha para quem é o pedido'})
    }

    const categoriaFinal = categoria?.trim() || 'Geral';

    db.query(
        'INSERT INTO pedidos (nome, beneficiado, categoria, lido, data_pedido) VALUES (?, ?, ?, ?, NOW())',
        [nome.trim(), beneficiado?.trim() || nome.trim(), categoriaFinal, false],
        (err) => {
            if (err) {
                console.error('Erro ao adicionar o pedido de oração:', err);
                return res.json({ success: false, message: 'Erro ao adicionar o pedido de oração.' });
            }
            res.json({ success: true, message: 'Pedido enviado com sucesso!' });
        }
    );
});

// Página de pedidos pendentes
router.get('/pedidos', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = FALSE', (err, results) => {
        if (err) {
            console.error('Erro ao buscar pedidos pendentes:', err);
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

// Página do histórico
router.get('/historico', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = TRUE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar histórico de pedidos');
        }
        res.render('historico', { pedidos: results });
    });
});

// Rota para excluir pedidos do histórico
router.post('/historico/delete/:id', verificarAutenticacao, (req, res) => {
    const pedidoId = req.params.id;

    db.query('DELETE FROM pedidos WHERE id = ?', [pedidoId], (err) => {
        if (err) {
            console.error('Erro ao excluir pedido:', err);
            return res.status(500).send('Erro ao excluir o pedido.');
        }
        res.redirect('/historico');
    });
});

// Logout do sistema
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
