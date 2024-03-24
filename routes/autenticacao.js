const express = require('express');
const jwt = require('jsonwebtoken');
const verificaPermissao = require('../middlewares/valida_permissao');
const verificaToken = require('../middlewares/valida_token')
const { User, Empresa } = require('../schemas/schemas');
const bcrypt = require('bcrypt'); 
const tratamentoErro = require('../tratamento_erro/tratamento');
const gerarToken = require('../middlewares/gera_token');
const validaUsuario = require('../middlewares/valida_usuario');

module.exports = function() {
  const app = express();
  app.use(express.json());
  const router = express.Router();

      // http://localhost:3000/refresh
      router.get('/refresh', [verificaToken(), validaUsuario()], async (req, res) => {
        try {
          const dadosToken = {_id: req.user.userId, idsessao: req.headers['idsessao']};
          req.body.autorizacao = {};
          req.body.autorizacao.token = await gerarToken(dadosToken, '40m');

          const token = req.headers['authorization'];
          const decodedToken = jwt.decode(token, {complete: true});
          const expirationTime = decodedToken.payload.exp;
          const currentTime = Math.floor(Date.now() / 1000); 
          const timeToExpire = expirationTime - currentTime; 

          const threshold = 20 * 60;

          if (timeToExpire < threshold) {
            console.log('O token está prestes a vencer.');
            req.body.autorizacao.refresh_token = await gerarToken(dadosToken, '24h');
          } else {
            console.log('O token ainda é válido por um tempo suficiente.');
            req.body.autorizacao.refresh_token = req.headers['authorization'];
          }
  
          res.status(200).send(req.body);
        } catch (error) {
          tratamentoErro(error, res);
        }
      });

    // http://localhost:3000/registro      
    // {
    //     "nome": "Maria Viviane",
    //     "nomeUsu":"vanessa@gmail.com",
    //     "senhaUsu":"12345678",
    //     "idsessao":"2"
    // }
    router.post('/registro', verificaPermissao(), async (req, res) => {
      try {
        if(!req.body.idsessao){
          throw new Error("ID da sessão ausente");
        }

        console.log('Iniciando cadastro de novo usuário');
        const user = new User(req.body);
        const empresa = Empresa.findOne({ cnpj: req.body.cnpj });
       
        if(empresa != null) {
            user.empresa = empresa._id;
            await user.save();
    
            console.log('Usuário cadastrado com sucesso: '+user._id);
    
            req.body.autorizacao = {};
            req.body._id = user._id;
            req.body.autorizacao.token = await gerarToken(req.body, '40m');
            req.body.autorizacao.refresh_token = await gerarToken(req.body, '24h');
    
            res.status(200).send(req.body);
          } else{
            throw Error('Usuário não autorizado entre em contato com o suporte.');
        }

      } catch (error) {
        tratamentoErro(error, res);
      }
    });

    // http://localhost:3000/login      
    // {
    //     "nomeUsu":"vanessa@gmail.com",
    //     "senhaUsu":"12345678",
    //     "idsessao":"2"
    // }
    router.post('/login', async (req, res) => {
      const { nomeUsu, senhaUsu } = req.body;

      try {
        const user = await User.findOne({ nomeUsu });

        if (!user) {
          throw new Error("Não foi encontrado nenhum usuário com a credencial infomada");
        }

        const senhaCorreta = await bcrypt.compare(senhaUsu, user.senhaUsu);

        if (!senhaCorreta) {
          throw new Error("Usuário ou senha incorreta");
        }

        const dadosToken = {_id: user._id, idsessao: req.body.idsessao};
        req.body.autorizacao = {};
        req.body.autorizacao.token = await gerarToken(dadosToken, '40m');
        req.body.autorizacao.refresh_token = await gerarToken(dadosToken, '24h');
        
        res.status(200).json(req.body);
      } catch (error) {
        error.code = 401;
        tratamentoErro(error,res);
      }
    });

    return router;
};