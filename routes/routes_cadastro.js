const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

router.post('/', async (req, res) => {
  const {
    email,
    username,
    password,
    name,
    address_line,
    neighborhood,
    city,
    state,
    contact_email,
    contact_phone
  } = req.body;

  // Validação básica dos campos obrigatórios
  if (!email || !username || !password || !name || !address_line || !city || !state) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const [userResult] = await db.query(
      'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
      [email, username, password_hash]
    );

    const user_id = userResult.insertId;

    await db.query(
      'INSERT INTO schools (user_id, name, address_line, neighborhood, city, state, contact_email, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, name, address_line, neighborhood || '', city, state, contact_email, contact_phone]
    );

    res.status(201).json({ message: 'Escola cadastrada com sucesso' });
  } catch (err) {
    console.error('Erro ao cadastrar escola:', err);
    res.status(500).json({ error: 'Erro ao cadastrar escola. Verifique os dados e tente novamente.' });
  }
});

module.exports = router;
