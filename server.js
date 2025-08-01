import express from 'express';
import mysql from 'mysql2';

const app = express();
export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'api',
    password: ''
})

app.use(express.json());
app.use(express.static('public'));

import usuarioRouter from './routes/usuarios.js';
import gostosRouter from './routes/gostos.js';
app.use(usuarioRouter);
app.use(gostosRouter);

app.listen(3000, () => {
    console.log('API rodando na porta 3000')
});