const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 
const saltRounds = 10;
const Schema = mongoose.Schema;

async function insertOrUpdate(lista, tipo){
    for (let item of lista) {
        console.log('Corpo da Solicitação:', item);

        try {
          const dado = await tipo.findById(item._id);
          if(!dado){
            const valor = await tipo(item.toJSON()).save();
            console.log('Dado salvo com sucesso: '+valor._id);
            item._id = valor._id;
          }else{
            console.log('Atualizando dado: '+item.toJSON());
            await dado.updateOne(item.toJSON());
            item._id = dado._id;
          }
        } catch (err) {
          console.error('Erro ao salvar o dado:', err);
          break;
        }
      }
}


const userSchema = new mongoose.Schema({
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},
    nome: { type: String, required: [true, 'O campo nome é obrigatório.'] },
    nomeUsu: { type: String, required: [true, 'O campo email é obrigatório.'], unique: true },
    senhaUsu: {
        type: String,
        required: [true, 'O campo senha é obrigatório.'],
        minlength: [8, 'A senha deve ter no mínimo 8 caracteres']
      },
    cnpj: String
});

// Middleware para hashear a senha antes de salvar o usuário
userSchema.pre('save', function(next) {
    
    const user = this;

    // Somente hasheia a senha se ela foi modificada (ou é nova)
    if (!user.isModified('senhaUsu')) return next();

    // Gera um sal e hasheia a senha
    bcrypt.genSalt(saltRounds, function(err, salt) {
            if (err){
                console.log(err);
                return next(err);
            };

            bcrypt.hash(user.senhaUsu, salt, function(err, hash) {
            if (err){
                console.log(err);
                return next(err);
            };

            // Substitui a senha inserida pelo hash
            user.senhaUsu = hash;
            next();
            });
        });
    });

const enderecoSchema = new Schema({
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},
    rua:{ type: String, required: [true, 'O campo rua é obrigatório.'] },
    numero:{ type: String, required: [true, 'O campo numero é obrigatório.'] },
    bairro:{ type: String, required: [true, 'O campo bairro é obrigatório.'] },
    cidade:{ type: String, required: [true, 'O campo cidade é obrigatório.'] },
    uf:{ type: String, required: [true, 'O campo uf é obrigatório.'] },
    cep:{ type: String, required: [true, 'O campo cep é obrigatório.'] },
    complemento:{ type: String, required: [true, 'O campo complemento é obrigatório.'] },
    referencia:{ type: String, required: [true, 'O campo referência é obrigatório.'] },
});

const contatoSchema = new Schema({
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},
    telefone:String,
    whatsapp:String,
    email: { type: String, match: /^\S+@\S+\.\S+$/ }
});

const contaSchema = new Schema({
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},
    nome: { type: String, required: [true, 'O campo nome é obrigatório.'] },
    cpf: { type: String, required: [true, 'O campo cpf é obrigatório.'] },
    enderecos: {type:[{type :Schema.Types.ObjectId, ref: 'Endereco' }], validate: listaVazia('endereço')},
    contatos: {type:[{type:Schema.Types.ObjectId, ref: 'Contato' }], validate: listaVazia('contato')}
});

contaSchema.post('save', async function(doc, next) {
    const Contato = mongoose.model('contato', contatoSchema);
    const Endereco = mongoose.model('endereco', enderecoSchema);

    insertOrUpdate(doc.contatos, Contato);
    insertOrUpdate(doc.enderecos, Endereco);
  
    next();
  });

const adicionalSchema =  new mongoose.Schema({
    id: String,
    nome: { type: String, required: [true, 'O campo nome é obrigatório.'] },
    preco: { type: Number, required: [true, 'O campo preço é obrigatório.'] },
    disponivel: Boolean,
    gramas: Number,
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},
});

const saborSchema = new mongoose.Schema({
    nome: String,
    igredientes: [String],
    promocional: Boolean,
    desconto: Number,
    disponível: Boolean,
    estoqueMinimo: Number,
    estoqueAtual: Number,
    descricao: String,
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},
    preco: { type: Number, required: [true, 'O campo preço é obrigatório.'] },
});
  
