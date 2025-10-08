const { MongoClient } = require('mongodb');

let client;
let db;

const uri = process.env.INTENT === 'test' ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_PRD;

async function connect() {
  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: parseInt(process.env.MAX_CONNNECTION_DB) || 10,
    });
    await client.connect();
    db = client.db(process.env.MONGODB_DB);
    console.log('Conectado ao MongoDB');
  }
  return db;
}


async function disconnect() {
  if (client) {
    await client.close();
    console.log('Conexão com MongoDB encerrada');
  }
}

function getCollection(name) {
  if (!db) {
    throw new Error('Banco de dados ainda não conectado. Chame connect() antes.');
  }
  return db.collection(name);
}

module.exports = { connect, disconnect, getCollection };
