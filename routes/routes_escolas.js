const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const SECRET = 'sua_chave_secreta';

// Lista completa de escolas com necessidades
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM v_needs_with_school ORDER BY school_name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar escolas' });
  }
});

// Lista simples de escolas (para dropdowns, etc.)
router.get('/lista', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM schools ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar lista de escolas:', err);
    res.status(500).json({ error: 'Erro ao buscar lista de escolas' });
  }
});

// Dados da escola logada
router.get('/minha-escola', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  try {
    const decoded = jwt.verify(token, SECRET);
    const [rows] = await db.query(
      'SELECT id AS school_id, user_id, name FROM schools WHERE user_id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Escola não encontrada' });

    res.json(rows[0]); // Retorna school_id e user_id para controle no frontend
  } catch (err) {
    console.error('Erro ao verificar token:', err);
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
