const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = 'sua_chave_secreta'; // idealmente usar variável de ambiente

router.post('/', async (req, res) => {
  const { user, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [user, user]
    );

    if (rows.length === 0) return res.status(401).json({ error: 'Usuário não encontrado' });

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ userId: rows[0].id }, SECRET, { expiresIn: '2h' });

    res.json({ message: 'Login bem-sucedido', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
});

module.exports = router;
