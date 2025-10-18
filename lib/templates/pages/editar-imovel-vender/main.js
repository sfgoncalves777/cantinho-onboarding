const urlBase = '{{urlBase}}';
const citiesAndDistricts = {{citiesAndDistricts}};

let token
let propertyId;
let property_available_from;
let imageUrls = [];

const logout = () => {
  document.cookie = 'user_name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  window.location.href = '/login/index.html';
}

const capitalizeLetter = (string, type) => {
  if (!string) {
    return;
  }
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

const getCookie = (name) => {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
}

function formatCurrency(input) {
  let value = input.value.replace(/\D/g, '');

  // Limita a 11 dígitos (100.000.000,00)
  if (value.length > 11) {
    value = value.slice(0, 11);
  }

  value = (Number(value) / 100).toFixed(2);

  // Quebra em partes para formatar os milhares
  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  input.value = 'R$ ' + parts.join(',');
}

const buildOption = (value, select, selected = false) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  if (selected) {
    option.selected = selected;
  }
  select.appendChild(option);
};

const buildCities = (cityNameSelected) => {
  const citySelect = document.getElementById("city");
  if (citySelect.options.length > 1) return;

  citiesAndDistricts.forEach((city) => {
    buildOption(city.name, citySelect, city.name === cityNameSelected);
  });
}

const handleCityChange = () => {
  const citySelect = document.getElementById("city");
  const districtSelect = document.getElementById("district");
  const selectedCity = citySelect.value;

  districtSelect.innerHTML = '<option disabled selected hidden>Selecione</option>';

  const citySelected = citiesAndDistricts.find((city) => city.name === selectedCity)
  if (citySelected) {
    citySelected.districts.forEach(district => {
      buildOption(district, districtSelect)
    });
  }
}

let currentIdImageField;
let countImageFields;

let currentIdCostsField = 0;
let countCostsFields = 0;

const handleImageChange = (event, fieldId) => {
  const image = event.target;
  const image_field = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  const preview = image_field.querySelector('img.preview');
  const placeholder = image_field.querySelector('.placeholder');
  const file = image.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const urlImage = new URL(preview.src);
      const relativePathImage = urlImage.pathname;
      if (imageUrls.includes(relativePathImage)) {
        const updateImageUrls = imageUrls.filter(url => url !== relativePathImage);
        imageUrls = updateImageUrls;
      }
      preview.src = reader.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    }
    reader.readAsDataURL(file);
  }
}

const removeCostsField = (fieldId) => {
  const additionalCostField = document.querySelector(`#costs > div[data-field-id="${fieldId}"]`);
  if (countCostsFields <= 1) {
    const selectName = additionalCostField.querySelector('select[name="name_cost"]');
    const inputValue = additionalCostField.querySelector('input[name="value_cost"]');
    const selectFrequency = additionalCostField.querySelector('select[name="frequency_cost"]');
    selectName.value = '';
    inputValue.value = '';
    selectFrequency.value = '';
  } else {
    additionalCostField.remove();
    countCostsFields--;
  }
}

