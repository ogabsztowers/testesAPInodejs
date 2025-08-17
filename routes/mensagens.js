import express from 'express';
import { db } from '../config/config.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.json());

/**
 * @swagger
 * tags:
 *   name: Mensagens
 *   description: API para gerenciamento de mensagens
 */

export default (io) => {

  /**
   * @swagger
   * /addMensagem:
   *   post:
   *     summary: Adiciona uma nova mensagem
   *     tags: [Mensagens]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mensagem
   *               - idRemetente
   *               - idDestinatario
   *             properties:
   *               mensagem:
   *                 type: string
   *               idRemetente:
   *                 type: integer
   *               idDestinatario:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Mensagem adicionada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *       501:
   *         description: Erro ao adicionar mensagem
   */
  router.post('/addMensagem', (req, res) => {
    const { mensagem, idRemetente, idDestinatario } = req.body;
    const query = 'insert into mensagens (mensagem, idRemetente, idDestinatario) values(?,?,?)';

    db.query(query, [mensagem, idRemetente, idDestinatario], (erro, results) => {
      if (erro) {
        return res.status(501).json(erro);
      }
      res.status(201).json(results);
    });
  });

  /**
   * @swagger
   * /getMensagens/{idUsuario1}/{idUsuario2}:
   *   get:
   *     summary: Busca mensagens trocadas entre dois usuários
   *     tags: [Mensagens]
   *     parameters:
   *       - in: path
   *         name: idUsuario1
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do primeiro usuário
   *       - in: path
   *         name: idUsuario2
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID do segundo usuário
   *     responses:
   *       200:
   *         description: Lista de mensagens retornada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *       501:
   *         description: Erro ao buscar mensagens
   */
  router.get('/getMensagens/:idUsuario1/:idUsuario2', (req, res) => {
    const { idUsuario1, idUsuario2 } = req.params;

    const query = 'SELECT * FROM mensagens WHERE (idRemetente = ? AND idDestinatario = ?) OR (idRemetente = ? AND idDestinatario = ?) ORDER BY id ASC';

    db.query(query, [idUsuario1, idUsuario2, idUsuario2, idUsuario1], (erro, results) => {
      if (erro) {
        return res.status(501).json(erro);
      }
      res.status(200).json(results);
    });
  });

  /**
   * @swagger
   * /deletarMensagem/{id}:
   *   delete:
   *     summary: Deleta uma mensagem e opcionalmente um arquivo relacionado
   *     tags: [Mensagens]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID da mensagem a ser deletada
   *     requestBody:
   *       description: Dados opcionais para deletar arquivo e informar sala
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fileUrl:
   *                 type: string
   *                 description: URL do arquivo a ser deletado
   *               roomId:
   *                 type: string
   *                 description: ID da sala para notificar sobre a deleção
   *     responses:
   *       200:
   *         description: Mensagem e arquivo deletados com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *       501:
   *         description: Erro ao deletar mensagem ou arquivo
   */
  router.delete('/deletarMensagem/:id', (req, res) => {
    const { id } = req.params;
    const { fileUrl, roomId } = req.body;

    const query = 'delete from mensagens where id = ?';

    db.query(query, [id], (error, results) => {
      if (error) {
        return res.status(501).json(error);
      }

      if (fileUrl) {
        const filePath = path.join(__dirname, '..', 'public', fileUrl);

        fs.unlink(filePath, (err) => {
          if (err) {
          }
        });
      }

      io.to(roomId).emit('mensagemDeletada', { id });

      res.status(200).json({ message: 'Mensagem e arquivo deletados com sucesso.' });
    });
  });

  return router;
};
