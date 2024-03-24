const express = require('express');
const validaToken = require('../middlewares/valida_token');
const validaUsuario = require('../middlewares/valida_usuario');
const { Prato, Adicional, Pedido } = require('../schemas/schemas');
const tratamentoErro = require('../tratamento_erro/tratamento');

async function insereOuAtualizaDado(tipo, parametro, dados){
  console.log('Corpo da Solicitação:', dados);
        
  const query = tipo.where(parametro);
  const dado = await query.findOne();
  if(!dado){
    console.log('Salvando registro...');
    const item = new tipo(dados);
    await item.save(); 
    console.log('Dado cadastrado com sucesso: '+item._id);
    dados._id = item._id;
  }else{
    console.log('Atualizando registro...');
    await dado.updateOne(dados);
    console.log('Atualizado com sucesso!');
  }
}

// Exporte o router para ser usado em outro lugar
module.exports = function() {
    const router = express.Router();
    router.use([validaToken(), validaUsuario()]);

    // http://localhost:3000/cadastros/prato
    router.post('/prato', async (req, res) => {
      try {
        if (!req.body) {
          throw new Error('Dados ausentes no corpo da solicitação.');
        }

        await insereOuAtualizaDado(Prato, {id: req.body.id}, req.body);
        
        res.status(201).json(req.body);
      } catch (error) {
        tratamentoErro(error, res);
      }
    });

    // http://localhost:3000/cadastros/adicionais
    router.post('/adicionais', async (req, res) => {
      try {
        if (!req.body) {
          throw new Error('Dados ausentes no corpo da solicitação.');
        }

        await insereOuAtualizaDado(Adicional, {id: req.body.id}, req.body);

        res.status(201).json(req.body);
      } catch (error) {
        tratamentoErro(error, res);
      }
    });

    // http://localhost:3000/cadastros/pedido
    router.post('/pedido', async (req, res) => {
      try {
        if (!req.body) {
          throw new Error('Dados ausentes no corpo da solicitação.');
        }

        await insereOuAtualizaDado(Pedido, {id: req.body.id}, req.body);

        res.status(201).json(req.body);
      } catch (error) {
        tratamentoErro(error, res);
      }
    });

    return router;
};