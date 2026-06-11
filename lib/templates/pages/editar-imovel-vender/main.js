const urlBase = '{{urlBase}}';
const citiesAndDistricts = {{citiesAndDistricts}};
const isMarketplace = {{isMarketplace}};

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

let token
let propertyId;
let imageUrls = [];
const imageDisplayByFieldId = {};
let currentEditingImageFieldId = null;
let propertyIsPublished = false;

const handlePublishChange = (value) => {
  if (propertyIsPublished) return;
  if (value === 'true') {
    document.getElementById('camp_period').classList.remove('hidden');
  } else {
    document.getElementById('camp_period').classList.add('hidden');
  }
}

const logout = () => {
  document.cookie = 'user_name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
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
    ...options.map(({ value, label }) => createOption({ value, label }))
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

  districtSelect.innerHTML = '<option value="" disabled selected hidden>Selecione</option>';

  const citySelected = citiesAndDistricts.find((city) => city.name === selectedCity)
  if (citySelected) {
    citySelected.districts.forEach(district => {
      buildOption(district, districtSelect)
    });
  }
}

let currentIdImageField;
let countImageFields;
const previewUrlsByFieldId = {};

const getDefaultImageDisplay = () => ({
  x: 50,
  y: 50
});

const parseObjectPosition = (objectPosition) => {
  const [x = '50%', y = '50%'] = (objectPosition || '50% 50%').split(' ');

  return {
    x: Number.parseFloat(x),
    y: Number.parseFloat(y)
  };
};

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

const hasImageInField = (input, preview) => (
  input?.files?.length > 0 || Boolean(preview?.getAttribute('src'))
);

const applyObjectPositionToField = (fieldId) => {
  const imageField = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  const preview = imageField?.querySelector('img.preview');

  if (!preview) return;

  preview.style.objectPosition = getImageObjectPosition(fieldId);
};

