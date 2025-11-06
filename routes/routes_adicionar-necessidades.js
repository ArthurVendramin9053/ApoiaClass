const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const SECRET = 'sua_chave_secreta';

// Adicionar necessidade
router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, SECRET);
    const { school_id, item_name, quantity, description } = req.body;

    const [rows] = await db.query(
      'SELECT id FROM schools WHERE id = ? AND user_id = ?',
      [school_id, decoded.userId]
    );
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Escola não pertence ao usuário' });
    }

    await db.query('CALL sp_add_need (?, ?, ?, ?)', [
      school_id,
      item_name,
      quantity,
      description
    ]);
    res.status(201).json({ message: 'Necessidade adicionada com sucesso' });
  } catch (err) {
    console.error('Erro ao adicionar necessidade:', err);
    res.status(400).json({ error: 'Erro ao adicionar necessidade' });
  }
});

// Excluir necessidade
router.delete('/:id', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, SECRET);
    const needId = parseInt(req.params.id);

    // Verifica se a necessidade pertence à escola do usuário
    const [rows] = await db.query(`
      SELECT n.id FROM needs n
      JOIN schools s ON s.id = n.school_id
      WHERE n.id = ? AND s.user_id = ?
    `, [needId, decoded.userId]);

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir esta necessidade.' });
    }

    await db.query('DELETE FROM needs WHERE id = ?', [needId]);
    res.json({ message: 'Necessidade excluída com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir necessidade:', err);
    res.status(500).json({ error: 'Erro ao excluir necessidade.' });
  }
});

module.exports = router;
