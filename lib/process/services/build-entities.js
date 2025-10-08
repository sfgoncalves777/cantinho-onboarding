const bcrypt = require('bcryptjs');
const { capitalizeLetter } = require('../../utils');

const buildEntities = async (companyData, userData, themeData) => {
  const currentDate = new Date();
  const company = {
    name: capitalizeLetter(companyData.name, 'allFirstLetters'),
    tenant: companyData.tenant.toLowerCase(),
    dns: companyData.dns.toLowerCase(),
    GTM: companyData.GTM,
    directory: companyData.tenant.toLowerCase(),
    address: {
      street: capitalizeLetter(companyData.address.street, 'allFirstLetters'),
      number: companyData.address.number,
      ...(companyData.address?.complement && { complement: capitalizeLetter(companyData.address.complement, 'allFirstLetters') }),
      district: capitalizeLetter(companyData.address.district, 'allFirstLetters'),
      city: capitalizeLetter(companyData.address.city, 'allFirstLetters'),
      state: companyData.address.state.toUpperCase(),
    },
    contact: {
      email: companyData.contact.email.toLowerCase(),
      phone: companyData.contact.phone,
      whatsapp: companyData.contact.whatsapp
    },
    citiesAndDistricts: companyData.citiesAndDistricts.map(city => ({
      name: capitalizeLetter(city.name, 'allFirstLetters'),
      districts: city.districts.map(district => capitalizeLetter(district, 'allFirstLetters'))
    })),
    status: {
      name: 'active',
      timestamp: currentDate
    },
    createdAt: currentDate,
    updatedAt: currentDate
  }
  const user = {
    name: capitalizeLetter(userData.name, 'allFirstLetters'),
    email: userData.email.toLowerCase(),
    password: await bcrypt.hash(userData.password, 10),
    type: userData.type,
    tenant: company.tenant,
    status: {
      name: 'active',
      timestamp: currentDate
    },
    createdAt: currentDate,
    updatedAt: currentDate
  };
  const theme = {
    theme: {
      logoFileName: themeData.logoFileName,
      faviconFileName: themeData.faviconFileName,
      whatsapp: company.contact.whatsapp,
      contents: {
        home: {
          heroImageFileName: themeData.contents.home.heroImageFileName,
          heroText: themeData.contents.home.heroText,
          metaDescription: themeData.contents.home.metaDescription
        },
        about: {
          heroImageFileName: themeData.contents.about.heroImageFileName,
          heroText: themeData.contents.about.heroText,
          address: `${company.address.street}, nº ${company.address.number} ${company.address.complement ? company.address.complement : ''}, ${company.address.district}`,
          city: `${company.address.city} - ${company.address.state}`,
          metaDescription: themeData.contents.about.metaDescription,
          phone: company.contact.phone.length === 11
            ? company.contact.phone.replace(/(\d{2})(\d)(\d{4})(\d{4})/, '$1 $2 $3 $4')
            : company.contact.phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1 $2 $3')
        },
        propertySale: {
          metaDescription: themeData.contents.propertySale.metaDescription
        },
        propertyRent: {
          metaDescription: themeData.contents.propertyRent.metaDescription
        }
      },
      colors: themeData.colors
    },
    tenant: company.tenant,
    createdAt: currentDate,
    updatedAt: currentDate
  };
  const citiesCoverage = {
    dns: company.dns,
    tenant: company.tenant,
    cities: []
  };
  return { company, user, theme, citiesCoverage };
}

module.exports = { buildEntities };
