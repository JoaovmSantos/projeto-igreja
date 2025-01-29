const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',   // Usuário que você criou
    password: '123456', // Senha definida
    database: 'oracoes_db'
});

connection.connect(err => {
    if (err) throw err;
    console.log("Conectado ao MySQL!");
});

module.exports = connection;
