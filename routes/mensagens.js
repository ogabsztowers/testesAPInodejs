import express from 'express';
import { db } from '../config/config.js';
const router = express.Router()

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
            res.status(200).json(results);
        }
    });
});

router.delete('/deletarMensagem/:id', (req, res) => {
    const { id } = req.params;
    const query = 'delete from mensagens where id = ?'

    db.query(query, [id], (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json(error);
        } else {
            console.log(results);
            res.status(201).json(results)
        }
    })
})

export default router;