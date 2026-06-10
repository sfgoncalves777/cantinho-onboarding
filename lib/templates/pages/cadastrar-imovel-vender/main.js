const urlBase = '{{urlBase}}';
const citiesAndDistricts = {{citiesAndDistricts}};
const isMarketplace = {{isMarketplace}};

let token

let processRequest = false;

const handlePublishChange = (value) => {
  if(value === 'true') {
    document.getElementById('camp_period').classList.remove('hidden');
  } else {
    document.getElementById('camp_period').classList.add('hidden');
  }
}


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

const logout = () => {
  document.cookie = 'user_name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  window.location.href = '/login/index.html';
}

const formatCurrency = (input) => {
  let value = input.value.replace(/\D/g, '');

  if (value.length > 11) {
    value = value.slice(0, 11);
  }

  value = (Number(value) / 100).toFixed(2);

  const parts = value.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  input.value = 'R$ ' + parts.join(',');
}

const maskArea = (input) => {
  let value = input.value.replace(/\D/g, '');
  value = value.replace(/^0+(?=\d)/, '');
  input.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseAreaValue = (value) => {
  if (!value) return null;
  return parseInt(value.replace(/\./g, ''), 10);
};

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
  const bathroomsSelect = document.getElementById('bathrooms');
  const garageSpacesSelect = document.getElementById('garage_spaces');

  const isCommercial = commercialTypes.includes(typeSelect.value);

  if (isCommercial) {
    lockSelectAsNotApplicable(roomsSelect);
    return;
  }

  if (typeSelect.value === 'Lote') {
    lockSelectAsNotApplicable(roomsSelect);
    lockSelectAsNotApplicable(bathroomsSelect);
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

  resetSelectOptions(bathroomsSelect, [
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

const maskPhone = (input) => {
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

  districtSelect.innerHTML = '<option value="" disabled selected hidden>Selecione</option>';

  const citySelected = citiesAndDistricts.find((city) => city.name === selectedCity)
  if (citySelected) {
    citySelected.districts.forEach(district => {
      buildOption(district, districtSelect)
    });
  }
}

let currentIdImageField = 1;
const previewUrlsByFieldId = {};
const imageDisplayByFieldId = {};
let currentEditingImageFieldId = null;

const getDefaultImageDisplay = () => ({
  x: 50,
  y: 50
});

const ensureImageDisplay = (fieldId) => {
  if (!imageDisplayByFieldId[fieldId]) {
    imageDisplayByFieldId[fieldId] = getDefaultImageDisplay();
  }

  return imageDisplayByFieldId[fieldId];
};

const getImageObjectPosition = (fieldId) => {
  const display = ensureImageDisplay(fieldId);
  return `${display.x}% ${display.y}%`;
};

const applyObjectPositionToField = (fieldId) => {
  const imageField = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  const preview = imageField?.querySelector('img.preview');

  if (!preview) return;

  preview.style.objectPosition = getImageObjectPosition(fieldId);
};

const updateAdjustDialogPreviews = (fieldId) => {
  const imageField = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  const preview = imageField?.querySelector('img.preview');

  if (!preview?.src) return;

  const mobilePreview = document.getElementById('image_adjust_preview_mobile');
  const desktopPreview = document.getElementById('image_adjust_preview_desktop');
  const objectPosition = getImageObjectPosition(fieldId);

  [mobilePreview, desktopPreview].forEach((image) => {
    image.src = preview.src;
    image.style.objectPosition = objectPosition;
  });
};

const openImageAdjustDialog = (fieldId) => {
  const imageField = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  const input = imageField?.querySelector('input[type="file"]');

  if (!input?.files?.length) return;

  currentEditingImageFieldId = fieldId;

  const display = ensureImageDisplay(fieldId);
  document.getElementById('image_adjust_x').value = display.x;
  document.getElementById('image_adjust_y').value = display.y;
  updateAdjustDialogPreviews(fieldId);
  document.getElementById('image_adjust_dialog').showModal();
};

const closeImageAdjustDialog = () => {
  document.getElementById('image_adjust_dialog').close();
  currentEditingImageFieldId = null;
};

const handleImageAdjustChange = () => {
  if (!currentEditingImageFieldId) return;

  imageDisplayByFieldId[currentEditingImageFieldId] = {
    x: Number(document.getElementById('image_adjust_x').value),
    y: Number(document.getElementById('image_adjust_y').value)
  };

  applyObjectPositionToField(currentEditingImageFieldId);
  updateAdjustDialogPreviews(currentEditingImageFieldId);
};

const bindImageBoxToAdjustDialog = (imageBox, input, fieldId) => {
  imageBox.addEventListener('click', (event) => {
    if (!input.files.length) return;

    event.preventDefault();
    openImageAdjustDialog(fieldId);
  });
};

const clearPreviewUrl = (fieldId) => {
  if (previewUrlsByFieldId[fieldId]) {
    URL.revokeObjectURL(previewUrlsByFieldId[fieldId]);
    delete previewUrlsByFieldId[fieldId];
  }
};

const createImageFieldElement = (fieldId) => {
  const imageField = document.createElement('div');
  imageField.className = 'image_field';
  imageField.dataset.fieldId = fieldId;

  const imageBox = document.createElement('label');
  imageBox.className = 'image_box';

  const placeholder = document.createElement('span');
  placeholder.className = 'placeholder';
  placeholder.textContent = 'Enviar imagem';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = (event) => handleImageSelection(event, fieldId);
  bindImageBoxToAdjustDialog(imageBox, input, fieldId);

  const preview = document.createElement('img');
  preview.className = 'preview';
  preview.style.display = 'none';

  imageBox.appendChild(placeholder);
  imageBox.appendChild(input);
  imageBox.appendChild(preview);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.textContent = 'Remover imagem';
  removeButton.onclick = () => removeImageField(fieldId);

  imageField.appendChild(imageBox);
  imageField.appendChild(removeButton);

  return imageField;
};

const createEmptyImageField = () => {
  currentIdImageField++;
  return createImageFieldElement(currentIdImageField);
};

const lockFilledImageField = (imageField, file) => {
  const fieldId = imageField.dataset.fieldId;
  const input = imageField.querySelector('input[type="file"]');
  const preview = imageField.querySelector('img.preview');
  const placeholder = imageField.querySelector('.placeholder');

  clearPreviewUrl(fieldId);

  const previewUrl = URL.createObjectURL(file);
  previewUrlsByFieldId[fieldId] = previewUrl;

  preview.src = previewUrl;
  preview.style.display = 'block';
  placeholder.style.display = 'none';
  ensureImageDisplay(fieldId);
  preview.style.objectPosition = getImageObjectPosition(fieldId);

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  input.files = dataTransfer.files;
  input.style.display = 'none';
};

const resizeImageToWebP = ({ file, targetMaxSide, quality }) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result;
    };

    img.onload = () => {
      const longestSide = Math.max(img.width, img.height);
      const scale = longestSide > targetMaxSide ? targetMaxSide / longestSide : 1;
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Erro ao gerar WebP'));
            return;
          }

          const webpFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, '.webp'),
            { type: 'image/webp' }
          );

          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = reject;
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

const handleImageSelection = async (event, fieldId) => {
  const input = event.target;
  const files = Array.from(input.files || []);
  if (!files.length) return;

  const container = document.getElementById('images');
  const currentField = container.querySelector(`.image_field[data-field-id="${fieldId}"]`);

  try {
    const optimizedFiles = await Promise.all(
      files.map((file) =>
        resizeImageToWebP({
          file,
          targetMaxSide: 1000,
          quality: 0.7
        })
      )
    );

    optimizedFiles.forEach((file, index) => {
      let targetField;

      if (index === 0) {
        targetField = currentField;
      } else {
        targetField = createEmptyImageField();
        container.appendChild(targetField);
      }

      lockFilledImageField(targetField, file);
    });
  } catch (err) {
    console.error(err);
    alert('Erro ao processar uma ou mais imagens');
  }
};

const removeImageField = (fieldId) => {
  const container = document.getElementById('images');
  const imageField = container.querySelector(`.image_field[data-field-id="${fieldId}"]`);

  if (!imageField) return;

  clearPreviewUrl(fieldId);
  delete imageDisplayByFieldId[fieldId];

  if (currentEditingImageFieldId === fieldId) {
    closeImageAdjustDialog();
  }

  imageField.remove();

  const remainingFields = Array.from(container.querySelectorAll('.image_field'));
  const hasEmptyField = remainingFields.some((field) => {
    const input = field.querySelector('input[type="file"]');
    return input && input.style.display !== 'none';
  });

  if (!hasEmptyField) {
    container.appendChild(createEmptyImageField());
  }
};

const addImageField = () => {
  const container = document.getElementById('images');
  container.appendChild(createEmptyImageField());
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

const parsePhone = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

const buildData = () => {
  const errors = [];

  const property_status_input = document.getElementById('select_status_property').value;
  const publishInput = document.getElementById('publish').value;
  if (!property_status_input) errors.push('Informe a situação do imóvel.');
  if (!publishInput) errors.push('Informe o campo publicar.');
  const publish = publishInput === 'true';
  const periodInput = document.getElementById('period').value;

  // Dados do imóvel
  const city = document.getElementById('city').value;
  const district = document.getElementById('district').value;
  const streetInput = document.getElementById('street').value;
  const number = document.getElementById('number').value.trim() || 'S/N';
  const complementInput = document.getElementById('complement').value;
  const type = document.getElementById('type').value;

  if (!city || !district || !streetInput || !type) {
    errors.push('Preencha todos os dados do imóvel.');
  }

  const street = capitalizeLetter(streetInput, 'allFirstLetters');
  const complement = capitalizeLetter(complementInput, 'allFirstLetters');

  const rooms = document.getElementById('rooms')?.value;
  const bathrooms = document.getElementById('bathrooms')?.value;
  const garage_spaces = document.getElementById('garage_spaces')?.value;

  if (!rooms || !bathrooms || !garage_spaces) {
    errors.push('Preencha os campos de quartos, banheiros e garagens.');
  }

  const areaInput = document.getElementById('area')?.value;
  const unityInput = document.getElementById('unity')?.value;

  if (areaInput && (isNaN(parseAreaValue(areaInput)) || parseAreaValue(areaInput) <= 0)) {
    errors.push('Informe um valor válido para a área.');
  }

  if ((areaInput && !unityInput) || (!areaInput && unityInput)) {
    errors.push('Preencha os campos de área e unidade de medida.');
  }

  const descriptionInput = document.getElementById('description')?.value;

  const imageData = [];
  const imageFiles = [];
  document.querySelectorAll('#images input[type="file"]').forEach(input => {
    if (input.files.length > 0) {
      const file = input.files[0];
      const fieldId = input.closest('.image_field')?.dataset.fieldId;
      imageData.push({
        fileName: file.name,
        fileType: file.type,
        display: {
          objectPosition: getImageObjectPosition(fieldId)
        }
      })
      imageFiles.push(file);
    }
  });
  if (imageData.length < 3) {
    errors.push('Adicione pelo menos 3 imagens do imóvel.');
  }

  const ownerInput = document.getElementById('owner').value;
  const contactInput = document.getElementById('contact').value;

  if (!ownerInput || (!contactInput && isMarketplace)) {
    errors.push('Preencha os dados do dono do imóvel.');
  }

  const owner = capitalizeLetter(ownerInput, 'allFirstLetters');

  const salePriceInput = document.getElementById('salePrice').value;
  const valuePropertyInput = document.getElementById('valueProperty').value;
  const showValuePropertyInput = document.getElementById('showValueProperty').value;

  if (!salePriceInput || !valuePropertyInput || !showValuePropertyInput) {
    errors.push('Informe todas informações de faturamento.');
  }

  const salePrice = parseFloat(parseValue(salePriceInput));
  const valueProperty = parseFloat(parseValue(valuePropertyInput));
  const showValueProperty = showValuePropertyInput === 'true';

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

  // Dados finais
  return {
    data: {
      ad: {
        publish,
        ...(publish && { period: periodInput })
      },
      intent: 'sale',
      propertyStatus: {
        status: property_status_input
      },
      details: {
        type,
        rooms: parseInt(rooms),
        bathrooms: parseInt(bathrooms),
        garageSpaces: parseInt(garage_spaces),
        ...(areaInput && { area: { value: parseAreaValue(areaInput), unit: unityInput } }),
        ...(descriptionInput && { description: descriptionInput })
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
        salePrice,
        valueProperty,
        showValueProperty
      },
      responsible: {
        ownerName: owner,
        ...(isMarketplace && { contacts: [parsePhone(contactInput)] })
      }
    },
    imageFiles
  };
}

const submitForm = async (event) => {
  event.preventDefault();
  if (processRequest) return;
  validateProcessRequest('initial');
  const result = buildData();
  const data = result?.data;
  const imageFiles = result?.imageFiles;

  if (!data) {
    validateProcessRequest('finish');
    return;
  }

  const resCreatedProperty = await fetch(`${urlBase}/properties`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (resCreatedProperty.status === 401) {
    validateProcessRequest('finish');
    window.location.href = '/login/index.html';
    return;
  }

  if (!resCreatedProperty.ok) {
    validateProcessRequest('finish');
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
    validateProcessRequest('finish');
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
  validateProcessRequest('finish');
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

document.addEventListener('DOMContentLoaded', async () => {
  const user_name = getCookie('user_name');
  token = getCookie('token');
  if (!user_name || !token) {
    window.location.href = '/login/index.html';
    return;
  }

  const campContactOwner = document.getElementById('camp_contact_owner');
  if (!isMarketplace) {
    campContactOwner.style.display = 'none';
  }

  const imageAdjustDialog = document.getElementById('image_adjust_dialog');
  imageAdjustDialog.addEventListener('click', (event) => {
    if (event.target === imageAdjustDialog) {
      closeImageAdjustDialog();
    }
  });

  document.querySelectorAll('#images .image_field').forEach((imageField) => {
    const fieldId = imageField.dataset.fieldId;
    const imageBox = imageField.querySelector('.image_box');
    const input = imageField.querySelector('input[type="file"]');

    if (!imageBox || !input) return;

    bindImageBoxToAdjustDialog(imageBox, input, fieldId);
  });
});
