import express from 'express';
import { db } from '../server.js';
const router = express.Router()

router.post('/addMensagem', (req, res) => {
    const { mensagem, idRemetente, idDestinatario } = req.body;
    const query = 'insert into mensagens (mensagem, idRemetente, idDestinatario) values(?,?,?)';

    db.query(query, [mensagem, idRemetente, idDestinatario], (erro, results) => {
        if (erro) {
            console.log(erro);
            res.status(501).json(erro);
        } else {
            console.log(results);
            res.status(201).json(results);
        }
    })
});

router.get('/getMensagens/:idUsuario1/:idUsuario2', (req, res) => {
    const { idUsuario1, idUsuario2 } = req.params;

    const query = 'SELECT * FROM mensagens WHERE (idRemetente = ? AND idDestinatario = ?) OR (idRemetente = ? AND idDestinatario = ?) ORDER BY id ASC';

    db.query(query, [idUsuario1, idUsuario2, idUsuario2, idUsuario1], (erro, results) => {
        if (erro) {
            console.log(erro);
            res.status(501).json(erro);
        } else {
            console.log(results);
            res.status(200).json(results);
        }
    });
});

export default router;