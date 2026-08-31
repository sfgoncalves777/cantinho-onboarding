const company = {
  name: 'Teste Cantinho',
  tenant: 'cantinho-teste',
  dns: 'www.cantinho.co',
  siteMode: 'both',
  gtm: 'GTM-XXXXXXXX',
  address: {
    street: 'Demonstração',
    number: 'X',
    district: 'X',
    city: 'X',
    state: 'XX',
  },
  contacts: [
    {
      label: 'Atendimento',
      number: '32984835145',
      hasWhatsapp: true,
      context: 'both'
    }
  ],
  citiesAndDistricts: [
    {
      "name": "Espera Feliz - MG",
      "districts": [
        "Área de Lazer",
        "Centro",
        "Floresta",
        "João Clara",
        "João do Roque",
        "Mineradora",
        "Novo Horizonte",
        "Patronato",
        "Retas",
        "Santa Cecília",
        "Santa Inês",
        "Santa Luzia",
        "São Francisco",
        "Vale do Sol 1",
        "Vale do Sol 2",
        "Waltair",
        "Zona Rural"
      ]
    }
  ]
};

const user = {
  name: 'Demonstração',
  email: 'demonstracao@gmail.com',
  password: '10203050',
  type: 'companyAdmin',
};

const theme = {
  logoFileName: 'logo.svg',
  faviconFileName: 'favicon.ico',
  contents: {
    home: {
      heroImageFileName: 'hero-image.svg',
      heroText: 'Demonstração',
      metaDescription: 'Encontre imóveis para comprar ou alugar. Casas, apartamentos, terrenos e oportunidades anunciadas por corretores e imobiliárias da sua cidade.'
    },
    about: {
      heroImageFileName: 'hero-image.svg',
      heroText: 'Demonstrativo.',
      metaDescription: 'Conheça o Cantinho, um marketplace imobiliário que conecta você a imóveis, corretores e imobiliárias da sua cidade.'
    },
    propertySale: {
      metaDescription: 'Encontre imóveis à venda em {{city}}. Casas, apartamentos, terrenos e oportunidades anunciadas por corretores e imobiliárias locais.'
    },
    propertyRent: {
      metaDescription: 'Encontre imóveis para alugar em {{city}}. Casas, apartamentos e oportunidades anunciadas por corretores e imobiliárias locais.'
    }
  },
  colors: {
    line: '#D0A616',
    background: '#F4F4F4',
    buttons: {
      transparent: {
        text: '#D0A616',
        border: '#D0A616'
      },
      solid: {
        background: '#D0A616',
        text: '#2C345C'
      },
      remove: {
        background: '#B21313',
        text: '#FCFDF5'
      }
    },
    text: {
      title: '#2C345C',
      default: '#2C345C',
      highlight: '#D0A616'
    },
    forms: {
      label: '#2C345C',
      input: {
        background: '#D5DADE',
        text: '#2C345C'
      }
    },
    ads: {
      background: '#fff',
      border: '#ddd',
      line: '#D0A616'
    }
  }
}

module.exports = { company, user, theme };