const updateAdjustDialogPreviews = (fieldId) => {
  const imageField = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  const preview = imageField?.querySelector('img.preview');

  if (!preview?.getAttribute('src')) return;

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
  const preview = imageField?.querySelector('img.preview');

  if (!hasImageInField(input, preview)) return;

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

const bindImageBoxToAdjustDialog = (imageBox, input, preview, fieldId) => {
  imageBox.addEventListener('click', (event) => {
    if (!hasImageInField(input, preview)) return;

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

const updatePreview = ({ fieldId, preview, placeholder, file }) => {
  clearPreviewUrl(fieldId);

  const previewUrl = URL.createObjectURL(file);
  previewUrlsByFieldId[fieldId] = previewUrl;
  preview.src = previewUrl;
  preview.style.display = 'block';
  placeholder.style.display = 'none';
  preview.style.objectPosition = getImageObjectPosition(fieldId);
};

const removeExistingImageUrl = (imageField) => {
  const existingUrl = imageField?.dataset?.existingUrl;

  if (existingUrl && imageUrls.includes(existingUrl)) {
    imageUrls = imageUrls.filter(url => url !== existingUrl);
  }

  if (imageField?.dataset) {
    delete imageField.dataset.existingUrl;
  }
};

const lockFilledImageField = (imageField, file) => {
  const fieldId = imageField.dataset.fieldId;
  const input = imageField.querySelector('input[type="file"]');
  const preview = imageField.querySelector('img.preview');
  const placeholder = imageField.querySelector('.placeholder');

  ensureImageDisplay(fieldId);
  removeExistingImageUrl(imageField);

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  input.files = dataTransfer.files;
  input.style.display = 'none';
  updatePreview({ fieldId, preview, placeholder, file });
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
        blob => {
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
        targetField = addImageField(false);
      }

      lockFilledImageField(targetField, file);
    });
  } catch (err) {
    console.error(err);
    alert('Erro ao processar uma ou mais imagens');
  }
};

const removeImageField = (fieldId) => {
  const image_field = document.querySelector(`.image_field[data-field-id="${fieldId}"]`);
  removeExistingImageUrl(image_field);
  delete imageDisplayByFieldId[fieldId];
  if (currentEditingImageFieldId === String(fieldId) || currentEditingImageFieldId === fieldId) {
    closeImageAdjustDialog();
  }
  
  if (countImageFields <= 1) {
    const input = image_field.querySelector('input[type="file"]');
    const preview = image_field.querySelector('img.preview');
    const placeholder = image_field.querySelector('.placeholder');
    clearPreviewUrl(fieldId);
    input.value = '';
    input.style.display = '';
    preview.removeAttribute('src');
    preview.style.display = 'none';
    preview.style.objectPosition = '50% 50%';
    placeholder.style.display = 'block';
  } else {
    clearPreviewUrl(fieldId);
    image_field.remove();
    countImageFields--;
  }
}

const addImageField = (builded, url, index, display) => {
  if (!builded) {
    currentIdImageField++;
    countImageFields++;
  }
  const container = document.getElementById('images');
  const fieldId = builded ? index + 1 : currentIdImageField;
  const image_field = document.createElement('div');
  image_field.className = 'image_field';
  image_field.dataset.fieldId = fieldId;
  if (builded && url) {
    image_field.dataset.existingUrl = url;
  }

  const image_box = document.createElement('label');
  image_box.className = 'image_box';

  const placeholder = document.createElement('span');
  placeholder.className = 'placeholder';
  placeholder.textContent = 'Enviar imagem';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;
  input.onchange = (event) => handleImageSelection(event, fieldId);

  const preview = document.createElement('img');
  preview.className = 'preview';
  if (builded && url) {
    preview.src = url;
  }
  preview.style.display = builded && url ? 'block' : 'none';
  if (builded && url) {
    input.style.display = 'none';
    imageDisplayByFieldId[fieldId] = parseObjectPosition(display?.objectPosition);
    preview.style.objectPosition = getImageObjectPosition(fieldId);
  }

  bindImageBoxToAdjustDialog(image_box, input, preview, fieldId);

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
  return image_field;
};

let currentIdCostsField = 0;
let countCostsFields = 0;

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

const parseValue = (value) => value.replace(/\s|R\$\s?/g, '').replace(/\./g, '').replace(',', '.');

const parsePhone = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

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
  const descriptionInput = document.getElementById('description')?.value;

  if (areaInput && (isNaN(parseAreaValue(areaInput)) || parseAreaValue(areaInput) <= 0)) {
    errors.push('Informe um valor válido para a área.');
  }

  if ((areaInput && !unityInput) || (!areaInput && unityInput)) {
    errors.push('Preencha os campos de área e unidade de medida.');
  }

  const existingImageFields = Array.from(document.querySelectorAll('#images .image_field'))
    .filter((field) => field.dataset.existingUrl && field.querySelector('img.preview')?.style.display !== 'none');
  const currentImageUrls = existingImageFields.map((field) => field.dataset.existingUrl);
  const currentImageDisplay = existingImageFields.map((field) => ({
    objectPosition: getImageObjectPosition(field.dataset.fieldId)
  }));

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
  if ((currentImageUrls.length + imageData.length) < 3) {
    errors.push('É necessário ter pelo menos 3 imagens do imóvel.');
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
    return;
  }

  // Dados finais
  return {
    data: {
      ad: {
        publish,
        ...((publish && !propertyIsPublished) && { period: periodInput })
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
        urls: currentImageUrls,
        display: currentImageDisplay,
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

  const resUpdatedProperty = await fetch(`${urlBase}/properties/propertyId/${propertyId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (resUpdatedProperty.status === 401) {
    validateProcessRequest('finish');
    window.location.href = '/login/index.html';
    return;
  }

  if (!resUpdatedProperty.ok) {
    validateProcessRequest('finish');
    alert('Erro ao enviar o imóvel. Por favor, tente novamente.');
    return;
  }

  if (resUpdatedProperty.status === 204) {
    validateProcessRequest('finish');
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

const deleteProperty = async () => {
  if (processRequest) return;
  const confirmDelete = confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.');
  if (!confirmDelete) return;
  validateProcessRequest('initial');

  const resDeleteProperty = await fetch(`${urlBase}/properties/propertyId/${propertyId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  validateProcessRequest('finish');
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

  if (!user_name || !token) {
    window.location.href = '/login/index.html';
    return;
  }

  const params = new URLSearchParams(window.location.search);
  propertyId = params.get('id');
  if (processRequest) return;
  validateProcessRequest('initial');
  const resGetProperty = await fetch(`${urlBase}/properties/propertyId/${propertyId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (resGetProperty.status === 401) {
    validateProcessRequest('finish');
    window.location.href = '/login/index.html';
    return;
  }

  if (!resGetProperty.ok) {
    validateProcessRequest('finish');
    alert('Erro ao carregar dados do imóvel. Por favor, tente novamente.');
    window.location.href = '/administrativo/imoveis/vender/index.html';
    return;
  }

  const { property: propertyData } = await resGetProperty.json();
  const selectStatusProperty = document.querySelector('select[name="status_property"]');
  selectStatusProperty.value = propertyData.propertyStatus.status;
  const selectPublish = document.querySelector('select[name="publish"]');
  if (propertyData.ad && (new Date(propertyData.ad.visibleUntil) > new Date() || !propertyData.ad.visibleUntil)) {
    selectPublish.value = 'true';
    propertyIsPublished = true;
  } else {
    selectPublish.value = 'false';
  };
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
  handlePropertyTypeChange();
  document.getElementById('rooms').value = commercialTypes.includes(propertyData.details.type)
    ? '0'
    : String(propertyData.details.rooms);
  document.getElementById('bathrooms').value = String(propertyData.details.bathrooms);
  document.getElementById('garage_spaces').value = String(propertyData.details.garageSpaces);
  currentIdImageField = propertyData.images.totalImages;
  countImageFields = propertyData.images.totalImages;
  imageUrls = propertyData.images.urls;
  propertyData.images.urls.forEach((url, index) => {
    addImageField(true, url, index, propertyData.images.display?.[index]);
  });
  const inputOwner = document.querySelector('#owner');
  inputOwner.value = propertyData.responsible.ownerName;
  if (isMarketplace) {
    const inputContact = document.querySelector('#contact');
    inputContact.value = propertyData.responsible.contacts?.[0];
    maskPhone(inputContact);
  }
  const inputArea = document.getElementById('area');
  if (propertyData.details.area?.value) {
    inputArea.value = String(propertyData.details.area.value).replace('.', ',');
    maskArea(inputArea);
  }
  const selectUnity = document.getElementById('unity');
  selectUnity.value = propertyData.details.area?.unit || '';
  document.getElementById('description').value = propertyData.details.description || '';
  const valueProperty = propertyData.billings.valueProperty;
  const inputValueProperty = document.getElementById('valueProperty');
  inputValueProperty.value = Math.round(valueProperty * 100).toString();
  formatCurrency(inputValueProperty);
  const salePrice = propertyData.billings.salePrice;
  const inputSalePrice = document.getElementById('salePrice');
  inputSalePrice.value = Math.round(salePrice * 100).toString();
  formatCurrency(inputSalePrice);
  const showValueProperty = propertyData.billings.showValueProperty;
  const selectShowValueProperty = document.getElementById('showValueProperty');
  selectShowValueProperty.value = showValueProperty ? 'true' : 'false';
  const lengthCosts = propertyData.billings.costs.length;
  if (!lengthCosts) {
    addCostsField(false);
    validateProcessRequest('finish');
    return;
  }
  currentIdCostsField = propertyData.billings.costs.length;
  countCostsFields = propertyData.billings.costs.length;
  propertyData.billings.costs.forEach((cost, index) => {
    addCostsField(true, cost, index);
  });
  validateProcessRequest('finish');
});
