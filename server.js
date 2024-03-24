const express = require('express');
const mongoose = require('mongoose');
const consultas = require('./routes/consultas');
const cadastros = require('./routes/cadastros');
const cliente = require('./routes/cliente');
const cadastroUser = require('./routes/autenticacao');
const app = express();
const port = 3000;

// URL de conexão ao MongoDB
const uri = "mongodb://127.0.0.1:27017/Restaurante";

async function main() {
  try {
    mongoose.connect(uri)
    .then(() => console.log('Conectado ao MongoDB...'))
    .catch(err => console.error('Não foi possível conectar ao MongoDB...', err));
      
      // Mapeamento das rotas
      app.use(express.json());
      app.use('/', cadastroUser());
      app.use('/consultas', consultas());
      app.use('/cadastros', cadastros());
      app.use('/cliente', cliente());
  
      // Iniciar o servidor Express
      app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
      });
  } catch (e) {
    console.error(e);
  }
}

main().catch(console.error);

// Garantir que o cliente do MongoDB seja fechado quando o Node.js for encerrado
process.on('SIGINT', async () => {
  await client.close();
  process.exit();
});

