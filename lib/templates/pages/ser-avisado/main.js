const citiesAndDistricts = {{citiesAndDistricts}};
const tenant = '{{tenant}}';
const urlBase = '{{urlBase}}';
const siteMode = '{{siteMode}}';
const contactOptions = {{contactOptions}};

const formData = { tenant, criteria: {}, contact: {} };

let processRequest = false;

const formatPhone = (phone) => {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11) {
    return digits.replace(
      /(\d{2})(\d{5})(\d{4})/,
      '($1) $2-$3'
    );
  }

  if (digits.length === 10) {
    return digits.replace(
      /(\d{2})(\d{4})(\d{4})/,
      '($1) $2-$3'
    );
  }

  return phone;
}

const openDirectContact = (number) => {
    const urlWhatsappRedirect = `https://wa.me/55${number}`;
    window.open(urlWhatsappRedirect, '_blank', 'noopener,noreferrer');
  };

const processContact = () => {
  if (contactOptions.length === 1) {
    const [contact] = contactOptions;
    return openDirectContact(contact.number);
  }
  const contactDialogList = document.getElementById('contact_dialog_list');
  contactDialogList.innerHTML = '';

  contactOptions.forEach((contact) => {
    const contactItem = contact.hasWhatsapp ? document.createElement('a') : document.createElement('div');
    contactItem.className = 'contact_dialog_item';
    if (contact.hasWhatsapp) {
      contactItem.href = `https://wa.me/55${contact.number}`;
      contactItem.target = '_blank';
      contactItem.rel = 'noopener noreferrer';
    }

    const title = document.createElement('strong');
    title.textContent = contact.label;

    const phone = document.createElement('span');
    phone.textContent = formatPhone(contact.number);

    contactItem.appendChild(title);
    contactItem.appendChild(phone);
    contactDialogList.appendChild(contactItem);
  });

  const contactDialog = document.getElementById('contact_dialog');
  contactDialog.showModal();
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
  const typeSelect = document.getElementById('type_property');
  const roomsSelect = document.getElementById('rooms');
  const garageSpacesSelect = document.getElementById('garage_spaces');
  const accept_pets = document.getElementById('accept_pets');

  const isCommercial = commercialTypes.includes(typeSelect.value);

  if (isCommercial) {
    lockSelectAsNotApplicable(roomsSelect);
    lockSelectAsNotApplicable(accept_pets);
    return;
  }

  if (typeSelect.value === 'Lote') {
    lockSelectAsNotApplicable(roomsSelect);
    lockSelectAsNotApplicable(garageSpacesSelect);
    return;
  }

  resetSelectOptions(roomsSelect, [
    { value: '0', label: 'Tanto faz' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '+4' }
  ]);

  resetSelectOptions(garageSpacesSelect, [
    { value: '0', label: 'Tanto faz' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '+4' }
  ]);
};

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

const maskPhone = (input) => {
  let value = input.value.replace(/\D/g, '');

  if (value.length > 11) value = value.slice(0, 11);

  if (value.length <= 10) {
    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, function (_, ddd, p1, p2) {
      return `(${ddd}) ${p1}${p2 ? "-" + p2 : ""}`;
    });
  } else {
    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, function (_, ddd, p1, p2) {
      return `(${ddd}) ${p1}${p2 ? "-" + p2 : ""}`;
    });
  }
  input.value = value;
}

const parsePhone = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

const buildOption = (value, select) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  select.appendChild(option);
};

const buildCheckboxOption = (value, container) => {
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = value;
  checkbox.checked = true;
  checkbox.addEventListener('change', updateSelectedDistricts);
  label.appendChild(checkbox);
  label.appendChild(document.createTextNode(value));
  container.appendChild(label);
};

const getSelectedDistricts = () =>
  Array.from(document.querySelectorAll('#districts input[type="checkbox"]:checked')).map(cb => cb.value);

const updateSelectedDistricts = () => {
  const checkboxes = document.querySelectorAll('#districts input[type="checkbox"]');
  const trigger = document.getElementById('districts_select');
  const toggleButton = document.getElementById('districts_toggle');
  const selected = getSelectedDistricts();

  if (selected.length && selected.length === checkboxes.length) {
    trigger.textContent = 'Todos selecionados';
  } else {
    trigger.textContent = selected.length > 0 ? selected.join(', ') : 'Selecione';
  }

  toggleButton.hidden = checkboxes.length === 0;
  toggleButton.textContent = selected.length > 0 ? 'Remover seleção' : 'Selecionar todos';
};

