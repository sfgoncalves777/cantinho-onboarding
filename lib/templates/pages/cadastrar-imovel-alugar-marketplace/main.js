const urlBase = '{{urlBase}}';
const citiesAndDistricts = {{citiesAndDistricts}};

let token

const logout = () => {
  document.cookie = 'user_name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  window.location.href = '/login/index.html';
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

function maskPhone(input) {
  let value = input.value.replace(/\D/g, '');
  
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length <= 10) {
    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, function(_, ddd, p1, p2) {
      return `(${ddd}) ${p1}${p2 ? "-" + p2 : ""}`;
    });
  } else {
    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, function(_, ddd, p1, p2) {
      return `(${ddd}) ${p1}${p2 ? "-" + p2 : ""}`;
    });
  }
  input.value = value;
}


const getCookie = (name) => {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
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

  districtSelect.innerHTML = '<option disabled selected hidden>Selecione</option>';

  const citySelected = citiesAndDistricts.find((city) => city.name === selectedCity)
  if (citySelected) {
    citySelected.districts.forEach(district => {
      buildOption(district, districtSelect)
    });
  }
}

let currentIdImageField = 3;
let countImageFields = 3;

const handleImageChange = (event, fieldId) => {
  const image = event.target;
  const image_field = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  const preview = image_field.querySelector('img.preview');
  const placeholder = image_field.querySelector('.placeholder');
  const file = image.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
    }
    reader.readAsDataURL(file);
  }
}

const removeImageField = (fieldId) => {
  const image_field = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
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

const addImageField = () => {
  currentIdImageField++;
  countImageFields++;
  const container = document.getElementById('images');
  const fieldId = currentIdImageField
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
  preview.style.display = 'none';

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

let currentIdCostsField = 1;
let countCostsFields = 1;

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

const addCostsField = () => {
  currentIdCostsField++;
  countCostsFields++;
  const container = document.getElementById('costs');

  const fieldId = currentIdCostsField;
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

const parseValue = (value) => value.replace(/\s|R\$\s?/g, '').replace(/\./g, '').replace(',', '.');

function parsePhone(value) {
  if (!value) return "";
  return value.replace(/\D/g, "");
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

  if (['rented', 'maintenance'].includes(property_status_input) && availability_input === 'imediata') {
    alert('Imóveis alugados ou em manutenção não podem ter disponibilidade "imediata".');
    return null;
  }

  if (['1m', '2m', '3m'].includes(availability_input) && !publish) {
    alert('Imóveis com disponibilidade futura devem ser publicados.');
    return null;
  }

  if (availability_input === 'indeterminada' && publish) {
    alert('Imóveis com disponibilidade indeterminada não podem ser publicados.');
    return null;
  }

  // Dados do imóvel
  const city = document.getElementById('city').value;
  const district = document.getElementById('district').value;
  const streetInput = document.getElementById('street').value;
  const number = document.getElementById('number').value;
  const complementInput = document.getElementById('complement').value
  const type = document.getElementById('type').value;
  const accept_pets_input = document.getElementById('accept_pets').value;

  if (!city || !district || !streetInput || !number || !type || !accept_pets_input) {
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
  if (imageData.length < 3) {
    errors.push('Adicione pelo menos 3 imagens do imóvel.');
  }

  const ownerInput = document.getElementById('owner').value;
  const contactInput = document.getElementById('contact').value;
  const rentInput = document.getElementById('rent').value;
  if (!ownerInput || !rentInput || !contactInput) {
    errors.push('Preencha os dados de locação.');
  }

  const owner = capitalizeLetter(ownerInput, 'allFirstLetters');

  const rent = parseFloat(parseValue(rentInput));
  if (!rent) {
    errors.push('Informe o valor do aluguel.');
  }
  const monthlyCosts = [{ name: 'Aluguel', value: rent, frequency: 'Mensal' }];
  const uniqueCosts = [];
  const anualCosts = [];
  let totalMonthlyCosts = rent;

  const strategyProcessCosts = {
    Mensal: (name, value, frequency) => {
      totalMonthlyCosts += value;
      monthlyCosts.push({ name, value, frequency })
    },
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
    '1m': () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date.toISOString().split('T')[0];
    },
    '2m': () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 2);
      return date.toISOString().split('T')[0];
    },
    '3m': () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().split('T')[0];
    },
    indeterminada: () => null
  }

  const available_from = buildAvailableFrom[availability_input]()

  // Dados finais
  return {
    data: {
      publish,
      intent: 'rent',
      property_status: {
        status: property_status_input,
        available_from
      },
      details: {
        type,
        accept_pets: accept_pets_input === 'true',
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
        imageData
      },
      billings: {
        costs,
        totalMonthlyCosts
      },
      responsible: {
        owner_name: owner,
        contact: parsePhone(contactInput)
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

  const resCreatedProperty = await fetch(`${urlBase}/properties`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (resCreatedProperty.status === 401) {
    window.location.href = '/login/index.html';
    return;
  }

  if (!resCreatedProperty.ok) {
    alert('Erro ao enviar o imóvel. Por favor, tente novamente.');
    return;
  }

  const { signedUploadUrls, propertyId } = await resCreatedProperty.json();

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
  window.location.href = '/administrativo/imoveis/alugar/index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  const user_name = getCookie('user_name');
  token = getCookie('token');
  if (!user_name || !token) {
    window.location.href = '/login/index.html';
    return;
  }
});