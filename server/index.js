const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const db = require('./db');
const routes = require('./route'); // Corrigido para corresponder ao nome correto do arquivo de rotas

// Configuração do mecanismo de visualização (usando EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // A pasta "views" deve estar no mesmo nível que "server" (ou no caminho especificado)

// Configuração de arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public'))); // Corrigido para garantir que a pasta "public" seja encontrada corretamente

// Configuração do body-parser para lidar com requisições POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Embora o express já tenha suporte para parsing de JSON, o body-parser é mantido por compatibilidade

// Configuração da sessão para autenticação do pastor
app.use(session({
    secret: process.env.SESSION_SECRET || 'secreta', // Use uma chave secreta do .env, se possível
    resave: false,
    saveUninitialized: true
}));

// Middleware para verificar autenticação
app.use((req, res, next) => {
    res.locals.pastorAutenticado = req.session.pastor || false; // Garantindo que a informação sobre a autenticação seja passada para todas as views
    next();
});

// Usando as rotas definidas em "routes.js"
app.use('/', routes);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
