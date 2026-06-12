const company = {
  name: 'Cantinho Client Sale',
  tenant: 'cantinho-client-sale',
  dns: 'www.test-client-sale.cantinho.co',
  siteMode: 'sale',
  gtm: 'GTM-5V53PR5N',
  address: {
    street: 'Rua caiana',
    number: '491',
    district: 'Área de Lazer',
    city: 'Espera Feliz',
    state: 'MG',
  },
  contacts: [
    {
      label: 'Equipe Cantinho',
      number: '32984128641',
      hasWhatsapp: true,
      context: 'general'
    },
    {
      label: 'Silvani - Founder',
      number: '32984835145',
      hasWhatsapp: true,
      context: 'both'
    }
  ],
  citiesAndDistricts: [
    {
      name: 'Espera Feliz - MG',
      districts: [
        'Área de Lazer',
        'Centro',
        'Floresta',
        'João Clara',
        'João do Roque',
        'Mineradora',
        'Novo Horizonte',
        'Patronato',
        'Retas',
        'Santa Cecília',
        'Santa Inês',
        'Santa Luzia',
        'São Francisco',
        'Vale do Sol 1',
        'Vale do Sol 2',
        'Waltair',
        'Zona Rural'
      ]
    },
  ]
};

const user = {
  name: 'Silvani Gonçalves',
  email: 'gosilvani@gmail.com',
  password: '10203050',
  type: 'companyAdmin',
};

const theme = {
  logoFileName: 'logo.svg',
  faviconFileName: 'favicon.ico',
  contents: {
    home: {
      heroImageFileName: 'hero-image.svg',
      heroText: 'Estamos aqui para ajudar você a contrar o seu cantinho.',
      metaDescription: 'Encontre imóveis para alugar e comprar nas cidades atendidas pelo Cantinho. Casas, apartamentos, terrenos e imóveis comerciais'
    },
    about: {
      heroImageFileName: 'hero-image.svg',
      heroText: 'O Cantinho nasceu com o objetivo de facilitar a conexão entre pessoas que procuram imóveis e os profissionais que os anunciam.\nNossa proposta é reunir os imóveis disponíveis de cada cidade em um único lugar, tornando a busca mais simples para quem procura e a divulgação mais eficiente para corretores e imobiliárias.\nAlém do marketplace, oferecemos ferramentas para ajudar profissionais do mercado imobiliário a divulgar seus imóveis, organizar sua presença digital e se conectar com potenciais clientes.',
      metaDescription: 'Conheça o Cantinho, uma plataforma que conecta pessoas que procuram imóveis a corretores e imobiliárias locais, tornando a busca e a divulgação mais simples e eficiente.'
    },
    propertySale: {
      metaDescription: 'Encontre casas, apartamentos, terrenos e imóveis comerciais para à venda em {{city}} no Cantinho.'
    },
    propertyRent: {
      metaDescription: 'Encontre casas, apartamentos, terrenos e imóveis comerciais para alugar em {{city}} no Cantinho.'
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
        text: '#F2F2F2'
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
