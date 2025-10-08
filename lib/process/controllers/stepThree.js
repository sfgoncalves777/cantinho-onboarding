const services = require('../services');

const stepThree = async (tenant) => {
  try {
    const resultValidateStep = await services.validateStep(tenant, 'stepThree');
    if (!resultValidateStep.valid) {
      return console.log(`Error: ${resultValidateStep.message}`);
    };
    const company = await services.getCompany(tenant);
    const resultValidateCertificate = await services.validateCertificate(tenant, company);
    if (!resultValidateCertificate.valid) {
      return console.log(`Error: ${resultValidateCertificate.message}`);
    };
    const { distributionId } = await services.createCdn(tenant, company);
    await services.updatePolicy(distributionId);
    const eventBridgeRuleArns = await services.createEventBridgeRule(tenant);
    await services.addLambdaPermissionForEventBridge(tenant, eventBridgeRuleArns);
    await services.insertProcess(tenant, 'stepThree');
  } catch (error) {
    console.log(`Erro inesperado. Erro: ${error}`);
  }
};

module.exports = { stepThree };