const addCostsField = (builded, cost, index) => {
  if (!builded) {
    currentIdCostsField++;
    countCostsFields++;
  }

  const container = document.getElementById('costs');

  const fieldId = builded ? index : currentIdCostsField;
  const costField = document.createElement('div');
  costField.dataset.fieldId = fieldId;

  const fieldsetName = document.createElement('fieldset');

  const labelName = document.createElement('label');
  labelName.htmlFor = `name_cost_${fieldId}`;
  labelName.textContent = 'Despesa';

  const selectName = document.createElement('select');
  selectName.name = 'name_cost';
  selectName.id = `name_cost_${fieldId}`;

  const defaultOptionName = document.createElement('option');
  defaultOptionName.value = '';
  defaultOptionName.disabled = true;
  defaultOptionName.selected = true;
  defaultOptionName.hidden = true;
  defaultOptionName.textContent = 'Selecione';
  selectName.appendChild(defaultOptionName);

  const nameOptions = [
    'Condomínio',
    'IPTU',
    'Água',
    'Gás',
    'Internet',
    'Luz',
    'Portaria',
    'Serviços extras',
    'TV a cabo',
    'Taxa de limpeza',
    'Taxa de lixo',
    'Taxa de manutenção',
    'Vaga de garagem'
  ]

  nameOptions.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    option.selected = builded && cost && cost.name === value;
    selectName.appendChild(option);
  });

  fieldsetName.appendChild(labelName);
  fieldsetName.appendChild(selectName);
  costField.appendChild(fieldsetName);

  const itemDiv = document.createElement('div');
  itemDiv.className = 'item';

  const fieldsetValue = document.createElement('fieldset');

  const labelValue = document.createElement('label');
  labelValue.htmlFor = `value_cost_${fieldId}`;
  labelValue.textContent = 'Valor';

  const inputValue = document.createElement('input');
  inputValue.type = 'text';
  inputValue.name = 'value_cost';
  inputValue.id = `value_cost_${fieldId}`;
  inputValue.oninput = function () {
    formatCurrency(this);
  };
  inputValue.value = builded && cost ? Math.round(cost.value * 100).toString() : '';
  if (builded) {
    formatCurrency(inputValue);
  }
  fieldsetValue.appendChild(labelValue);
  fieldsetValue.appendChild(inputValue);

  const fieldsetFrequency = document.createElement('fieldset');

  const labelFrequency = document.createElement('label');
  labelFrequency.htmlFor = `frequency_cost_${fieldId}`;
  labelFrequency.textContent = 'Frequência';

  const selectFrequency = document.createElement('select');
  selectFrequency.name = 'frequency_cost';
  selectFrequency.id = `frequency_cost_${fieldId}`;

  const defaultOptionFreq = document.createElement('option');
  defaultOptionFreq.value = '';
  defaultOptionFreq.disabled = true;
  defaultOptionFreq.selected = true;
  defaultOptionFreq.hidden = true;
  defaultOptionFreq.textContent = 'Selecione';
  selectFrequency.appendChild(defaultOptionFreq);

  const freqOptions = [
    'Mensal',
    'Anual',
    'Única'
  ];

  freqOptions.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    option.selected = builded && cost && cost.frequency === value;
    selectFrequency.appendChild(option);
  });

  fieldsetFrequency.appendChild(labelFrequency);
  fieldsetFrequency.appendChild(selectFrequency);

  itemDiv.appendChild(fieldsetValue);
  itemDiv.appendChild(fieldsetFrequency);
  costField.appendChild(itemDiv);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = 'Remover despesa';
  removeBtn.onclick = () => removeCostsField(fieldId);

  costField.appendChild(removeBtn);

  container.appendChild(costField);
}

const removeImageField = (fieldId) => {
  const image_field = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  const preview = image_field.querySelector('img.preview');
  const urlImage = new URL(preview.src);
  const relativePathImage = urlImage.pathname;
  if (imageUrls.includes(relativePathImage)) {
    const updateImageUrls = imageUrls.filter(url => url !== relativePathImage);
    imageUrls = updateImageUrls;
  }
  if (countImageFields <= 3) {
    const input = image_field.querySelector('input[type="file"]');
    const preview = image_field.querySelector('img.preview');
    const placeholder = image_field.querySelector('.placeholder');
    input.value = '';
    preview.src = '';
    preview.style.display = 'none';
    placeholder.style.display = 'block';
  } else {
    image_field.remove();
    countImageFields--;
  }
}

const parseValue = (value) => value.replace(/\s|R\$\s?/g, '').replace(/\./g, '').replace(',', '.');

const addImageField = (builded, url, index) => {
  if (!builded) {
    currentIdImageField++;
    countImageFields++;
  }
  const container = document.getElementById('images');
  const fieldId = builded ? index : currentIdImageField;
  const image_field = document.createElement('div');
  image_field.className = 'image_field';
  image_field.dataset.fieldId = fieldId;

  const image_box = document.createElement('label');
  image_box.className = 'image_box';

  const placeholder = document.createElement('span');
  placeholder.className = 'placeholder';
  placeholder.textContent = 'Enviar imagem';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (event) => handleImageChange(event, fieldId);

  const preview = document.createElement('img');
  preview.className = 'preview';
  if (builded && url) {
    preview.src = url;
  }
  preview.style.display = builded && url ? 'block' : 'none';

  image_box.appendChild(placeholder);
  image_box.appendChild(input);
  image_box.appendChild(preview);

  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remover imagem';
  removeButton.type = 'button';
  removeButton.onclick = () => removeImageField(fieldId);

  image_field.appendChild(image_box);
  image_field.appendChild(removeButton);
  container.appendChild(image_field);

};

