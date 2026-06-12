const fs = require('fs');
const path = require('path');

const tenantMarketplace = process.env.TENANT_MARKETPLACE;

const slugifyCity = (cityName) => cityName
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/ç/g, "c")
  .replace(/Ç/g, "c")
  .toLowerCase()
  .trim()
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9-]/g, "")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

const loadFilesIcons = () => {
  const icons = {};

  const folderPath = path.join(__dirname, '../../templates/icons');
  const files = fs.readdirSync(folderPath);


  files.forEach(file => {
    const fullPath = path.join(folderPath, file);

    if (fs.statSync(fullPath).isFile()) {
      const ext = path.extname(file);
      const nameWithoutExt = path.basename(file, ext);
      const content = fs.readFileSync(fullPath, 'utf8');
      icons[nameWithoutExt] = content;
    }
  });

  return icons;
}

const buildReplaces = (company, theme) => {
  const icons = loadFilesIcons();
  const name = company.name;
  const gtm = company.gtm;
  const faviconFileName = theme.theme.faviconFileName;
  const logoFileName = theme.theme.logoFileName;
  const citiesOptions = JSON.stringify(
    company.citiesAndDistricts
      .map(cityAndDistrict => ({ value: slugifyCity(cityAndDistrict.name), label: cityAndDistrict.name })));
  const colors = {
    lineColor: theme.theme.colors.line,
    backgroundColor: theme.theme.colors.background,
    adsBackgroundColor: theme.theme.colors.ads.background,
    adsBorderColor: theme.theme.colors.ads.border,
    adsLineColor: theme.theme.colors.ads.line,
    buttonsTransparentTextColor: theme.theme.colors.buttons.transparent.text,
    buttonsTransparentBorderColor: theme.theme.colors.buttons.transparent.border,
    buttonsSolidBackgroundColor: theme.theme.colors.buttons.solid.background,
    buttonsSolidTextColor: theme.theme.colors.buttons.solid.text,
    buttonsRemoveBackgroundColor: theme.theme.colors.buttons.remove.background,
    buttonsRemoveTextColor: theme.theme.colors.buttons.remove.text,
    textTitleColor: theme.theme.colors.text.title,
    textDefaultColor: theme.theme.colors.text.default,
    textHiglightColor: theme.theme.colors.text.highlight,
    formsLabelColor: theme.theme.colors.forms.label,
    formsInputBackgroundColor: theme.theme.colors.forms.input.background,
    formsInputTextColor: theme.theme.colors.forms.input.text
  };
  const pageHome = {
    html: {
      name,
      gtm,
      faviconFileName,
      logoFileName,
      metaDescription: theme.theme.contents.home.metaDescription,
      heroText: theme.theme.contents.home.heroText,
      heroImageFileName: theme.theme.contents.home.heroImageFileName,
      iconMap: icons.map,
      iconDollar: icons.dollar,
      iconCalendar: icons.calendar
    },
    js: {
      siteMode: company.siteMode,
      citiesOptions,
      contactOptions: JSON.stringify(company.contacts)
    }
  }
  const pageAbout = {
    html: {
      name,
      gtm,
      faviconFileName,
      logoFileName,
      contactOptions: JSON.stringify(company.contacts),
      creci: company.creci ? JSON.stringify(company.creci) : JSON.stringify([]),
      metaDescription: theme.theme.contents.about.metaDescription,
      heroText: theme.theme.contents.about.heroText,
      address: theme.theme.contents.about.address,
      city: theme.theme.contents.about.city,
      heroImageFileName: theme.theme.contents.about.heroImageFileName
    }
  };
  const pagePropertieSalesCity = {
    html: {
      name,
      faviconFileName,
      gtm,
      logoFileName,
      iconSearch: icons.search,
      iconHome: icons.home,
      iconDollar: icons.dollar,
      iconDetail: icons.detail,
      iconMap: icons.map,
      iconWhatsapp: icons.whatsapp,
      iconArrowLeft: icons['arrow-left'],
      iconLoading: icons.loading
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesOptions,
      isMarketplace: tenantMarketplace === company.tenant,
      tenant: company.tenant,
      contactOptions: JSON.stringify(company.contacts),
      iconArrowLeftClean: icons['arrow-left-clean'],
      iconArrowRightClean: icons['arrow-right-clean'],
      iconHome: icons.home,
      iconDetail: icons.detail,
      iconOwner: icons.owner,
      iconWhatsapp: icons.whatsapp,
      iconArrowLeft: icons['arrow-left'],
      iconSearch: icons.search,
      iconArea: icons.square
    }
  };
  const pagePropertieRentsCity = {
    html: {
      name,
      faviconFileName,
      gtm,
      logoFileName,
      iconSearch: icons.search,
      iconHome: icons.home,
      iconDollar: icons.dollar,
      iconAccepets: icons.accepets,
      iconDetail: icons.detail,
      iconMap: icons.map,
      iconWhatsapp: icons.whatsapp,
      iconArrowLeft: icons['arrow-left'],
      iconLoading: icons.loading
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesOptions,
      isMarketplace: tenantMarketplace === company.tenant,
      tenant: company.tenant,
      contactOptions: JSON.stringify(company.contacts),
      iconArrowLeftClean: icons['arrow-left-clean'],
      iconArrowRightClean: icons['arrow-right-clean'],
      iconHome: icons.home,
      iconDetail: icons.detail,
      iconOwner: icons.owner,
      iconWhatsapp: icons.whatsapp,
      iconArrowLeft: icons['arrow-left'],
      iconSearch: icons.search,
      iconAccepets: icons.accepets,
      iconNotAccepets: icons['not-accepets'],
      iconArea: icons.square
    }
  };
  const pageLogin = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconLoading: icons.loading
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD
    }
  }
  const pageHomeAdministrative = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconCalendar: icons.calendar,
      iconDollar: icons.dollar
    },
    js: {
      siteMode: company.siteMode
    }
  }
  const pageRegisterRent = {
    html: {
      name,
      faviconFileName,
      logoFileName
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD
    }
  }
  const pageRegisterSale = {
    html: {
      name,
      faviconFileName,
      logoFileName
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD
    }
  }
  const pageCreateRent = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left'],
      iconLoading: icons.loading
    },
    js: {
      isMarketplace: tenantMarketplace === company.tenant,
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  const pageCreateSale = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left'],
      iconLoading: icons.loading
    },
    js: {
      isMarketplace: tenantMarketplace === company.tenant,
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  const pageEditRent = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left'],
      iconLoading: icons.loading
    },
    js: {
      isMarketplace: tenantMarketplace === company.tenant,
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  const pageEditSale = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left'],
      iconLoading: icons.loading
    },
    js: {
      isMarketplace: tenantMarketplace === company.tenant,
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  const pageRegisterDemand = {
    html: {
      name,
      faviconFileName,
      gtm,
      logoFileName,
      iconDetail: icons.detail,
      iconHome: icons.home,
      iconMap: icons.map,
      iconSearch: icons.search,
      iconDollar: icons.dollar,
      iconAccepets: icons.accepets,
      iconArrowLeft: icons['arrow-left'],
      iconWhatsapp: icons.whatsapp,
      iconLoading: icons.loading
    },
    js: {
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts),
      tenant: company.tenant,
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      siteMode: company.siteMode,
      contactOptions: JSON.stringify(company.contacts)
    }
  }
  const pageNotifySale = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left'],
      iconLoading: icons.loading
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  const pageNotifyRent = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left'],
      iconLoading: icons.loading
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }

  return {
    colors,
    pageHome,
    pageAbout,
    pagePropertieSalesCity,
    pagePropertieRentsCity,
    pageLogin,
    pageHomeAdministrative,
    pageRegisterRent,
    pageRegisterSale,
    pageCreateRent,
    pageCreateSale,
    pageEditRent,
    pageEditSale,
    pageRegisterDemand,
    pageNotifySale,
    pageNotifyRent
  };
}

