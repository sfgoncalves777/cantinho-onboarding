const company = {
  name: 'Campos Ribeiro Imóveis',
  tenant: 'campos-ribeiro-imoveis',
  dns: 'www.camposribeiroimoveis.cantinho.co',
  siteMode: 'both',
  gtm: 'GTM-XXXXXXX',
  address: {
    street: 'Rua Teste',
    number: '491',
    district: 'Bairro Teste',
    city: 'Carangola',
    state: 'MG',
  },
  contacts: [
    {
      label: 'Telefone',
      number: '32984835145',
      hasWhatsapp: true,
      context: 'both'
    }
  ],
  citiesAndDistricts: [
    {
      name: 'Carangola - MG',
      districts: [
        'Aeroporto',
        'Amendoeira',
        "Caixa D'Água",
        'Centro',
        'Chevrand',
        'Coroado',
        'Eldorado',
        'Floresta',
        'Lacerdina',
        'Novos Tempos',
        'Ouro Verde',
        'Panorama',
        'Santa Emília',
        'Santa Maria',
        'Santo Onofre',
        'Triângulo',
        'Varginha',
        'Zona Rural'
      ]
    },
  ],
  creci: [
    {
      label: 'Silvani Gonçalves Campos Ribeiro',
      number: '12345-F/MG'
    }
  ]
};

const user = {
  name: 'Demonstração',
  email: 'camposribeiroimoveis@gmail.com',
  password: '10203050',
  type: 'companyAdmin',
};

const theme = {
  logoFileName: 'logo.svg',
  faviconFileName: 'favicon.svg',
  contents: {
    home: {
      heroImageFileName: 'hero-image.svg',
      heroText: 'Transformamos seu sonho em realidade.',
      metaDescription: 'Encontre os melhores imóveis com Campos Ribeiro Imóveis'
    },
    about: {
      heroImageFileName: 'hero-image.svg',
      heroText: 'Conheça a Campos Ribeiro Imóveis e nossa dedicação em oferecer atendimento de qualidade, transparência e as melhores oportunidades para você comprar / vender e alugar.',
      metaDescription: 'Saiba mais sobre a Campos Ribeiro Imóveis.'
    },
    propertySale: {
      metaDescription: 'Confira imóveis à venda em {{city}}. Casas, apartamentos e terrenos com ótimas oportunidades para você investir ou morar.'
    },
    propertyRent: {
      metaDescription: 'Encontre imóveis para alugar em {{city}}. Opções ideais para morar com praticidade, segurança e excelente custo-benefício.'
    }
  },
  colors: {
    line: '#303092',
    background: '#F4F4F4',
    buttons: {
      transparent: {
        text: '#303092',
        border: '#303092'
      },
      solid: {
        background: '#303092',
        text: '#FCFDF5'
      },
      remove: {
        background: '#B21313',
        text: '#F2F2F2'
      }
    },
    text: {
      title: '#201D1E',
      default: '#201D1E',
      highlight: '#303092'
    },
    forms: {
      label: '#201D1E',
      input: {
        background: '#D5DADE',
        text: '#201D1E'
      }
    },
    ads: {
      background: '#fff',
      border: '#ddd',
      line: '#303092'
    }
  }
}

module.exports = { company, user, theme };
