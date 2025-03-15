const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const db = require('./db');
const routes = require('./route');

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para arquivos estáticos
app.use(express.static(path.resolve(__dirname, '../public')));

// Middleware para interpretar JSON e formulários
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'secreta',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Protege contra ataques XSS
        secure: process.env.NODE_ENV === 'production', // Em produção, ativa HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 24 horas de duração
    }
}));

// Middleware para verificar autenticação do pastor
app.use((req, res, next) => {
    res.locals.pastorAutenticado = req.session.pastor || false;
    next();
});

// Rotas
app.use('/', routes);

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT} 🚀`);
});
