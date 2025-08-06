import express, { Router } from 'express';
import { db } from '../config/config.js';
const router = express.Router();

router.post('/cadastro', (req, res) => {
    const { email, senha, nome } = req.body;
    const chk = 'select * from usuario where email = ?'

    db.query(chk, [email], (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json(error);
        } else if (results.length > 0) {
            console.log('usuario ', results[0].email, ' ja cadastrado');
            return res.status(301).json('usuario ', results[0].email, ' ja cadastrado')
        }

        const query = 'insert into usuario (email, senha, nome)values(?,?,?);';

        db.query(query, [email, senha, nome], (error, results) => {
            if (error) {
                console.log(error);
                res.status(501).json(error);
            } else {
                console.log(results);
                res.status(200).json(results)
            }
        })

    })
})

router.get('/exibirDadosUsuario/:id', (req, res) => {
    const { id } = req.params;
    const query = `select u.id,u.nome, g.nome as gosto from gostosUsuario gu 
    join gostos g on g.id = gu.nomeGosto
    join usuario u on u.id = gu.idUsuario where u.id = ?;`

    db.query(query, [id], (error, results)=>{
        if(error){
            console.log(error);
            res.status(501).json(error)
        }else{
            console.log(results)
            res.status(202).json(results);
        }
    })
})

router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'select * from usuario where email = ? and senha = ?';

    db.query(query, [email, senha], (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).json(error);
        } else if (results.length > 0) {
            console.log('login realizado com sucesso', results[0]);
            res.status(200).json({ usuario: results[0] });
        } else {
            console.log('usuario não encontrado');
            res.status(404).json('usuario não encontrado')
        }
    })
})

router.get('/exibir', (req, res) => {
    const query = 'select id, nome from usuario'

    db.query(query, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).json(error);
        } else {
            res.status(201).json(results);
        }
    })
})


export default router;