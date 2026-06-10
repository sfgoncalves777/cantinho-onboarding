const urlBase = '{{urlBase}}';
const citiesAndDistricts = {{citiesAndDistricts}};
let token

let processRequest = false;

const validateProcessRequest = (moment) => {
  const dialogLoading = document.getElementById('loading');

  const strategyProcess = {
    initial: () => {
      processRequest = true;
      dialogLoading.showModal();
    },
    finish: () => {
      processRequest = false;
      dialogLoading.close();
    }
  }
  return strategyProcess[moment]();
}

const commercialTypes = ['Sala', 'Loja', 'Galpão'];

const createOption = ({ value, label, disabled = false, selected = false, hidden = false }) => {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  option.disabled = disabled;
  option.selected = selected;
  option.hidden = hidden;
  return option;
};

const resetSelectOptions = (select, options) => {
  select.replaceChildren(
    createOption({
      value: '',
      label: 'Selecione',
      disabled: true,
      selected: true,
      hidden: true
    }),
    ...options.map(({ value, label }) =>
      createOption({ value, label })
    )
  );

  select.disabled = false;
};

const lockSelectAsNotApplicable = (select) => {
  select.replaceChildren(
    createOption({
      value: '0',
      label: 'Não aplicável',
      selected: true
    })
  );

  select.value = '0';
  select.disabled = true;
};

const handlePropertyTypeChange = () => {
  const typeSelect = document.getElementById('type');
  const roomsSelect = document.getElementById('rooms');
  const garageSpacesSelect = document.getElementById('garage_spaces');

  const isCommercial = commercialTypes.includes(typeSelect.value);

  if (isCommercial) {
    lockSelectAsNotApplicable(roomsSelect);
    return;
  }

  if (typeSelect.value === 'Lote') {
    lockSelectAsNotApplicable(roomsSelect);
    lockSelectAsNotApplicable(garageSpacesSelect);
    return;
  }

  resetSelectOptions(roomsSelect, [
    { value: '0', label: 'Não tem' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '+4' }
  ]);

  resetSelectOptions(garageSpacesSelect, [
    { value: '0', label: 'Não tem' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '+4' }
  ]);
};

const buildOption = (value, select) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  select.appendChild(option);
};

const buildCities = () => {
  const citySelect = document.getElementById("city");

  if (citySelect.options.length > 1) return;

  citiesAndDistricts.forEach((city) => {
    buildOption(city.name, citySelect)
  });
}

const handleCityChange = () => {
  const citySelect = document.getElementById("city");
  const districtSelect = document.getElementById("district");
  const selectedCity = citySelect.value;

  districtSelect.innerHTML = '<option value="" disabled selected hidden>Selecione</option>';

  const citySelected = citiesAndDistricts.find((city) => city.name === selectedCity)
  if (citySelected) {
    citySelected.districts.forEach(district => {
      buildOption(district, districtSelect)
    });
  }
}

function formatCurrency(input) {
  let value = input.value.replace(/\D/g, '');

  if (value.length > 11) {
    value = value.slice(0, 11);
  }

  value = (Number(value) / 100).toFixed(2);

  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  input.value = 'R$ ' + parts.join(',');
}

const parseValue = (value) => value.replace(/\s|R\$\s?/g, '').replace(/\./g, '').replace(',', '.');

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

let demandCriterias;

const calculateReach = async () => {
  if (processRequest) return;
  validateProcessRequest('initial');
  const city = document.getElementById("city").value;
  const district = document.getElementById("district").value;
  const type = document.getElementById('type').value;
  const rooms = document.getElementById('rooms').value;
  const garage_spaces = document.getElementById('garage_spaces').value;
  const value = parseValue(document.getElementById("value").value);

  if (!city || !district || !value || !type || !rooms || !garage_spaces) {
    validateProcessRequest('finish');
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const formStep = document.getElementById('stepForm');
  const resultStep = document.getElementById('stepResult');
  const notifyStep = document.getElementById('stepNotify');

  demandCriterias = {
    intent: 'sale',
    city,
    district,
    rooms: parseInt(rooms),
    value: parseFloat(value),
    propertyType: type,
    garageSpaces: parseInt(garage_spaces)
  }
  
  const resCalculated = await fetch(`${urlBase}/demands?${new URLSearchParams(demandCriterias).toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (resCalculated.status === 401) {
    validateProcessRequest('finish');
    window.location.href = '/login/index.html';
    return;
  }

  if (!resCalculated.ok) {
    validateProcessRequest('finish');
    alert('Erro ao calcular o alcance. Por favor, tente novamente.');
    return;
  }

  const allClientesSpan = document.getElementById('all_clients');
  const ownClientesSpan = document.getElementById('own_clients');
  const marketplaceClientesSpan = document.getElementById('marketplace_clients');
  const response = await resCalculated.json();
  const { countTenant, countMarketplace } = response;
  allClientesSpan.textContent = countTenant + countMarketplace;
  ownClientesSpan.textContent = countTenant;
  marketplaceClientesSpan.textContent = countMarketplace;
  formStep.classList.add('hiddenStep');
  resultStep.classList.remove('hiddenStep');
  notifyStep.classList.remove('hiddenStep');
  validateProcessRequest('finish');
};

const notifyClients = async () => {
  if (processRequest) return;
  validateProcessRequest('initial');
  const tenant_only = document.getElementById("tenant_only").value;
  const limit = document.getElementById("limit").value;
  const hour = new Date().getHours();

  if (hour < 8 || hour >= 20) {
    validateProcessRequest('finish');
    alert('Agora estamos fora do horário de notificações. Tente novamente entre 08:00 e 20:00.');
    window.location.href = '/administrativo/imoveis/vender/calcular-alcance/index.html';
    return;
  }

  if (!tenant_only || !limit) {
    validateProcessRequest('finish');
    alert('Por favor, preencha todos os campos.');
    return;
  }
  demandCriterias.tenantOnly = tenant_only === 'true';
  demandCriterias.limit = parseInt(limit);

  const resNotify = await fetch(`${urlBase}/demands/notify`, {
    method: 'POST',
    body: JSON.stringify(demandCriterias),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  validateProcessRequest('finish');
  if (resNotify.status === 401) {
    window.location.href = '/login/index.html';
    return;
  }

  if (!resNotify.ok) {
    alert('Erro ao enviar a notificação. Por favor, tente novamente.');
    return;
  }  
  alert('Recebemos sua solicitação e enviaremos as notificações!');
  window.location.href = '/administrativo/imoveis/vender/calcular-alcance/index.html';
}

const returnStep = () => {
  const formStep = document.getElementById('stepForm');
  const resultStep = document.getElementById('stepResult');
  const notifyStep = document.getElementById('stepNotify');

  formStep.classList.remove('hiddenStep');
  resultStep.classList.add('hiddenStep');
  notifyStep.classList.add('hiddenStep');
}


document.addEventListener('DOMContentLoaded', () => {
  function setBodyFullHeight() {
    const altura = window.innerHeight;
    document.body.style.minHeight = altura + "px";
  }

  window.addEventListener("load", setBodyFullHeight);
  window.addEventListener("resize", setBodyFullHeight);
  window.addEventListener("orientationchange", setBodyFullHeight);

  const user_name = getCookie('user_name');
  token = getCookie('token');
  if (!user_name || !token) {
    window.location.href = '/login/index.html';
    return;
  }
});