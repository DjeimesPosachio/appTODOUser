const { PrismaClient } = require('@prisma/client');
const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();
app.use(express.json());

const prisma = new PrismaClient();

app.post('/users', async (req, res) => {
  const { nome, email, senha } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashedPassword
      }
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Senha incorreta.' });
      return;
    }

    res.json({ message: 'Login bem-sucedido!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});