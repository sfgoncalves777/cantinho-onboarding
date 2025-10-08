const database = require('../../database');

const companyCollection = 'companies';

const getCompany = async (tenant) => {
  const company = await database.getCollection(companyCollection).findOne({ tenant });
  if (!company) {
    throw new Error(`Company not found for tenant: ${tenant}`);
  };
  return company;
}

module.exports = { getCompany };
