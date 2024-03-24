const express = require('express');
const { Pedido, Conta } = require('../schemas/schemas');
const tratamentoErro = require('../tratamento_erro/tratamento');

//TODO colocar isso em um arquivo separado
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

    // http://localhost:3000/cliente/pedido
    router.get('/pedido', async (req, res) => {
        try {
        //   Acessar os parâmetros de busca da URL
          const cpf = req.query.body.cpf;
    
          let parametros = {};
          if (cpf) parametros['cpf'] = cpf;
          //TODO buscar por data
    
          // Acessar os parâmetros de busca da URL
          const collection = await Pedido.find(parametros);
          res.status(200).json(collection);
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
    });

    
    // http://localhost:3000/cliente/novo
    router.post('/novo', async (req, res) => {
        try {
            if (!req.body) {
                throw new Error('Dados ausentes no corpo da solicitação.');
            }
    
            await insereOuAtualizaDado(Conta, {id: req.body.id}, req.body);
            res.status(201).json(req.body);
        } catch (error) {
            tratamentoErro(error, res);
        }
    });

    // http://localhost:3000/cliente/solicitacao
    router.post('/solicitacao', async (req, res) => {
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