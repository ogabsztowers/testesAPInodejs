import express from 'express';
import mysql from 'mysql2';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

export const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'api',
    password: ''
});

app.use(express.json());
app.use(express.static('public'));

import mensagensRouter from './routes/mensagens.js'
import usuarioRouter from './routes/usuarios.js';
import gostosRouter from './routes/gostos.js';

app.use(mensagensRouter);
app.use(usuarioRouter);
app.use(gostosRouter);

io.on("connection", (socket) => {
    console.log("socket conectado:", socket.id);

    socket.on("entrarNaSala", (roomId) => {
        socket.join(roomId);
    });

    socket.on("enviarMensagem", (data) => {
        const { roomId, mensagem } = data;
        io.to(roomId).emit("mensagemRecebida", mensagem);
    });

    socket.on("disconnect", () => {
        console.log("socket desconectado", socket.id);
    });
});

server.listen(3000, () => {
    console.log('API rodando na porta 3000');
});