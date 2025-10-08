const services = require('../services');

const stepTwo = async (tenant) => {
  try {
    const resultValidateStep = await services.validateStep(tenant, 'stepTwo');
    if (!resultValidateStep.valid) {
      return console.log(`Error: ${resultValidateStep.message}`);
    };
    await services.getCompany(tenant);
    await services.uploadFiles(tenant);
    await services.requestCertificate(tenant);
    await services.insertProcess(tenant, 'stepTwo');
  } catch (error) {
    console.log(`Erro inesperado. Erro: ${error}`);
  }
};

module.exports = { stepTwo };
