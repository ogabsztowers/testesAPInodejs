import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

import mensagensRouter from './routes/mensagens.js';
import usuarioRouter from './routes/usuarios.js';
import gostosRouter from './routes/gostos.js';

app.use(mensagensRouter);
app.use(usuarioRouter);
app.use(gostosRouter);

const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    console.log(`Pasta de uploads não encontrada. Criando o diretório: ${uploadDir}`);
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.post('/upload', (req, res) => {
    if (!req.files || !req.files.arquivo) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const arquivo = req.files.arquivo;
    const caminho = path.join(uploadDir, arquivo.name);

    arquivo.mv(caminho, (err) => {
        if (err) {
            console.error('Erro ao mover o arquivo:', err);
            return res.status(500).json({ error: 'Erro ao fazer o upload do arquivo.' });
        }
        
        return res.json({ 
            message: 'Upload bem-sucedido!', 
            url: `/uploads/${arquivo.name}`,
            mimetype: arquivo.mimetype
        });
    });
});

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