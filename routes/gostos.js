import express, { application, query } from 'express';
import { db } from '../server.js';
const router = express.Router();

router.post('/addGosto', (req, res) => {
    const { nome } = req.body;
    const chk = 'select * from gostos where nome = ?';

    db.query(chk, [nome], (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json(error);
        } else if (results.length > 0) {
            console.log('esse gosto ja existe no banco de dados');
            return res.status(303).json('gosto ja inserido')
        } else {
            const query = 'insert into gostos (nome) values (?);'
            db.query(query, [nome], (error, results) => {
                if (error) {
                    console.log('erro interno no servidos ', error);
                    res.status(500).json(error);
                } else {
                    console.log(results);
                    res.status(202).json(results);
                }
            })
        }
    })
})

router.get('/exibirGostos', (req, res) => {
    const query = 'select * from gostos';

    db.query(query, (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json(error);
        } else if (results.length > 0) {
            res.status(201).json(results);
        } else {
            console.log('erro ao encontrar gosto')
            res.status(404).json('erro ao encontrar gosto')
        }
    })
})

router.delete('/apagarGosto/:id', (req, res) => {
    const { id } = req.params;
    const del2 = 'delete from gostosUsuario where nomeGosto = ?'

    db.query(del2, [id], (error, results) => {
        if (error) {
            console.log(error)
            return res.status(501).json(error)
        }

        const query = 'delete from gostos where id = ?'

        db.query(query, [id], (error, result) => {
            if (error) {
                console.log(error);
                res.status(501).json(error);
            }
            console.log(result, results);
            res.status(202).json({result, results});

        })

    })
})

router.post('/gostoUsuarioAdd', (req, res) => {
    const { idUsuario, nomeGosto } = req.body;
    const chk = 'select * from gostosUsuario where idUsuario = ? and nomeGosto = ?'

    db.query(chk, [idUsuario, nomeGosto], (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json(error);
        } else if (results.length > 0) {
            console.log('usuario ja possui esse gosto cadastrado')
            return res.status(303).json('erro')
        } else {

            const query = 'insert into gostosUsuario (idUsuario, nomeGosto)values(?,?);'
            db.query(query, [idUsuario, nomeGosto], (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(500).json(error);
                } else {
                    console.log(results);
                    res.status(202).json(results);
                }
            })
        }
    })
})

router.get('/gostosUsuario/:id', (req, res) => {
    const { id } = req.params;
    const query = 'select gu.id ,g.nome as nome_gosto, u.email from gostosUsuario gu join gostos g on g.id = gu.nomeGosto join usuario u on u.id = gu.idUsuario where u.id = ?;'

    db.query(query, [id], (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json(error);
        } else {
            res.status(201).json(results)
        }
    })
})

router.delete('/deletarGostoUsuario/:id', (req, res) => {
    const { id } = req.params;
    const query = 'delete from gostosUsuario where id = ?'

    db.query(query, [id], (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json(error);
        } else {
            console.log(results);
            res.status(202).json(results);
        }
    })
})

export default router;