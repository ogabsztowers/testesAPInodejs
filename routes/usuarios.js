import express from 'express';
import bcrypt from 'bcrypt';
import { db } from '../config/config.js';

const router = express.Router();

const saltRounds = 10;

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: API para gerenciamento de usuários
 */

/**
 * @swagger
 * /cadastro:
 *   post:
 *     summary: Cadastro de novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *               - nome
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *               nome:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       301:
 *         description: Usuário já cadastrado
 *       501:
 *         description: Erro no servidor
 */
router.post('/cadastro', async (req, res) => {
  const { email, senha, nome } = req.body;
  const chk = 'select * from usuario where email = ?';

  try {
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    db.query(chk, [email], (error, results) => {
      if (error) {
        return res.status(501).json(error);
      }
      if (results.length > 0) {
        return res.status(301).json(`Usuário ${results[0].email} já cadastrado`);
      }

      const query = 'insert into usuario (email, senha, nome) values (?, ?, ?);';

      db.query(query, [email, hashedPassword, nome], (error, results) => {
        if (error) {
          return res.status(501).json(error);
        }
        res.status(200).json(results);
      });
    });
  } catch (error) {
    console.log('Houve um erro inesperado');
    res.status(500).json({ error: 'Erro inesperado no servidor' });
  }
});

/**
 * @swagger
 * /exibirDadosUsuario/{id}:
 *   get:
 *     summary: Exibir dados do usuário com seus gostos
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID do usuário
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       202:
 *         description: Dados retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   gosto:
 *                     type: string
 *       501:
 *         description: Erro no servidor
 */
router.get('/exibirDadosUsuario/:id', (req, res) => {
  const { id } = req.params;
  const query = `select u.id, u.nome, g.nome as gosto from gostosUsuario gu 
    join gostos g on g.id = gu.nomeGosto
    join usuario u on u.id = gu.idUsuario where u.id = ?;`;

  db.query(query, [id], (error, results) => {
    if (error) {
      return res.status(501).json(error);
    }
    res.status(202).json(results);
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login do usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               senha:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Login efetuado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   type: object
 *       401:
 *         description: Email ou senha incorretos
 */
router.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const query = 'select * from usuario where email = ?';

  db.query(query, [email], async (error, results) => {
    if (results.length === 0) {
      return res.status(401).json('email ou senha incorretos');
    }

    const user = results[0];
    try {
      const isMatch = await bcrypt.compare(senha, user.senha);

      if (isMatch) {
        res.status(201).json({ usuario: results[0] });
      } else {
        res.status(401).json('usuario ou senha invalidos');
      }
    } catch (error) {
      res.status(500).json({ error: 'Erro inesperado no servidor' });
    }
  });
});

/**
 * @swagger
 * /exibir:
 *   get:
 *     summary: Exibir todos os usuários (id e nome)
 *     tags: [Usuários]
 *     responses:
 *       201:
 *         description: Lista de usuários retornada
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *       500:
 *         description: Erro no servidor
 */
router.get('/exibir', (req, res) => {
  const query = 'select id, nome from usuario';

  db.query(query, (error, results) => {
    if (error) {
      return res.status(500).json(error);
    }
    res.status(201).json(results);
  });
});

export default router;
