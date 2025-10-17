const services = require('../services');

const stepFour = async (tenant) => {
  try {
    await services.getCompany(tenant);
    await services.uploadFiles(tenant);
  } catch (error) {
    console.log(`Erro inesperado. Erro: ${error}`);
  }
};

module.exports = { stepFour };
