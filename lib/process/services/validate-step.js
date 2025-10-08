const db = require('../../database');

const processCollection = 'process';

const validateStep = async (tenant, step) => {
  if (!tenant) {
    return { valid: false, message: 'Tenant não informado.' };
  }
  const alreadyExist = await db.getCollection(processCollection).findOne({ tenant, type: 'onboarding', step, status: 'success' });
  if (alreadyExist) {
    return { valid: false, message: `O step ${step} já foi executado anteriormente.` };
  }
  return { valid: true };
}

module.exports = { validateStep };
