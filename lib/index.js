const dotenv = require('dotenv');
dotenv.config({ quiet: true });
const database = require('./database');
const controller = require('./process/controllers');

const processStep = process.argv[2];
const tenant = process.argv[3];

if (!['stepOne', 'stepTwo', 'stepThree', 'stepFour'].includes(processStep)) {
  console.log('Step inválido.');
  return;
}

if (['stepTwo', 'stepThree'].includes(processStep) && !tenant) {
  console.log(`Tenant é obrigatório para o ${processStep}.`);
  return;
}

(async () => {
  console.log(`Iniciando processo ${processStep}`);
  await database.connect();
  await controller[processStep](tenant);
  await database.disconnect();
  console.log(`Finalizado processo ${processStep}`);
})()