function getBuildAvailability(targetDateStr) {
  if (!targetDateStr) return 'indeterminada';

  const today = new Date();
  const targetDate = new Date(targetDateStr);

  if (targetDate <= today) return 'imediata';

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();
  const targetDay = targetDate.getDate();

  let monthsDiff = (targetYear - todayYear) * 12 + (targetMonth - todayMonth);

  // Se o dia futuro for maior que o dia atual, arredonda para o mês seguinte
  if (targetDay > todayDay) {
    monthsDiff += 1;
  }

  if (monthsDiff <= 0) return 'imediata';
  if (monthsDiff <= 6) return '6m';
  if (monthsDiff <= 12) return '1a';
  if (monthsDiff <= 36) return '3a';
}

const buildData = () => {
  const errors = [];

  const property_status_input = document.getElementById('select_status_property').value;
  const availability_input = document.getElementById('availability').value;
  const publishInput = document.getElementById('publish').value;
  if (!property_status_input) errors.push('Informe a situação do imóvel.');
  if (!availability_input) errors.push('Informe a disponibilidade.');
  if (!publishInput) errors.push('Informe o campo publicar.');
  const publish = publishInput === 'true';

  if (!publish && property_status_input === 'available') {
    alert('Imóvel com status "disponível" deve ser publicado.');
    return null;
  }

  if (property_status_input === 'available' && availability_input !== 'imediata') {
    alert('Imóvel com status "disponível" só pode ter disponibilidade "imediata".');
    return null;
  }

  if (['constructing', 'maintenance'].includes(property_status_input) && availability_input === 'imediata') {
    alert('Imóveis em construção ou em manutenção não podem ter disponibilidade "imediata".');
    return null;
  }

  if (['6m', '1a', '3a'].includes(availability_input) && !publish) {
    alert('Imóveis com disponibilidade futura devem ser publicados.');
    return null;
  }

  if (availability_input === 'indeterminada' && publish) {
    alert('Imóveis com disponibilidade indeterminada não podem ser publicados.');
    return null;
  }

  if (property_status_input === 'sold' && publish) {
    alert('Imóveis vendidos não devem ser publicados.');
    return null;
  }

  if (property_status_input === 'sold' && availability_input !== 'indeterminada') {
    alert('Imóveis vendidos devem ter disponibilidade "indeterminada".');
    return null;
  }

  // Dados do imóvel
  const city = document.getElementById('city').value;
  const district = document.getElementById('district').value;
  const streetInput = document.getElementById('street').value;
  const number = document.getElementById('number').value;
  const complementInput = document.getElementById('complement').value
  const type = document.getElementById('type').value;

  if (!city || !district || !streetInput || !number || !type) {
    errors.push('Preencha todos os dados do imóvel.');
  }

  const street = capitalizeLetter(streetInput, 'allFirstLetters');
  const complement = capitalizeLetter(complementInput, 'allFirstLetters');

  const rooms = document.querySelector('input[name="rooms"]:checked')?.value;
  const bathrooms = document.querySelector('input[name="bathrooms"]:checked')?.value;
  const garage_spaces = document.querySelector('input[name="garage_spaces"]:checked')?.value;

  if (!rooms || !bathrooms || !garage_spaces) {
    errors.push('Preencha os campos de quartos, banheiros e garagens.');
  }

  const imageData = [];
  const imageFiles = [];
  document.querySelectorAll('#images input[type="file"]').forEach(input => {
    if (input.files.length > 0) {
      const file = input.files[0];
      imageData.push({ fileName: file.name, fileType: file.type })
      imageFiles.push(file);
    }
  });
  if ((imageUrls.length + imageData.length) < 3) {
    errors.push('É necessário ter pelo menos 3 imagens do imóvel.');
  }

  const ownerInput = document.getElementById('owner').value;
  const saleInput = document.getElementById('sale').value;
  if (!ownerInput || !saleInput) {
    errors.push('Preencha os dados de locação.');
  }

  const owner = capitalizeLetter(ownerInput, 'allFirstLetters');

  const sale = parseFloat(parseValue(saleInput));
  if (!sale) {
    errors.push('Informe o valor de venda do imóvel.');
  }
  const monthlyCosts = [];
  const uniqueCosts = [];
  const anualCosts = [];

  const strategyProcessCosts = {
    Mensal: (name, value, frequency) => monthlyCosts.push({ name, value, frequency }),
    Única: (name, value, frequency) => uniqueCosts.push({ name, value, frequency }),
    Anual: (name, value, frequency) => anualCosts.push({ name, value, frequency }),
  }
  document.querySelectorAll('#costs > div[data-field-id]').forEach(costDiv => {
    const fieldId = costDiv.dataset.fieldId;
    const name = costDiv.querySelector(`#name_cost_${fieldId}`)?.value;
    const value = costDiv.querySelector(`#value_cost_${fieldId}`)?.value;
    const frequency = costDiv.querySelector(`#frequency_cost_${fieldId}`)?.value;


    const filled = name || value || frequency;

    if (filled && (!name || !value || !frequency)) {
      errors.push('Preencha todos os campos da despesa adicional.');
      return
    }
    if (!filled) {
      return;
    }
    strategyProcessCosts[frequency](name, parseFloat(parseValue(value)), frequency);
  });

  const costs = [
    ...monthlyCosts.sort((a, b) => a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' })),
    ...anualCosts.sort((a, b) => a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' })),
    ...uniqueCosts.sort((a, b) => a.name.localeCompare(b.name, 'pt', { sensitivity: 'base' }))
  ]


  if (errors.length > 0) {
    alert(errors.join('\n'));
    return null;
  }

  const buildAvailableFrom = {
    imediata: () => new Date().toISOString().split('T')[0],
    '6m': () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 6);
      return date.toISOString().split('T')[0];
    },
    '1a': () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 12);
      return date.toISOString().split('T')[0];
    },
    '3a': () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 36);
      return date.toISOString().split('T')[0];
    },
    indeterminada: () => null
  }

  const available_from = availability_input === property_available_from.selectValue
    ? property_available_from.currentValue
    : buildAvailableFrom[availability_input]();

  // Dados finais
  return {
    data: {
      publish,
      intent: 'sale',
      property_status: {
        status: property_status_input,
        available_from
      },
      details: {
        type,
        rooms,
        bathrooms,
        garage_spaces,
      },
      address: {
        city,
        district,
        street,
        number,
        complement
      },
      images: {
        urls: imageUrls,
        imageData
      },
      billings: {
        costs,
        salePrice: sale
      },
      responsible: {
        owner_name: owner
      }
    },
    imageFiles
  };
}

