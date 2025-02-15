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

    db.query('SELECT * FROM pastor WHERE usuario = ? AND senha = ?', [usuario, senha], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro no servidor ao buscar usuário');
        }

        if (results.length === 0) {
            return res.status(401).send('Usuário ou senha incorretos');
        }

        req.session.pastor = true;
        res.redirect('/pedidos');
    });
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
