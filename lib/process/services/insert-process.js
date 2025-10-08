const db = require('../../database');
const processCollection = 'process';

const insertProcess = async (tenant, step) => {
  const process = { tenant, type: 'onboarding', step, status: 'success', createdAt: new Date() };
  await db.getCollection(processCollection).insertOne(process);
}

module.exports = { insertProcess };
