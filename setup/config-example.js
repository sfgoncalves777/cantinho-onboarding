const company = {
  name: '',
  tenant: '',
  dns: '',
  GTM: '',
  address: {
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
  },
  contact: {
    email: '',
    phone: '',
    whatsapp: ''
  },
  citiesAndDistricts: [
    {
      name: '',
      districts: []
    }
  ],
};

const user = {
  name: '',
  email: '',
  password: '',
  type: 'companyAdmin',
};

const theme = {
  logoFileName: '',
  faviconFileName: '',
  contents: {
    home: {
      heroImageFileName: '',
      heroText: '',
      metaDescription: ''
    },
    about: {
      heroImageFileName: '',
      heroText: '',
      metaDescription: ''
    },
    propertySale: {
      metaDescription: ''
    },
    propertyRent: {
      metaDescription: ''
    }
  },
  colors: {
    line: '',
    background: '',
    buttons: {
      transparent: {
        text: '',
        border: ''
      },
      solid: {
        background: '',
        text: ''
      },
      remove: {
        background: '',
        text: ''
      }
    },
    text: {
      title: '',
      default: '',
      highlight: ''
    },
    forms: {
      label: '',
      input: {
        background: '',
        text: ''
      }
    },
    ads: {
      background: '',
      border: ''
    }
  }
}

module.exports = { company, user, theme };
