const fs = require('fs');
const path = require('path');

const tenantsMarketplaces = process.env.TENANTS_MARKETPLACES ? process.env.TENANTS_MARKETPLACES.split(',') : [];

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
  const GTM = company.GTM;
  const whatsapp = theme.theme.whatsapp;
  const faviconFileName = theme.theme.faviconFileName;
  const logoFileName = theme.theme.logoFileName;
  const colors = {
    lineColor: theme.theme.colors.line,
    backgroundColor: theme.theme.colors.background,
    adsBackgroundColor: theme.theme.colors.ads.background,
    addBorderColor: theme.theme.colors.ads.border,
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
  const pageAbout = {
    html: {
      name,
      GTM,
      whatsapp,
      faviconFileName,
      logoFileName,
      metaDescription: theme.theme.contents.about.metaDescription,
      heroText: theme.theme.contents.about.heroText,
      address: theme.theme.contents.about.address,
      city: theme.theme.contents.about.city,
      heroImageFileName: theme.theme.contents.about.heroImageFileName,
      phone: theme.theme.contents.about.phone,
      iconWhatsapp: icons.whatsapp
    }
  };
  const pageLogin = {
    html: {
      name,
      whatsapp,
      faviconFileName,
      logoFileName
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
      iconArrowLeft: icons['arrow-left']
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  const pageCreateSale = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left']
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  const pageEditRent = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left']
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  const pageEditSale = {
    html: {
      name,
      faviconFileName,
      logoFileName,
      iconArrowLeft: icons['arrow-left']
    },
    js: {
      urlBase: process.env.INTENT === 'test' ? process.env.URL_BASE_LOCAL : process.env.URL_BASE_PRD,
      citiesAndDistricts: JSON.stringify(company.citiesAndDistricts)
    }
  }
  return {
    colors,
    pageAbout,
    pageLogin,
    pageHomeAdministrative,
    pageRegisterRent,
    pageRegisterSale,
    pageCreateRent,
    pageCreateSale,
    pageEditRent,
    pageEditSale
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
  const targetDirectory = path.join(targetAppTenant, 'assets');
  fs.mkdirSync(targetDirectory, { recursive: true });
  const targetDirectoryIcons = path.join(targetDirectory, 'icons');
  fs.mkdirSync(targetDirectoryIcons, { recursive: true });
  const iconSourceFiles = path.join(__dirname, '../../../setup/files/icons')
  const iconFiles = fs.readdirSync(iconSourceFiles);
  for (const iconFile of iconFiles) {
    const oldPath = path.join(iconSourceFiles, iconFile);
    const newPath = path.join(targetDirectoryIcons, iconFile);
    fs.renameSync(oldPath, newPath);
  }
  const targetDirectoryImages = path.join(targetDirectory, 'images');
  fs.mkdirSync(targetDirectoryImages, { recursive: true });
  const imageSourceFiles = path.join(__dirname, '../../../setup/files/images')
  const imageFiles = fs.readdirSync(imageSourceFiles);
  for (const imageFile of imageFiles) {
    const oldPath = path.join(imageSourceFiles, imageFile);
    const newPath = path.join(targetDirectoryImages, imageFile);
    fs.renameSync(oldPath, newPath);
  }
}

const buildSite = async (tenant, company, theme) => {
  const {
    colors,
    pageAbout,
    pageLogin,
    pageHomeAdministrative,
    pageRegisterRent,
    pageRegisterSale,
    pageCreateRent,
    pageCreateSale,
    pageEditRent,
    pageEditSale
  } = buildReplaces(company, theme);
  const targetDirectoryTenant = process.env.INTENT === 'test'
    ? `../../../builds/${tenant}-test`
    : `../../../builds/${tenant}`;
  const pathTenant = path.join(__dirname, targetDirectoryTenant);

  fs.mkdirSync(pathTenant, { recursive: true });

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
    { css: colors, html: pageHomeAdministrative.html }
  );
  processPage(
    path.join(__dirname, '../../templates/pages/cadastro-imoveis-alugar'),
    path.join(pathTenant, 'administrativo/imoveis/alugar'),
    { css: colors, html: pageRegisterRent.html, js: pageRegisterRent.js }
  );
  processPage(
    path.join(__dirname, '../../templates/pages/cadastro-imoveis-vender'),
    path.join(pathTenant, 'administrativo/imoveis/vender'),
    { css: colors, html: pageRegisterSale.html, js: pageRegisterSale.js }
  );
  if (tenantsMarketplaces.includes(tenant)) {
    processPage(
      path.join(__dirname, '../../templates/pages/cadastrar-imovel-alugar-marketplace'),
      path.join(pathTenant, 'administrativo/imoveis/alugar/cadastrar'),
      { css: colors, html: pageCreateRent.html, js: pageCreateRent.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/cadastrar-imovel-vender-marketplace'),
      path.join(pathTenant, 'administrativo/imoveis/vender/cadastrar'),
      { css: colors, html: pageCreateSale.html, js: pageCreateSale.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/editar-imovel-alugar-marketplace'),
      path.join(pathTenant, 'administrativo/imoveis/alugar/editar'),
      { css: colors, html: pageEditRent.html, js: pageEditRent.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/editar-imovel-vender-marketplace'),
      path.join(pathTenant, 'administrativo/imoveis/vender/editar'),
      { css: colors, html: pageEditSale.html, js: pageEditSale.js }
    );
  } else {
    processPage(
      path.join(__dirname, '../../templates/pages/cadastrar-imovel-alugar'),
      path.join(pathTenant, 'administrativo/imoveis/alugar/cadastrar'),
      { css: colors, html: pageCreateRent.html, js: pageCreateRent.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/cadastrar-imovel-vender'),
      path.join(pathTenant, 'administrativo/imoveis/vender/cadastrar'),
      { css: colors, html: pageCreateSale.html, js: pageCreateSale.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/editar-imovel-alugar'),
      path.join(pathTenant, 'administrativo/imoveis/alugar/editar'),
      { css: colors, html: pageEditRent.html, js: pageEditRent.js }
    );
    processPage(
      path.join(__dirname, '../../templates/pages/editar-imovel-vender'),
      path.join(pathTenant, 'administrativo/imoveis/vender/editar'),
      { css: colors, html: pageEditSale.html, js: pageEditSale.js }
    );
  }
  processAssets(pathTenant);
};

module.exports = { buildSite };
