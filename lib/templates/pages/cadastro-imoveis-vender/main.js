const urlBase = '{{urlBase}}';

let properties = [];
let propertiesFiltered = [];
let processFilter = false;

const getCookie = (name) => {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

const logout = () => {
  document.cookie = 'user_name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  window.location.href = '/login/index.html';
}

const capitalizeLetter = (string, type) => {
  const lowercaseWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'no', 'na', 'nos', 'nas'];

  const strategy = {
    firstLetter: (str) =>
      str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),

    allFirstLetters: (str) =>
      str
        .toLowerCase()
        .split(' ')
        .map((word, index) => {
          if (index > 0 && lowercaseWords.includes(word)) {
            return word;
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ')
  };

  return strategy[type](string);
};

document.addEventListener('DOMContentLoaded', async () => {
  const user_name = getCookie('user_name');
  const token = getCookie('token');
  if (!user_name || !token) {
    window.location.href = '/login/index.html';
    return;
  }

  const res = await fetch(`${urlBase}/properties?intent=sale`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (res.status === 401) {
    window.location.href = '/login/index.html';
    return;
  }

  if (!res.ok) {
    alert('Erro ao carregar os imóveis. Por favor, recarregue a página.');
    return;
  }

  const { properties: propertiesResponse } = await res.json();
  properties = propertiesResponse;

  const buildComponentFragment = (property) => {
    const fragment = document.createDocumentFragment();
    const { _id, address, responsible } = property;
    const link = document.createElement('a');
    link.href = `/administrativo/imoveis/vender/editar/index.html?id=${_id}`;
    const article = document.createElement('article');
    const name = document.createElement('p');
    name.textContent = capitalizeLetter(responsible.owner_name, 'allFirstLetters');
    const city = document.createElement('p');
    city.textContent = address.city;
    const addressLine = document.createElement('p');
    let fullAddress = `${capitalizeLetter(address.street, 'allFirstLetters')}, n ${address.number}, ${capitalizeLetter(address.district, 'allFirstLetters')}`;
    if (address.complement) {
      fullAddress += `, ${capitalizeLetter(address.complement, 'allFirstLetters')}`;
    }
    addressLine.textContent = fullAddress;
    article.appendChild(name);
    article.appendChild(city);
    article.appendChild(addressLine);
    link.appendChild(article);
    fragment.appendChild(link);
    return fragment;
  }

  const propertiesContainer = document.getElementById('properties_container');
  properties.forEach(property => {
    const propertyComponent = buildComponentFragment(property);
    propertiesContainer.appendChild(propertyComponent);
  });

  const propertiesFilteredContainer = document.getElementById('properties_filtered_container');
  const selectStatusProperty = document.getElementById('select_status_property');
  selectStatusProperty.addEventListener('mousedown', (event) => {
    if (processFilter) {
      event.preventDefault();
      alert('Já existe um filtro em execução. Por favor, aguarde.');
    }
  });

  selectStatusProperty.addEventListener('change', async (event) => {
    propertiesFilteredContainer.innerHTML = '';
    const selectedStatusValue = event.target.value;
    if (selectedStatusValue === 'all') {
      propertiesFilteredContainer.style.display = 'none';
      propertiesContainer.style.display = 'block';
      propertiesFiltered = [];
      processFilter = false;
      return;
    }
    processFilter = true;
    selectStatusProperty.disabled = true;
    propertiesFiltered = properties.filter(property => property.property_status.status === selectedStatusValue);
    if (!propertiesFiltered.length) {
      selectStatusProperty.value = 'all';
      processFilter = false;
      selectStatusProperty.disabled = false;
      propertiesFilteredContainer.style.display = 'none';
      propertiesContainer.style.display = 'block';
      alert('Nenhum imóvel encontrado com o status selecionado e todos os imóveis estão sendo exibidos.');
      return;
    }
    propertiesFiltered.forEach(property => {
      const propertyComponent = buildComponentFragment(property);
      propertiesFilteredContainer.appendChild(propertyComponent);
    });
    processFilter = false;
    selectStatusProperty.disabled = false;
    propertiesFilteredContainer.style.display = 'block';
    propertiesContainer.style.display = 'none';
  });
});