const pratoSchema = new mongoose.Schema({
    nome: { type: String, required: [true, 'O campo nome é obrigatório.'] },
    promocional: Boolean,
    desconto: Number,
    adicionais: [{ type: Schema.Types.ObjectId, ref: 'Adicional' }],
    sabores: [saborSchema],
    gramas: { type: Number, required: [true, 'O campo gramas é obrigatório.'] },
    disponível: Boolean,
    descricao: { type: String, required: [true, 'O campo descrição é obrigatório.'] },
    imagem: {type: String, match: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/},
    preparo: Number,
    rendimento: Number,
    preco: Number,
    igredientes: [String],
    estoqueMinimo: Number,
    estoqueAtual: Number,
    observacao: String,
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},
});

const itemPedidoSchema = new mongoose.Schema({
    prato: { type: Schema.Types.ObjectId, ref: 'Prato' , required: [true, 'O campo prato é obrigatório.'] },
    quantidade: { type: Number, required: [true, 'O campo quantidade é obrigatório.'] },
    desconto: Number,
    adicionais: [{type: Schema.Types.ObjectId, ref: 'Adicional' }],
    sabor:  { type: Schema.Types.ObjectId, ref: 'Sabor' , required: [true, 'O campo sabor é obrigatório.'] },
    gramas: { type: Number, required: [true, 'O campo gramas é obrigatório.'] },
    valorUnitario: { type: Number, required: [true, 'O campo valor unitario é obrigatório.'] },
    valorTotal: { type: Number, required: [true, 'O campo valor total é obrigatório.'] },
    observacao: String,
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},

});

const pedidoSchema = new mongoose.Schema({
    cliente: { type: Schema.Types.ObjectId, ref: 'Conta' , required: [true, 'O campo conta é obrigatório.'] },
    endereco: { type:Schema.Types.ObjectId, ref: 'Endereco' },
    contato: {type:Schema.Types.ObjectId, ref: 'Contato' },
    status: {
        type: String, 
        'enum': [
        'Pendente',
        'Finalizado',
        'Cancelado',
        'Preparando',
        'Enviado'
      ], default: 'Pendente'},
    dataEmissao: { type: Date, default: Date.now },
    itens: [itemPedidoSchema],
    empresa:{type: Schema.Types.ObjectId, ref: 'Empresa' , required: [true, 'O campo empresa é obrigatório.']},
});

pedidoSchema.post('save', async function(doc, next) {
    const Item = mongoose.model('item', itemPedidoSchema);
    
    insertOrUpdate(doc.itens, Item);
  
    next();
  });

const empresaSchema = new mongoose.Schema({
    nome: {type: String, required: [true, 'O campo nome é obrigatório.']},
    cnpj: {type: String, required: [true, 'O campo cnpj é obrigatório.']},
    contato: {type: Schema.Types.ObjectId, ref: 'Contato' , required: [true, 'O campo contato é obrigatório.']},
    endereco: {type: Schema.Types.ObjectId, ref: 'Endereco' , required: [true, 'O campo endereço é obrigatório.']},
    inicioTurno: {type: String, required: [true, 'O campo horario de inicio é obrigatório.']},
    fimTurno: {type: String, required: [true, 'O campo horario de fim é obrigatório.']},
    semana: [{
        type: String, 
        'enum': [
        'Domingo',
        'Segunda',
        'Terca',
        'Quarta',
        'Quinta',
        'Sexta',
        'Sabado'
      ]}]
});

empresaSchema.post('save', async function(doc, next) {
    const Contato = mongoose.model('contato', contatoSchema);
    const Endereco = mongoose.model('endereco', enderecoSchema);

    insertOrUpdate(doc.contatos, Contato);
    insertOrUpdate(doc.enderecos, Endereco);
  
    next();
  });

module.exports = {
    User: mongoose.model('user', userSchema),
    Endereco: mongoose.model('endereco', enderecoSchema),
    Contato: mongoose.model('contato', contatoSchema),
    Conta: mongoose.model('contas', contaSchema),
    Item: mongoose.model('Item', itemPedidoSchema),
    Adicional: mongoose.model('adicional', adicionalSchema),
    Prato: mongoose.model('prato', pratoSchema),
    Pedido: mongoose.model('pedido', pedidoSchema),
    Empresa: mongoose.model('empresa', empresaSchema),
}

function listaVazia(tipo) {
    return {
        validator: function (arr) {
            return arr.length >= 1;
        },
        message: `É necessário ter pelo menos 1 ${tipo}.`
    };
}
