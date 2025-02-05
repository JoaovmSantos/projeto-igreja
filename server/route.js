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

router.get('/pedidoOracao', (req, res) => {
    res.render('add_pedido');
});


router.post('/pedidoOracao', (req, res) => {
    const { nome, beneficiado, categoria, descricao } = req.body;

    const palavraCount = descricao.trim().split(/\s+/).length;
    if (palavraCount > 30) {
        return res.status(400).send('O pedido deve conter no máximo 30 palavras.');
    }

    db.query(
        'INSERT INTO pedidos (nome, beneficiado, descricao, categoria, lido, data_pedido) VALUES (?, ?, ?, ?, ?, NOW())',
        [nome, beneficiado || nome, descricao.trim(), categoria, false],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao adicionar o pedido de oração');
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
