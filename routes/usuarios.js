import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/config.js';
const router = express.Router();

const saltRounds = 10

router.post('/cadastro', async (req, res) => {
    const { email, senha, nome } = req.body;
    const chk = 'select * from usuario where email = ?'

    try {

        const hashedPassword = await bcrypt.hash(senha, saltRounds)

        db.query(chk, [email], (error, results) => {
            if (error) {
                console.log(error);
                res.status(501).json(error);
            } else if (results.length > 0) {
                return res.status(301).json('usuario ', results[0].email, ' ja cadastrado')
            }

            const query = 'insert into usuario (email, senha, nome)values(?,?,?);';

            db.query(query, [email, hashedPassword, nome], (error, results) => {
                if (error) {
                    console.log(error);
                    res.status(501).json(error);
                } else {
                    res.status(200).json(results)
                }
            })

        })

    } catch (error) {
        console.log('houve um erro inesperado')
    }
})

router.get('/exibirDadosUsuario/:id', (req, res) => {
    const { id } = req.params;
    const query = `select u.id,u.nome, g.nome as gosto from gostosUsuario gu 
    join gostos g on g.id = gu.nomeGosto
    join usuario u on u.id = gu.idUsuario where u.id = ?;`

    db.query(query, [id], (error, results) => {
        if (error) {
            console.log(error);
            res.status(501).json(error)
        } else {
            res.status(202).json(results);
        }
    })
})

router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const query = 'select * from usuario where email = ?';

    db.query(query, [email], async (error, results) => {
        if (results.length === 0) {
            return res.status(401).json('email ou senha incorretos')
        }

        const user = results[0]
        try {
            const isMatch = await bcrypt.compare(senha, user.senha)

            if (isMatch) {
                res.status(201).json('login realizado com sucesso')
            } else {
                res.status(401).json('usuario ou senha invalidos')

            }


        } catch (error) {
            console.log(error)
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