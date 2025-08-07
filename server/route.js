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
    const { usuario, senha, destino } = req.body;

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

        // Redireciona para o destino informado (ou padrão '/')
        const redirecionarPara = destino || '/';
        return res.json({ success: true, redirect: redirecionarPara });
    });
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
router.get('/visitantes', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM visitantes WHERE apresentado IS NULL OR apresentado = 0', (err, results) => {
        if (err) {
            console.error('Erro ao buscar visitantes pendentes', err);
            return res.status(500).send('Erro ao buscar visitantes pendentes');
        }
        res.render('visitantes', { visitantes: results });
    });
});


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

//Histórico de Visitantes
router.get('/historico_visitantes', async (req, res) => {
    db.query('SELECT * FROM visitantes ORDER BY data_visita DESC', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar visitantes.');
        }
        res.render('historico_visitantes', { visitantes: results });
    });
});

router.post('/historico_visitantes/delete/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM visitantes WHERE id = ?', [id], (err) => {
        if (err) console.error(err);
        res.redirect('/historico_visitantes');
    });
});

router.post('/historico_visitantes/deleteAll', (req, res) => {
    db.query('DELETE FROM visitantes', (err) => {
        if (err) console.error(err);
        res.redirect('/historico_visitantes');
    });
});

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Exportar os visitantes em PDF
router.get('/exportar_visitantes', (req, res) => {
    db.query('SELECT * FROM visitantes ORDER BY data_visita DESC', (err, visitantes) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar visitantes.');
        }

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ margin: 40, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio_visitantes.pdf"');
        doc.pipe(res);

        // Título
        doc.fontSize(20).text('Relatório de Visitantes Assembléia de Deus Min. Belém de Osvaldo Cruz', { align: 'center' });
        doc.moveDown(1.5);

        const tableTop = doc.y;
        const columnPositions = {
            nome: 40,
            cidade: 160,
            possuiIgreja: 260,
            nomeIgreja: 370,
            dataVisita: 480,
        };

        // Cabeçalho com fundo cinza
        doc
            .rect(40, tableTop - 2, 520, 20)
            .fill('#eeeeee')
            .fillColor('#000')
            .fontSize(10)
            .text('Nome', columnPositions.nome, tableTop, { width: 120, align: 'center' })
            .text('Cidade', columnPositions.cidade, tableTop, { width: 100, align: 'center' })
            .text('Pertence a igreja?', columnPositions.possuiIgreja, tableTop, { width: 100, align: 'center' })
            .text('Nome da Igreja', columnPositions.nomeIgreja, tableTop, { width: 100, align: 'center' })
            .text('Data da Visita', columnPositions.dataVisita, tableTop, { width: 100, align: 'center' });

        // Linha após o cabeçalho
        doc
            .moveTo(40, tableTop + 18)
            .lineTo(560, tableTop + 18)
            .stroke();

        let y = tableTop + 25;

        visitantes.forEach(v => {
            if (y > 750) {
                doc.addPage();
                y = 50;
            }

            doc
                .fontSize(9)
                .fillColor('#000')
                .text(v.nome, columnPositions.nome, y, { width: 120, align: 'center' })
                .text(v.cidade, columnPositions.cidade, y, { width: 100, align: 'center' })
                .text(v.possui_igreja?.trim().toLowerCase() == 'sim' ? 'Sim' : 'Não', columnPositions.possuiIgreja, y, { width: 100, align: 'center' })
                .text(v.nome_igreja || '-', columnPositions.nomeIgreja, y, { width: 100, align: 'center' })
                .text(new Date(v.data_visita).toLocaleDateString('pt-BR'), columnPositions.dataVisita, y, { width: 100, align: 'center' });

            y += 20;

            // Linha separadora
            doc
                .moveTo(40, y - 2)
                .lineTo(560, y - 2)
                .strokeColor('#ccc')
                .stroke();
        });

        doc.end();
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


// Histórico Pedidos de Oração
router.get('/historico', verificarAutenticacao, (req, res) => {
    db.query('SELECT * FROM pedidos WHERE lido = TRUE', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao buscar histórico de pedidos');
        }
        res.render('historico', { pedidos: results });
    });
});

// Excluir Pedidos de Oração do Histórico
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