const processFilePage = (sourceFile, targetFile, replaces) => {
  let content = fs.readFileSync(sourceFile, 'utf-8');

  for (const key in replaces) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, replaces[key]);
  }

  fs.writeFileSync(targetFile, content, 'utf-8');
};

const processPage = (sourcePage, targetPage, replaces) => {
  fs.mkdirSync(targetPage, { recursive: true });

  const files = fs.readdirSync(sourcePage);
  for (const file of files) {
    const sourceFile = path.join(sourcePage, file);
    const targetFile = path.join(targetPage, file);

    const ext = path.extname(file).slice(1);
    processFilePage(sourceFile, targetFile, replaces[ext]);
  }
};

const processAssets = (targetAppTenant) => {
  const iconSourceFiles = path.join(__dirname, '../../../setup/files/icons')
  const iconFiles = fs.readdirSync(iconSourceFiles);
  let targetDirectory;
  if (iconFiles.length > 0) {
    targetDirectory = path.join(targetAppTenant, 'assets');
    fs.mkdirSync(targetDirectory, { recursive: true });
    const targetDirectoryIcons = path.join(targetDirectory, 'icons');
    fs.mkdirSync(targetDirectoryIcons, { recursive: true });
    for (const iconFile of iconFiles) {
      const oldPath = path.join(iconSourceFiles, iconFile);
      const newPath = path.join(targetDirectoryIcons, iconFile);
      fs.renameSync(oldPath, newPath);
    }
  }
  const imageSourceFiles = path.join(__dirname, '../../../setup/files/images')
  const imageFiles = fs.readdirSync(imageSourceFiles);
  if (imageFiles.length > 0) {
    if (!targetDirectory) {
      targetDirectory = path.join(targetAppTenant, 'assets');
      fs.mkdirSync(targetDirectory, { recursive: true });
    }
    const targetDirectoryImages = path.join(targetDirectory, 'images');
    fs.mkdirSync(targetDirectoryImages, { recursive: true });
    for (const imageFile of imageFiles) {
      const oldPath = path.join(imageSourceFiles, imageFile);
      const newPath = path.join(targetDirectoryImages, imageFile);
      fs.renameSync(oldPath, newPath);
    }
  };
}