const toggleDistrictsSelection = () => {
  const checkboxes = document.querySelectorAll('#districts input[type="checkbox"]');
  const hasSelectedDistrict = Array.from(checkboxes).some(checkbox => checkbox.checked);

  checkboxes.forEach(checkbox => {
    checkbox.checked = !hasSelectedDistrict;
  });

  updateSelectedDistricts();
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
  const optionDistricts = document.getElementById("options_districts");
  const selectedCity = citySelect.value;

  const citySelected = citiesAndDistricts.find((city) => city.name === selectedCity)
  if (citySelected) {
    optionDistricts.innerHTML = '';
    citySelected.districts.forEach(district => {
      buildCheckboxOption(district, optionDistricts);
    });
    updateSelectedDistricts();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  function setBodyFullHeight() {
    const altura = window.innerHeight;
    document.body.style.minHeight = altura + "px";
  }

  window.addEventListener("load", setBodyFullHeight);
  window.addEventListener("resize", setBodyFullHeight);
  window.addEventListener("orientationchange", setBodyFullHeight);

  const campIntent = document.getElementById('camp_intent');
  if (siteMode !== 'both') {
    campIntent.style.display = 'none';
  }

  // Multiselect
  const customSelects = document.querySelectorAll('.custom-select');

  customSelects.forEach(select => {
    const trigger = select.querySelector('.select-trigger');
    const options = select.querySelector('.options');

    trigger.addEventListener('click', () => {
      options.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!select.contains(e.target)) {
        options.classList.remove('open');
      }
    });
  });

  const districtsToggle = document.getElementById('districts_toggle');
  districtsToggle.addEventListener('click', toggleDistrictsSelection);
  updateSelectedDistricts();

  const formStepOne = document.getElementById('form_step_one');
  const formStepTwo = document.getElementById('form_step_two');
  const formStepThree = document.getElementById('form_step_three');
  const currentStepElement = document.getElementById('current_step');

  formStepTwo.classList.add('form_disabled');
  formStepThree.classList.add('form_disabled');

  let currentStep = 1;
  let intentValue;

  const steps = {
    1: {
      validate: () => true,
      apply: () => {
        formStepOne.classList.remove('form_disabled');
        formStepTwo.classList.add('form_disabled');
        formStepThree.classList.add('form_disabled');
        currentStepElement.textContent = '1';
      }
    },

    2: {
      validate: () => {
        intentValue = ['rent', 'sale'].includes(siteMode)
          ? siteMode
          : document.getElementById('intent').value;

        const selectTypeProperty = document.getElementById('type_property');
        const selectCity = document.getElementById('city');

        const districts = getSelectedDistricts();

        if (!intentValue || !selectTypeProperty.value || !selectCity.value || districts.length === 0) {
          alert('Por favor, preencha todos os campos para continuar.');
          return false;
        }

        formData.intent = intentValue;
        formData.criteria.propertyType  = selectTypeProperty.value;
        formData.criteria.city = selectCity.value;

        formData.criteria.districts = districts;

        return true;
      },

      apply: () => {
        const camp_price_range_rent = document.getElementById('camp_price_range_rent');
        const camp_price_range_sale = document.getElementById('camp_price_range_sale');
        const camp_accept_pets = document.getElementById('camp_accept_pets');

        if (intentValue === 'rent') {
          camp_price_range_sale.classList.add('form_disabled');
        } else {
          camp_price_range_rent.classList.add('form_disabled');
          camp_accept_pets.classList.add('form_disabled');
        }

        formStepOne.classList.add('form_disabled');
        formStepTwo.classList.remove('form_disabled');
        formStepThree.classList.add('form_disabled');
        currentStepElement.textContent = '2';
      }
    },

    3: {
      validate: () => {
        const price_range =
          intentValue === 'rent'
            ? document.getElementById('price_range_rent').value
            : document.getElementById('price_range_sale').value;

        const accept_pets = document.getElementById('accept_pets').value;
        const rooms = document.getElementById('rooms').value;
        const garage = document.getElementById('garage_spaces').value;

        if (!price_range || (intentValue === 'rent' && !accept_pets) || !rooms || !garage) {
          alert('Por favor, preencha todos os campos para continuar.');
          return false;
        }

        if (intentValue === 'rent') {
          formData.criteria.requiredAccepetsPets = accept_pets === 'true';
        }

        formData.criteria.value = parseFloat(price_range);
        formData.criteria.rooms = parseInt(rooms);
        formData.criteria.garageSpaces = parseInt(garage);

        return true;
      },

      apply: () => {
        formStepOne.classList.add('form_disabled');
        formStepTwo.classList.add('form_disabled');
        formStepThree.classList.remove('form_disabled');
        currentStepElement.textContent = '3';
      }
    }
  };

  processStep = (next, curret) => {
    const targetStep = next ? currentStep + 1 : currentStep - 1;

    const step = steps[targetStep];
    if (!step) return;

    const isValid = step.validate();

    if (!isValid) return;

    step.apply();
    currentStep = targetStep;
  }

  save = async () => {
    if (processRequest) return;
    validateProcessRequest('initial');
    const inputName = document.getElementById('name');
    const inputWhatsapp = document.getElementById('whatsapp');
    if (!inputName.value || !inputWhatsapp.value) {
      validateProcessRequest('finish');
      alert('Por favor, preencha todos os campos para cadastrar.');
      return;
    }
    formData.contact.name = capitalizeLetter(inputName.value, 'allFirstLetters');
    formData.contact.whatsapp = parsePhone(inputWhatsapp.value);
    const resCreatedDemand = await fetch(`${urlBase}/demands`, {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    validateProcessRequest('finish');
    if (!resCreatedDemand.ok) {
      alert('Erro ao realizar o cadastro. Por favor, tente novamente.');
      return;
    }

    alert('Cadastro realizado com sucesso!');
    document.querySelectorAll('form').forEach(form => form.reset());
    window.location.href = '/index.html';
  }
});