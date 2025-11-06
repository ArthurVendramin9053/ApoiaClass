const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/escolas', require('./routes/routes_escolas'));
app.use('/cadastro', require('./routes/routes_cadastro'));
app.use('/login', require('./routes/routes_login'));
app.use('/necessidades', require('./routes/routes_adicionar-necessidades'));

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