const processPagesPropertiesCities = (company, theme, sourcePage, targetPage, replacesComon, propertyType) => {
  const templateMetaDescription = theme.theme.contents?.[propertyType].metaDescription;
  const citiesAndDistricts = company.citiesAndDistricts;

  for (const cityAndDistrict of citiesAndDistricts) {
    const city = cityAndDistrict.name;
    const citySlug = slugifyCity(city);
    const metaDescription = templateMetaDescription.replace('{{city}}', city);
    const districtsOptions = JSON.stringify(cityAndDistrict.districts);
    const replaces = {
      html: {
        ...replacesComon.html,
        city,
        metaDescription
      },
      js: {
        ...replacesComon.js,
        districtsOptions,
        city: city
      }
    };
    processPage(
      sourcePage,
      path.join(targetPage, citySlug),
      replaces
    );
  };
}

const buildSite = async (tenant, company, theme) => {
  const {
    colors,
    pageAbout,
    pageHome,
    pagePropertieSalesCity,
    pagePropertieRentsCity,
    pageLogin,
    pageHomeAdministrative,
    pageRegisterRent,
    pageRegisterSale,
    pageCreateRent,
    pageCreateSale,
    pageEditRent,
    pageEditSale,
    pageRegisterDemand,
    pageNotifyRent,
    pageNotifySale,
  } = buildReplaces(company, theme);
  const targetDirectoryTenant = process.env.INTENT === 'test'
    ? `../../../builds/${tenant}-test`
    : `../../../builds/${tenant}`;
  const pathTenant = path.join(__dirname, targetDirectoryTenant);

  fs.mkdirSync(pathTenant, { recursive: true });

  processPage(
    path.join(__dirname, '../../templates/pages/home-page'),
    pathTenant,
    { css: colors, html: pageHome.html, js: pageHome.js }
  );

  processPage(
    path.join(__dirname, '../../templates/pages/sobre'),
    path.join(pathTenant, 'sobre'),
    { css: colors, html: pageAbout.html }
  );
  processPage(
    path.join(__dirname, '../../templates/pages/login'),
    path.join(pathTenant, 'login'),
    { css: colors, html: pageLogin.html, js: pageLogin.js }
  );

  processPage(
    path.join(__dirname, '../../templates/pages/home-administrativo'),
    path.join(pathTenant, 'administrativo'),
    { css: colors, html: pageHomeAdministrative.html, js: pageHomeAdministrative.js }
  );

  if (company.siteMode === 'both' || company.siteMode === 'sale') {
    processPage(
      path.join(__dirname, '../../templates/pages/imoveis-vender'),
      path.join(pathTenant, 'imoveis/venda'),
      { css: colors }
    );

    processPagesPropertiesCities(
      company,
      theme,
      path.join(__dirname, '../../templates/pages/imoveis-vender-cidade'),
      path.join(pathTenant, 'imoveis/venda'),
      pagePropertieSalesCity,
      'propertySale'
    );

    processPage(
      path.join(__dirname, '../../templates/pages/cadastro-imoveis-vender'),
      path.join(pathTenant, 'administrativo/imoveis/vender'),
      { css: colors, html: pageRegisterSale.html, js: pageRegisterSale.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/calcular-alcance-vender'),
      path.join(pathTenant, 'administrativo/imoveis/vender/calcular-alcance'),
      { css: colors, html: pageNotifySale.html, js: pageNotifySale.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/cadastrar-imovel-vender'),
      path.join(pathTenant, 'administrativo/imoveis/vender/cadastrar'),
      { css: colors, html: pageCreateSale.html, js: pageCreateSale.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/editar-imovel-vender'),
      path.join(pathTenant, 'administrativo/imoveis/vender/editar'),
      { css: colors, html: pageEditSale.html, js: pageEditSale.js }
    );
  }

  if (company.siteMode === 'both' || company.siteMode === 'rent') {
    processPage(
      path.join(__dirname, '../../templates/pages/imoveis-alugar'),
      path.join(pathTenant, 'imoveis/alugar'),
      { css: colors }
    );

    processPagesPropertiesCities(
      company,
      theme,
      path.join(__dirname, '../../templates/pages/imoveis-alugar-cidade'),
      path.join(pathTenant, 'imoveis/alugar'),
      pagePropertieRentsCity,
      'propertyRent'
    );

    processPage(
      path.join(__dirname, '../../templates/pages/cadastro-imoveis-alugar'),
      path.join(pathTenant, 'administrativo/imoveis/alugar'),
      { css: colors, html: pageRegisterRent.html, js: pageRegisterRent.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/calcular-alcance-alugar'),
      path.join(pathTenant, 'administrativo/imoveis/alugar/calcular-alcance'),
      { css: colors, html: pageNotifyRent.html, js: pageNotifyRent.js }
    );

    processPage(
      path.join(__dirname, '../../templates/pages/cadastrar-imovel-alugar'),
      path.join(pathTenant, 'administrativo/imoveis/alugar/cadastrar'),
      { css: colors, html: pageCreateRent.html, js: pageCreateRent.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/editar-imovel-alugar'),
      path.join(pathTenant, 'administrativo/imoveis/alugar/editar'),
      { css: colors, html: pageEditRent.html, js: pageEditRent.js }
    );
  }

  processPage(
    path.join(__dirname, '../../templates/pages/ser-avisado'),
    path.join(pathTenant, 'ser-avisado'),
    { css: colors, html: pageRegisterDemand.html, js: pageRegisterDemand.js }
  );

  processAssets(pathTenant);
};

module.exports = { buildSite };
