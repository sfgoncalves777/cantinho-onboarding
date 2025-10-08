const company = {
  name: 'cantinho teste',
  tenant: 'cantinho-teste',
  dns: 'www.cantinho.co',
  GTM: 'GTM-N4N2WW7K',
  address: {
    street: 'Rua Caiana',
    number: '491',
    district: 'área de lazer',
    city: 'Espera Feliz',
    state: 'MG',
  },
  contact: {
    email: 'silvani@gmail.com',
    phone: '32984835145',
    whatsapp: '32984835145'
  },
  citiesAndDistricts: [
    {
      name: 'espera feliz - mg',
      districts: ['Centro', 'João Clara']
    }
  ],
};

const user = {
  name: 'teste',
  email: 'teste@mail.com',
  password: '511150',
  type: 'companyAdmin',
};

const theme = {
  logoFileName: 'logo.svg',
  faviconFileName: 'favicon.ico',
  contents: {
    home: {
      heroImageFileName: 'hero-image.svg',
      heroText: 'Estamos aqui para ajudar você a encontrar o seu canto ideal.',
      metaDescription: 'No Cantinho você encontra casas e apartamentos para alugar ou comprar nas principais cidades. Acesse agora e veja as ofertas.'
    },
    about: {
      heroImageFileName: 'hero-image.svg',
      heroText: 'Nossa missão é potencializar a relação entre locadores e locatários / compradores e vendedores, oferecendo soluções tecnológicas que simplificam e agilizam o processo de locação e venda de imóveis, garantindo uma experiência mais eficiente e transparente para todos os envolvidos.',
      metaDescription: 'No Cantinho.co, conectamos pessoas ao imóvel ideal. Descubra quem somos e como ajudamos você a encontrar seu próximo lar com facilidade.'
    },
    propertySale: {
      metaDescription: 'Encontre casas e apartamentos para comprar em {{city}}. Encontre o imóvel ideal com fotos, localização e valor do imóvel.'
    },
    propertyRent: {
      metaDescription: 'Encontre casas e apartamentos para alugar em {{city}}. Encontre o imóvel ideal com fotos, localização e valor do aluguel.'
    }
  },
  colors: {
    line: '#D0A616',
    background: '#f4f4f4',
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
      border: '#ddd'
    }
  }
}

module.exports = { company, user, theme };
