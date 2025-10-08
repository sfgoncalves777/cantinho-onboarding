const config = require('../../../setup/config-current.js');
const services = require('../services/index.js');

const stepOne = async () => {
  try {
    const resultValidateStep = await services.validateStep(config.company?.tenant, 'stepOne');
    if (!resultValidateStep.valid) {
      return console.log(`Error: ${resultValidateStep.message}`);
    };
    const resultValidateProcess = await services.validateProcess(
      config.company?.tenant,
      config.company,
      config.user,
      config.theme
    );
    if (!resultValidateProcess.valid) {
      return console.log(`Error: ${resultValidateProcess.message}`);
    };
    const { company, user, theme, citiesCoverage } = await services.buildEntities(config.company, config.user, config.theme);
    await services.insertEntities(company, user, theme, citiesCoverage);
    await services.buildSite(company.tenant, company, theme);
    await services.insertProcess(company.tenant, 'stepOne');
  } catch (error) {
    console.log(`Erro inesperado. Erro: ${error}`);
  }
}

module.exports = { stepOne };