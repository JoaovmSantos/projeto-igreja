const express = require('express');
const db = require('./db');

const router = express.Router();

// Middleware para verificar autenticação
function verificarAutenticacao(req, res, next) {
    if (!req.session.pastor) {
        // Salva a URL original na sessão
        req.session.retorno = req.originalUrl;
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
    req.session.pastor = true;

// Redireciona para onde o usuário queria ir originalmente, ou para '/' se não houver destino salvo
const destino = req.session.retorno || '/';
req.session.retorno = null;
return res.redirect(destino);

});

// Formulário para pedido de oração
router.get('/pedidoOracao', (req, res) => {
    res.render('add_pedido');
});

// Registrar um novo pedido de oração
router.post('/pedidoOracao', (req, res) => {
    console.log("Recebendo dados do formulário:", req.body);

    const { nome, beneficiado, categoria, descricao } = req.body;

    if (!nome) {
        return res.json({ success: false, message: 'O campo nome é obrigatório.' });
    }

    if (!beneficiado) {
        return res.json({ success: false, message: 'Preencha para quem é o pedido.' });
    }

    const categoriaFinal = categoria?.trim() || 'Geral';
    const descricaoFinal = descricao?.trim() || null; // Permitir que seja null caso não seja preenchido

    db.query(
        'INSERT INTO pedidos (nome, beneficiado, categoria, descricao, lido, data_pedido) VALUES (?, ?, ?, ?, ?, NOW())',
        [nome.trim(), beneficiado.trim(), categoriaFinal, descricaoFinal, false],
        (err) => {
            if (err) {
                console.error('Erro ao adicionar o pedido de oração:', err);
                return res.json({ success: false, message: 'Erro ao adicionar o pedido de oração.' });
            }
            res.json({ success: true, message: 'Pedido enviado com sucesso!' });
        }
    );
});

// Página para adicionar visitante
router.get('/visitante', (req, res) => {
    res.render('add_visitante');
});

// Envio do formulário de visitantes
router.post('/visitante', (req, res) => {
    const { nome, cidade, pertenceIgreja, nomeIgreja, apresentado} = req.body;

    if (!nome || !cidade || !pertenceIgreja) {
        return res.status(400).send("Dados obrigatórios faltando.");
    }

    const igreja = pertenceIgreja === 'sim' ? nomeIgreja?.trim() : null;

    db.query(
    'INSERT INTO visitantes (nome, cidade, pertence_igreja, nome_igreja) VALUES (?, ?, ?, ?)',
    [nome.trim(), cidade.trim(), pertenceIgreja, igreja],
    (err) => {
        if (err) {
            console.error('Erro ao cadastrar visitante:', err);
            return res.status(500).send('Erro ao salvar visitante.');
        }
        res.redirect('/visitante');
    }
);
});

//Página de visitantes pendentes
router.get('/visitantes', verificarAutenticacao, (req, res) =>{
    db.query('SELECT * FROM visitantes', (err, results) =>{
        if(err){
            console.error('Erro ao buscar visitantes pendentes', err);
            return res.status(500).send('Erro ao buscar visitanes pendentes')
        }
        res.render('visitantes', {visitantes: results});
    })
} )

// Marcar visitante como apresentado
router.post('/visitante/apresentar/:id', verificarAutenticacao, (req, res) => {
    const visitanteId = req.params.id;
    db.query('UPDATE visitantes SET apresentado = 1 WHERE id = ?', [visitanteId], (err) => {
        if (err) {
            console.error('Erro ao marcar visitante como apresentado:', err);
            return res.status(500).send('Erro ao atualizar visitante.');
        }
        res.redirect('/visitantes');
    });
});

router.post('/visitantes/marcarTodos', verificarAutenticacao, (req, res) => {
    db.query('UPDATE visitantes SET apresentado = 1 WHERE apresentado IS NULL OR apresentado = 0', (err) => {
        if (err) {
            console.error('Erro ao marcar todos os visitantes como apresentados:', err);
            return res.status(500).send('Erro ao atualizar visitantes.');
        }
        res.redirect('/visitantes');
    });
});


// Página de pedidos pendentes
router.get('/pedidos', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = FALSE ORDER BY categoria', (err, results) => {
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

router.post('/pedidos/marcarTodos', verificarAutenticacao, (req, res) => {
    db.query('UPDATE pedidos SET lido = TRUE WHERE lido = FALSE', (err) => {
        if (err) {
            console.error('Erro ao marcar todos como lido:', err);
            return res.status(500).send('Erro ao atualizar pedidos');
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

router.post('/historico/deleteAll', verificarAutenticacao, (req, res) => {
    db.query('DELETE FROM pedidos WHERE lido = TRUE', (err) => {
        if (err) {
            console.error('Erro ao apagar todos os pedidos:', err);
            return res.status(500).send('Erro ao apagar todos os pedidos.');
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
