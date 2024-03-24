const express = require('express');
const { Conta } = require('../schemas/schemas');
const validaToken = require('../middlewares/valida_token');
const validaUsuario = require('../middlewares/valida_usuario');

// Exporte o router para ser usado em outro lugar
module.exports = function() {
    const router = express.Router();
    router.use([validaToken(), validaUsuario()]);

    // http://localhost:3000/consultas/contas
    router.get('/pedidos', async (req, res) => {
        try {
          // Acessar os parâmetros de busca da URL
          // const id = req.query.id;
          // const cpf = req.query.cpf;
    
          // let parametros = {};
          // if (id) parametros['id'] = { $regex: id, $options: 'i' };
          // if (cpf) parametros['cpf'] = cpf;
          //TODO buscar por data
    
          // Acessar os parâmetros de busca da URL
          const collection = await Pedido.find(parametros);
          res.status(200).json(collection);
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
    });

    return router;
};