const submitForm = async (event) => {
  event.preventDefault();
  const result = buildData();
  const data = result?.data;
  const imageFiles = result?.imageFiles;

  if (!data) return;


  const resUpdatedProperty = await fetch(`${urlBase}/properties/propertyId/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (resUpdatedProperty.status === 401) {
    window.location.href = '/login/index.html';
    return;
  }

  if (!resUpdatedProperty.ok) {
    alert('Erro ao enviar o imóvel. Por favor, tente novamente.');
    return;
  }

  if (resUpdatedProperty.status === 204) {
    alert('Imóvel atualizado com sucesso!');
    window.location.href = '/administrativo/imoveis/vender/index.html';
    return;
  }

  const { signedUploadUrls } = await resUpdatedProperty.json();

  const uploadImagesPromises = imageFiles.map((file, index) => {
    const url = signedUploadUrls[index];

    return fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Erro ao enviar imagem ${index + 1} (status ${response.status})`);
      }
    });
  });

  const results = await Promise.allSettled(uploadImagesPromises);

  const failed = results.filter(result => result.status === 'rejected');

  if (failed.length > 0) {
    alert('Falha ao enviar uma ou mais imagens. Tente novamente.');
    return;
  }

  const resFinishProperty = await fetch(`${urlBase}/properties/propertyId/${propertyId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (resFinishProperty.status === 401) {
    window.location.href = '/login/index.html';
    return;
  }

  if (!resFinishProperty.ok) {
    alert('Erro ao enviar o imóvel. Por favor, tente novamente.');
    return;
  }

  alert('Imóvel cadastrado com sucesso!');
  window.location.href = '/administrativo/imoveis/vender/index.html';
}

const deleteProperty = async () => {
  const confirmDelete = confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.');
  if (!confirmDelete) return;

  const resDeleteProperty = await fetch(`${urlBase}/properties/propertyId/${propertyId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (resDeleteProperty.status === 401) {
    window.location.href = '/login/index.html';
    return;
  }

  if (!resDeleteProperty.ok) {
    alert('Erro ao excluir o imóvel. Por favor, tente novamente.');
    return;
  }

  alert('Imóvel excluído com sucesso!');
  window.location.href = '/administrativo/imoveis/vender/index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  const user_name = getCookie('user_name');
  token = getCookie('token');

  if (!user_name || !token) {
    window.location.href = '/login/index.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  propertyId = params.get('id');
  const resGetProperty = await fetch(`${urlBase}/properties/propertyId/${propertyId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (resGetProperty.status === 401) {
    window.location.href = '/login/index.html';
    return;
  }

  if (!resGetProperty.ok) {
    alert('Erro ao carregar dados do imóvel. Por favor, tente novamente.');
    window.location.href = '/administrativo/imoveis/alugar/index.html';
    return;
  }

  const { property: propertyData } = await resGetProperty.json();
  console.log(propertyData);
  const selectStatusProperty = document.querySelector('select[name="status_property"]');
  selectStatusProperty.value = propertyData.property_status.status;
  const currentDateTimestamp = new Date();
  const currentDate = currentDateTimestamp.toISOString().split('T')[0];
  const selectAvailability = document.querySelector('select[name="availability"]');
  const selectValueAvailability = getBuildAvailability(propertyData.property_status?.available_from);
  selectAvailability.value = selectValueAvailability;
  property_available_from = {
    selectValue: selectValueAvailability,
    currentValue: propertyData.property_status?.available_from || null
  };
  const selectPublish = document.querySelector('select[name="publish"]');
  selectPublish.value = (propertyData.ad && new Date(propertyData.ad.visible_until)) > new Date(currentDate)
    ? 'true' : 'false';
  buildCities(propertyData.address.city);
  const selectDistrict = document.querySelector('select[name="district"]');
  const citySelected = citiesAndDistricts.find((city) => city.name === propertyData.address.city)
  citySelected.districts.forEach(district => {
    const option = document.createElement("option");
    option.value = district;
    option.textContent = district;
    option.selected = propertyData.address.district === district;
    selectDistrict.appendChild(option);
  });
  const inputStreet = document.querySelector('input[name="street"]');
  inputStreet.value = propertyData.address.street;
  const inputNumber = document.querySelector('input[name="number"]');
  inputNumber.value = propertyData.address.number;
  const inputComplement = document.querySelector('input[name="complement"]');
  inputComplement.value = propertyData.address.complement || '';
  const selectType = document.querySelector(`select[name="type"]`);
  selectType.value = propertyData.details.type;
  const inputRooms = document.querySelector(`input[name="rooms"][value="${propertyData.details.rooms}"]`);
  inputRooms.checked = true;
  const inputBathrooms = document.querySelector(`input[name="bathrooms"][value="${propertyData.details.bathrooms}"]`);
  inputBathrooms.checked = true;
  const inputGarageSpace = document.querySelector(`input[name="garage_spaces"][value="${propertyData.details.garage_spaces}"]`);
  inputGarageSpace.checked = true;
  currentIdImageField = propertyData.images.totalImages;
  countImageFields = propertyData.images.totalImages;
  imageUrls = propertyData.images.urls;
  propertyData.images.urls.forEach((url, index) => {
    addImageField(true, url, index);
  });
  const inputOwner = document.querySelector('#owner');
  inputOwner.value = propertyData.responsible.owner_name;
  const price = propertyData.billings.salePrice;
  const inputSale = document.querySelector('#sale');
  inputSale.value = Math.round(price * 100).toString();
  formatCurrency(inputSale);
  const lengthCosts = propertyData.billings.costs.length;
  if (!lengthCosts) {
    addCostsField(false);
    return;
  }
  currentIdCostsField = lengthCosts;
  countCostsFields = lengthCosts;
  propertyData.billings.costs.forEach((cost, index) => {
    addCostsField(true, cost, index);
  });
});