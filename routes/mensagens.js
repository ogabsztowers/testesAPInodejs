import express from 'express';
import { db } from '../config/config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.json());

router.post('/addMensagem', (req, res) => {
    const { mensagem, idRemetente, idDestinatario } = req.body;
    const query = 'insert into mensagens (mensagem, idRemetente, idDestinatario) values(?,?,?)';

    db.query(query, [mensagem, idRemetente, idDestinatario], (erro, results) => {
        if (erro) {
            console.log(erro);
            res.status(501).json(erro);
        } else {
            res.status(201).json(results);
        }
    });
});

router.get('/getMensagens/:idUsuario1/:idUsuario2', (req, res) => {
    const { idUsuario1, idUsuario2 } = req.params;

    const query = 'SELECT * FROM mensagens WHERE (idRemetente = ? AND idDestinatario = ?) OR (idRemetente = ? AND idDestinatario = ?) ORDER BY id ASC';

    db.query(query, [idUsuario1, idUsuario2, idUsuario2, idUsuario1], (erro, results) => {
        if (erro) {
            console.log(erro);
            res.status(501).json(erro);
        } else {
            res.status(200).json(results);
        }
    });
});

router.delete('/deletarMensagem/:id', (req, res) => {
    const { id } = req.params;
    const { fileUrl, roomId } = req.body;
    
    const query = 'delete from mensagens where id = ?';

    db.query(query, [id], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(501).json(error);
        }

        if (fileUrl) {
            const filePath = path.join(__dirname, '..', 'public', fileUrl);
            
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Erro ao deletar arquivo:', err);
                } else {
                    console.log(`Arquivo deletado: ${filePath}`);
                }
            });
        }
        
        if (req.io) {
            req.io.to(roomId).emit('mensagemDeletada', { id });
        }
        
        res.status(200).json({ message: 'Mensagem e arquivo deletados com sucesso.' });
    });
});

export default router;