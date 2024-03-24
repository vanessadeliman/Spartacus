require('dotenv').config();
const tratamentoErro = require('../tratamento_erro/tratamento');
// Exporte o router para ser usado em outro lugar
module.exports = function() {
    const validaPermissao = (req, res, next) => {
        try {
            // Obtém o token do header da requisição
          const authHeader = req.headers['authorization'];
        
          if (!authHeader || !authHeader.startsWith('Basic ')) {
            throw new Error('Credenciais não fornecidas ou mal formatadas');
          }

          // Decodifica o valor de Base64
          const base64Credentials = authHeader.split(' ')[1];
          const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');

          if(credentials === process.env.JWT_SECRET_KEY){
            console.log('Usuário autorizado');
            return next(); 
          }else{
            throw new Error('Acesso recusado');
          }
        } catch (error) {
          error.code = 401;
          tratamentoErro(error, res);
        }
      };
    
    return validaPermissao; 
};