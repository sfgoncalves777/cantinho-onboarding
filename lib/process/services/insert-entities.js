const database = require('../../database');

const companyCollection = 'companies';
const userCollection = 'users';
const themeCollection = 'themes';
const citiesCoverageCollection = 'cities_coverage';

const insertEntity = (collectionName, entityData) => database.getCollection(collectionName).insertOne(entityData);

const insertEntities = async (company, user, theme, citiesCoverage) => {
  await insertEntity(companyCollection, company);
  await insertEntity(userCollection, user);
  await insertEntity(themeCollection, theme);
  await insertEntity(citiesCoverageCollection, citiesCoverage)
}

module.exports = { insertEntities };
