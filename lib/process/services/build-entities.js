const bcrypt = require('bcryptjs');
const { capitalizeLetter } = require('../../utils');

const buildEntities = async (companyData, userData, themeData) => {
  const currentDate = new Date();
  const company = {
    name: capitalizeLetter(companyData.name, 'allFirstLetters'),
    tenant: companyData.tenant.toLowerCase(),
    dns: companyData.dns.toLowerCase(),
    siteMode: companyData.siteMode,
    gtm: companyData.gtm,
    directory: companyData.tenant.toLowerCase(),
    ...(companyData.creci && {
      creci: companyData.creci.map(creci => ({
        label: capitalizeLetter(creci.label, 'allFirstLetters'),
        number: creci.number
      }))
    }),
    address: {
      street: capitalizeLetter(companyData.address.street, 'allFirstLetters'),
      number: companyData.address.number,
      ...(companyData.address?.complement && { complement: capitalizeLetter(companyData.address.complement, 'allFirstLetters') }),
      district: capitalizeLetter(companyData.address.district, 'allFirstLetters'),
      city: capitalizeLetter(companyData.address.city, 'allFirstLetters'),
      state: companyData.address.state.toUpperCase(),
    },
    contacts: companyData.contacts.map(contact => ({
      label: capitalizeLetter(contact.label, 'allFirstLetters'),
      number: contact.number,
      hasWhatsapp: contact.hasWhatsapp,
      context: contact.context
    })),
    citiesAndDistricts: companyData.citiesAndDistricts.sort((a, b) => a.name.localeCompare(b.name)).map(city => ({
      name: capitalizeLetter(city.name, 'allFirstLetters'),
      districts: city.districts.sort((a, b) => a.localeCompare(b)).map(district => capitalizeLetter(district, 'allFirstLetters'))
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
          metaDescription: themeData.contents.about.metaDescription
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
  return { company, user, theme };
}

module.exports = { buildEntities };
