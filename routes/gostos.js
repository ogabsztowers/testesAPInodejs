import express from 'express';
import { db } from '../config/config.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Gostos
 *   description: API para gerenciamento de gostos e gostos do usuário
 */

 /**
  * @swagger
  * /addGosto:
  *   post:
  *     summary: Adiciona um novo gosto
  *     tags: [Gostos]
  *     requestBody:
  *       required: true
  *       content:
  *         application/json:
  *           schema:
  *             type: object
  *             required:
  *               - nome
  *             properties:
  *               nome:
  *                 type: string
  *     responses:
  *       202:
  *         description: Gosto inserido com sucesso
  *       303:
  *         description: Gosto já inserido
  *       501:
  *         description: Erro ao inserir gosto
  */
router.post('/addGosto', (req, res) => {
    const { nome } = req.body;
    const chk = 'select * from gostos where nome = ?';

    db.query(chk, [nome], (error, results) => {
        if (error) {
            return res.status(501).json(error);
        } 
        if (results.length > 0) {
            return res.status(303).json('gosto ja inserido');
        }
        
        const query = 'insert into gostos (nome) values (?);';
        db.query(query, [nome], (error, results) => {
            if (error) {
                return res.status(500).json(error);
            } 
            res.status(202).json(results);
        });
    });
});

/**
 * @swagger
 * /exibirGostos:
 *   get:
 *     summary: Exibe todos os gostos
 *     tags: [Gostos]
 *     responses:
 *       201:
 *         description: Lista de gostos retornada com sucesso
 *       404:
 *         description: Erro ao encontrar gostos
 *       501:
 *         description: Erro na consulta dos gostos
 */
router.get('/exibirGostos', (req, res) => {
    const query = 'select * from gostos';

    db.query(query, (error, results) => {
        if (error) {
            return res.status(501).json(error);
        } 
        if (results.length > 0) {
            return res.status(201).json(results);
        }
        res.status(404).json('erro ao encontrar gosto');
    });
});

/**
 * @swagger
 * /apagarGosto/{id}:
 *   delete:
 *     summary: Apaga um gosto pelo ID, removendo também as referências na tabela gostosUsuario
 *     tags: [Gostos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do gosto a ser deletado
 *     responses:
 *       202:
 *         description: Gosto apagado com sucesso
 *       501:
 *         description: Erro ao deletar gosto
 */
router.delete('/apagarGosto/:id', (req, res) => {
    const { id } = req.params;
    const del2 = 'delete from gostosUsuario where nomeGosto = ?';

    db.query(del2, [id], (error, results) => {
        if (error) {
            return res.status(501).json(error);
        }

        const query = 'delete from gostos where id = ?';

        db.query(query, [id], (error, result) => {
            if (error) {
                return res.status(501).json(error);
            }
            res.status(202).json({result, results});
        });
    });
});

/**
 * @swagger
 * /gostoUsuarioAdd:
 *   post:
 *     summary: Associa um gosto a um usuário
 *     tags: [Gostos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idUsuario
 *               - nomeGosto
 *             properties:
 *               idUsuario:
 *                 type: integer
 *               nomeGosto:
 *                 type: integer
 *     responses:
 *       202:
 *         description: Gosto associado ao usuário com sucesso
 *       303:
 *         description: Gosto já associado ao usuário
 *       501:
 *         description: Erro ao associar gosto
 */
router.post('/gostoUsuarioAdd', (req, res) => {
    const { idUsuario, nomeGosto } = req.body;
    const chk = 'select * from gostosUsuario where idUsuario = ? and nomeGosto = ?';

    db.query(chk, [idUsuario, nomeGosto], (error, results) => {
        if (error) {
            return res.status(501).json(error);
        }
        if (results.length > 0) {
            return res.status(303).json('erro');
        }

        const query = 'insert into gostosUsuario (idUsuario, nomeGosto) values (?,?);';
        db.query(query, [idUsuario, nomeGosto], (error, results) => {
            if (error) {
                return res.status(500).json(error);
            }
            res.status(202).json(results);
        });
    });
});

/**
 * @swagger
 * /gostosUsuario/{id}:
 *   get:
 *     summary: Exibe gostos associados a um usuário
 *     tags: [Gostos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       201:
 *         description: Lista de gostos do usuário retornada com sucesso
 *       501:
 *         description: Erro ao buscar gostos do usuário
 */
router.get('/gostosUsuario/:id', (req, res) => {
    const { id } = req.params;
    const query = `
      select gu.id, g.nome as nome_gosto, u.email 
      from gostosUsuario gu 
      join gostos g on g.id = gu.nomeGosto 
      join usuario u on u.id = gu.idUsuario 
      where u.id = ?;
    `;

    db.query(query, [id], (error, results) => {
        if (error) {
            return res.status(501).json(error);
        }
        res.status(201).json(results);
    });
});

/**
 * @swagger
 * /deletarGostoUsuario/{id}:
 *   delete:
 *     summary: Remove uma associação de gosto de usuário pelo ID da associação
 *     tags: [Gostos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da associação a ser removida
 *     responses:
 *       202:
 *         description: Associação deletada com sucesso
 *       501:
 *         description: Erro ao deletar associação
 */
router.delete('/deletarGostoUsuario/:id', (req, res) => {
    const { id } = req.params;
    const query = 'delete from gostosUsuario where id = ?';

    db.query(query, [id], (error, results) => {
        if (error) {
            return res.status(501).json(error);
        }
        res.status(202).json(results);
    });
});

export default router;
