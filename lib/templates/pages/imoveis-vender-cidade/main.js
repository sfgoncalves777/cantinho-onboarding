const properties = [];
const districtsOptions = {{districtsOptions}};
const citiesOptions = {{citiesOptions}};
const isMarketplace = {{isMarketplace}};
const tenant = '{{tenant}}';
const urlBase = '{{urlBase}}';
const actualCity = '{{city}}';
const contactOptions = {{contactOptions}};

const iconArrowLeftClean = `{{iconArrowLeftClean}}`;
const iconArrowRightClean = `{{iconArrowRightClean}}`;
const iconHome = `{{iconHome}}`;
const iconDetail = `{{iconDetail}}`;
const iconOwner = `{{iconOwner}}`;
const iconWhatsapp = `{{iconWhatsapp}}`;
const iconArrowLeft = `{{iconArrowLeft}}`;
const iconSearch = `{{iconSearch}}`;
const iconArea = `{{iconArea}}`;

let popupDetailPropetyOpened = false;
let triggerOpenPopupDemandWithProperty = false;

let propertiesResult = [];

let BATCH_SIZE = 10;
let isProcessingInsertProperties = false;
let currentShowPropertyIndex = 0;

const dataDemand = {
  tenant,
  intent: 'sale',
  criteria: {},
  contact: {}
}

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
};

const parsePhone = (value) => {
  if (!value) return "";
  return value.replace(/\D/g, "");
};

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

const handleCityChange = (event) => {
  const citySelected = event.value;
  const redirectUrlCity = `/imoveis/venda/${citySelected}/index.html`;
  const urlSegment = window.location.pathname;
  if (urlSegment === redirectUrlCity) return;
  window.location.href = redirectUrlCity;
};

const getBuildImage = (targetImage, propertyData, tenant) => propertyData.tenant === tenant
  ? targetImage
  : `${propertyData.responsible.site}${targetImage}`;

const getImageObjectPosition = (property, index) =>
  property.images?.display?.[index]?.objectPosition || '50% 50%';

const setCarouselImage = (imgElement, property, imageIndex) => {
  const nextSrc = getBuildImage(property.images.urls[imageIndex], property, tenant);
  const nextObjectPosition = getImageObjectPosition(property, imageIndex);

  imgElement.src = nextSrc;
  imgElement.style.objectPosition = nextObjectPosition;
};

const syncCarouselImage = (imgElement, property, imageIndex) => {
  const nextSrc = getBuildImage(property.images.urls[imageIndex], property, tenant);
  const nextObjectPosition = getImageObjectPosition(property, imageIndex);

  if (imgElement.src === nextSrc) {
    imgElement.style.objectPosition = nextObjectPosition;
    return;
  }

  const preloadImage = new Image();
  imgElement.dataset.pendingImage = nextSrc;

  preloadImage.onload = () => {
    if (imgElement.dataset.pendingImage !== nextSrc) return;
    imgElement.src = nextSrc;
    imgElement.style.objectPosition = nextObjectPosition;
    delete imgElement.dataset.pendingImage;
  };

  preloadImage.onerror = () => {
    if (imgElement.dataset.pendingImage !== nextSrc) return;
    imgElement.src = nextSrc;
    imgElement.style.objectPosition = nextObjectPosition;
    delete imgElement.dataset.pendingImage;
  };

  preloadImage.src = nextSrc;
};

const closePopup = (propertyIdentifier, isDirect = false) => {
  const dialog = document.getElementById('property_detail');
  dialog.close();
  const divPropertyContent = document.getElementById('property_content');
  divPropertyContent.innerHTML = '';
  if (isDirect) {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.replaceState({}, document.title, url);
  } else {
    const property = properties.find(p => p.identifier === propertyIdentifier);
    if (!property) return;
    property.images.currentImage = 0;
    const ad = document.querySelector(`#item_result > [data-id="${propertyIdentifier}"]`);
    const imgProperty = ad.querySelector('figure img');
    setCarouselImage(imgProperty, property, property.images.currentImage);
    const buttonPrev = ad.querySelector('.btn_prev');
    buttonPrev.style.display = 'none';
    const buttonNext = ad.querySelector('.btn_next');
    buttonNext.style.display = 'block';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
  popupDetailPropetyOpened = false;
  if (triggerOpenPopupDemandWithProperty) {
    setTimeout(() => {
      const dialog = document.getElementById('register_demand_search_not_empty');
      dialog.showModal();
      triggerOpenPopupDemandWithProperty = false
    }, 500)
  };
};

const buildComponentProperty = (property) => {
  property.images.currentImage = 0;
  const ad = document.createElement('article');
  ad.classList.add('ad');
  ad.dataset.id = property.identifier;
  if (isMarketplace) {
    ad.dataset.tenant = property.tenant;
  }
  const figure = document.createElement('figure');
  figure.classList.add('carrosel');
  const imgProperty = document.createElement('img');
  imgProperty.classList.add('img_carousel');
  setCarouselImage(imgProperty, property, property.images.currentImage);
  imgProperty.alt = 'Imagem do imóvel';
  imgProperty.loading = 'lazy';
  figure.appendChild(imgProperty);
  const buttonPrev = document.createElement('button');
  buttonPrev.classList.add('btn_prev');
  buttonPrev.insertAdjacentHTML('beforeend', iconArrowLeftClean);
  buttonPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateCarousel(property.identifier, 'prev', 'article');
  });
  const buttonNext = document.createElement('button');
  buttonNext.classList.add('btn_next');
  buttonNext.insertAdjacentHTML('beforeend', iconArrowRightClean);
  buttonNext.addEventListener('click', (e) => {
    e.stopPropagation();
    navigateCarousel(property.identifier, 'next', 'article');
  });
  figure.appendChild(buttonPrev);
  figure.appendChild(buttonNext);
  ad.appendChild(figure);
  const divContent = document.createElement('div');
  divContent.classList.add('content');
  const titleValue = document.createElement('h3');
  if (property.billings.showValueProperty) {
    titleValue.textContent = `R$ ${property.billings.valueProperty.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  } else {
    titleValue.textContent = 'Valor sob consulta';
  }
  divContent.appendChild(titleValue);
  const divType = document.createElement('div');
  divType.classList.add('type');
  const spanTitleType = document.createElement('span');
  spanTitleType.textContent = property.details.type;
  divType.insertAdjacentHTML('afterbegin', iconHome);
  divType.appendChild(spanTitleType);
  divContent.appendChild(divType);

  if (property.details.rooms || property.details.garageSpaces) {
    const divDetails = document.createElement('div');
    divDetails.classList.add('details');
    divDetails.insertAdjacentHTML('afterbegin', iconDetail);
    const listDetails = document.createElement('ul');
    if (property.details.rooms) {
      const itemInfoRooms = document.createElement('li');
      itemInfoRooms.textContent = `${property.details.rooms === 4 ? '+4' : property.details.rooms} quarto${property.details.rooms > 1 ? 's' : ''}`;
      listDetails.appendChild(itemInfoRooms);
    }
    if (property.details.garageSpaces) {
      const itemGarage = document.createElement('li');
      itemGarage.textContent = `${property.details.garageSpaces === 4 ? '+4' : property.details.garageSpaces} garage${property.details.garageSpaces > 1 ? 'ns' : 'm'}`;
      listDetails.appendChild(itemGarage);
    }
    divDetails.appendChild(listDetails);
    divContent.appendChild(divDetails);
  }

  const addressProperty = document.createElement('address');
  addressProperty.textContent = `${capitalizeLetter(property.address.street, 'allFirstLetters')}, ${property.address.number}${property.address.complement ? `, ${capitalizeLetter(property.address.complement, 'allFirstLetters')}` : ''}, ${capitalizeLetter(property.address.district, 'allFirstLetters')}, ${property.address.city}`;
  divContent.appendChild(addressProperty);
  ad.appendChild(divContent);
  ad.addEventListener('click', () => openPopup(property.identifier));
  return ad;
};

const processResults = () => {
  if (currentShowPropertyIndex >= propertiesResult.length || isProcessingInsertProperties) return;
  isProcessingInsertProperties = true;
  requestAnimationFrame(() => {
    const batch = propertiesResult.slice(currentShowPropertyIndex, currentShowPropertyIndex + BATCH_SIZE);
    const fragment = document.createDocumentFragment();
    for (const property of batch) {
      const ad = buildComponentProperty(property);
      fragment.appendChild(ad);
    };
    const containerItemResult = document.getElementById('item_result');
    containerItemResult.appendChild(fragment);
    currentShowPropertyIndex += BATCH_SIZE;
    isProcessingInsertProperties = false;
  });
}

const openPopup = (propertyIdentifier, isDirect) => {
  const property = properties.find(p => p.identifier === propertyIdentifier);
  if (!property) return;
  popupDetailPropetyOpened = true;
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = scrollBarWidth + 'px';
  const dialog = document.getElementById('property_detail');
  dialog.showModal();
  const divPropertyContent = document.getElementById('property_content');
  divPropertyContent.dataset.propertyId = property.identifier;
  if (isMarketplace) {
    divPropertyContent.dataset.tenant = property.tenant;
  }
  const figure = document.createElement('figure');
  figure.classList.add('carrosel');

  const imgFigure = document.createElement('img');
  imgFigure.classList.add('img_carousel');
  if (!property.images.currentImage) {
    property.images.currentImage = 0;
  }
  setCarouselImage(imgFigure, property, property.images.currentImage);
  imgFigure.alt = 'Imagem do imóvel';

  const buttonPrev = document.createElement('button');
  buttonPrev.classList.add('btn_prev');
  buttonPrev.style.display = property.images.currentImage === 0 ? 'none' : 'block';
  buttonPrev.addEventListener('click', () => navigateCarousel(propertyIdentifier, 'prev', 'popup'));
  buttonPrev.insertAdjacentHTML('beforeend', iconArrowLeftClean);

  const buttonNext = document.createElement('button');
  buttonNext.classList.add('btn_next');
  buttonNext.style.display = property.images.currentImage === property.images.totalImages - 1 ? 'none' : 'block';
  buttonNext.addEventListener('click', () => navigateCarousel(propertyIdentifier, 'next', 'popup'));
  buttonNext.insertAdjacentHTML('beforeend', iconArrowRightClean);
  figure.appendChild(imgFigure);
  figure.appendChild(buttonPrev);
  figure.appendChild(buttonNext);

  divPropertyContent.appendChild(figure);

  const divPropertyInfos = document.createElement('div');
  divPropertyInfos.classList.add('property_infos');

  const divDetails = document.createElement('div');
  divDetails.classList.add('details');

  const divTypeProperty = document.createElement('div');
  divTypeProperty.id = 'type_property';

  const titleProperty = document.createElement('h2');
  titleProperty.textContent = `${property.details.type} à venda`;
  divTypeProperty.insertAdjacentHTML('afterbegin', iconHome);

  divTypeProperty.appendChild(titleProperty);

  divDetails.appendChild(divTypeProperty);

  if (property.details.rooms || property.details.garageSpaces || property.details.bathrooms) {
    const divInfos = document.createElement('div');
    divInfos.id = 'infos';
    divInfos.insertAdjacentHTML('afterbegin', iconDetail);
    const divInfosDetails = document.createElement('div');
    if (property.details.rooms) {
      const itemRooms = document.createElement('span');
      itemRooms.textContent = `${property.details.rooms === 4 ? '+4' : property.details.rooms} quarto${property.details.rooms > 1 ? 's' : ''}`;
      divInfosDetails.appendChild(itemRooms);
    }
    if (property.details.bathrooms) {
      const itemBathrooms = document.createElement('span');
      itemBathrooms.textContent = `${property.details.bathrooms === 4 ? '+4' : property.details.bathrooms} banheiro${property.details.bathrooms > 1 ? 's' : ''}`;
      divInfosDetails.appendChild(itemBathrooms);
    }
    if (property.details.garageSpaces) {
      const itemGarage = document.createElement('span');
      itemGarage.textContent = `${property.details.garageSpaces === 4 ? '+4' : property.details.garageSpaces} garage${property.details.garageSpaces > 1 ? 'ns' : 'm'}`;
      divInfosDetails.appendChild(itemGarage);
    }
    divInfos.appendChild(divInfosDetails);
    divDetails.appendChild(divInfos);
  }

  if (property.details.area) {
    const divInfoArea = document.createElement('div');
    divInfoArea.classList.add('info_area');
    const spanArea = document.createElement('span');
    spanArea.textContent = `${property.details.area.value} ${property.details.area.unit}`;
    divInfoArea.insertAdjacentHTML('afterbegin', iconArea);
    divInfoArea.appendChild(spanArea);

    divDetails.appendChild(divInfoArea);
  }

  if (property.details.description) {
    const divDescription = document.createElement('div');
    divDescription.classList.add('description');
    const titleDescriptionTitle = document.createElement('h3');
    titleDescriptionTitle.textContent = 'Descrição';
    const pDescription = document.createElement('p');
    pDescription.textContent = property.details.description.replace(/\n+/g, '\n');
    divDescription.appendChild(titleDescriptionTitle);
    divDescription.appendChild(pDescription);
    divDetails.appendChild(divDescription);
  }

  const address = document.createElement('address');
  address.textContent = `${capitalizeLetter(property.address.street, 'allFirstLetters')}, ${property.address.number}${property.address.complement ? `, ${capitalizeLetter(property.address.complement, 'allFirstLetters')}` : ''}, ${capitalizeLetter(property.address.district, 'allFirstLetters')}, ${property.address.city}`;

  divDetails.appendChild(address);

  divPropertyInfos.appendChild(divDetails);

  const divValues = document.createElement('div');
  divValues.classList.add('values');

  const divSalePrice = document.createElement('div');
  const strongTitleSalePrice = document.createElement('strong');
  strongTitleSalePrice.textContent = 'Valor de venda';
  const strongValueSalePrice = document.createElement('strong');
  if (property.billings.showValueProperty) {
    strongValueSalePrice.textContent = `R$ ${property.billings.valueProperty.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  } else {
    strongValueSalePrice.textContent = 'Valor sob consulta';
  }
  divSalePrice.appendChild(strongTitleSalePrice);
  divSalePrice.appendChild(strongValueSalePrice);

  divValues.appendChild(divSalePrice);

  const processCosts = (cost, contentValues) => {
    const divValue = document.createElement('div');
    const spanTitleCost = document.createElement('span');
    spanTitleCost.textContent = cost.name;
    const spanValueCost = document.createElement('span');
    spanValueCost.textContent = `R$ ${cost.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ${cost.frequency.toLocaleLowerCase()}`;
    divValue.appendChild(spanTitleCost);
    divValue.appendChild(spanValueCost);
    contentValues.appendChild(divValue);
  };

  if (property.billings.showValueProperty) {
    property.billings.costs.forEach(cost => processCosts(cost, divValues));
  };
  divPropertyInfos.appendChild(divValues);

  const buildResponsible = (propertyResponsible, contentProperty) => {
    const { advertiser, logo } = propertyResponsible;
    const defineContentResponsible = logo ? 'company' : 'owner';
    const strategyFunction = {
      company: () => {
        const divResponsibleCompany = document.createElement('div');
        divResponsibleCompany.classList.add('responsible_company');
        const divContentImage = document.createElement('div');
        const imgLogoCompany = document.createElement('img');
        imgLogoCompany.src = logo;
        imgLogoCompany.alt = advertiser;
        divContentImage.appendChild(imgLogoCompany);
        divResponsibleCompany.appendChild(divContentImage);
        contentProperty.appendChild(divResponsibleCompany);
      },
      owner: () => {
        const divResponsibleOwner = document.createElement('div');
        divResponsibleOwner.classList.add('responsible_owner');
        const spanNameOwner = document.createElement('span');
        spanNameOwner.textContent = advertiser;
        spanNameOwner.insertAdjacentHTML('afterbegin', iconOwner);
        divResponsibleOwner.appendChild(spanNameOwner);
        contentProperty.appendChild(divResponsibleOwner);
      }
    };
    strategyFunction[defineContentResponsible]();
  };

  if (isMarketplace) {
    buildResponsible(property.responsible, divPropertyInfos);
  }

  if (property.responsible?.creci?.length) {
    const creciContent = document.createElement('div');
    creciContent.id = 'creci';
    const title = document.createElement('h3');
    title.textContent = property.responsible.creci.length > 1 ? 'CRECIs responsáveis' : 'CRECI responsável';
    const creciList = document.createElement('div');
    property.responsible.creci.forEach(creci => {
      const creciItem = document.createElement('div');
      creciItem.innerHTML = `<div><strong>${creci.label}</strong><p>CRECI ${creci.number}</p></div>`;
      creciList.appendChild(creciItem);
    });
    creciContent.appendChild(title);
    creciContent.appendChild(creciList);
    divPropertyInfos.appendChild(creciContent);
  }

  const divActions = document.createElement('div');
  divActions.classList.add('actions');

  const linkContact = document.createElement('a');
  linkContact.id = 'contact';
  linkContact.dataset.id = property.identifier;
  if (isMarketplace) {
    linkContact.dataset.tenant = property.tenant;
  }
  const spanContact = document.createElement('span');
  spanContact.textContent = 'Entrar em contato';
  const message = `Olá, gostaria de mais informações sobre o imóvel: ${window.location.origin}${window.location.pathname}?id=${property.identifier}`;
  const contact = property.responsible.contacts.length > 1
    ? property.responsible.contacts[Math.floor(Math.random() * property.responsible.contacts.length)]
    : property.responsible.contacts[0];
  linkContact.href = `https://api.whatsapp.com/send?phone=55${contact}&text=${encodeURIComponent(message)}`;
  linkContact.target = '_blank';
  linkContact.insertAdjacentHTML('afterbegin', iconWhatsapp);
  linkContact.appendChild(spanContact);
  divActions.appendChild(linkContact);

  const footerActions = document.createElement('div');
  footerActions.classList.add('footer_actions');

  if (!isDirect) {
    const buttonClose = document.createElement('button');
    const spanButton = document.createElement('span');
    spanButton.textContent = 'Voltar';
    buttonClose.insertAdjacentHTML('afterbegin', iconArrowLeft);
    buttonClose.appendChild(spanButton);
    buttonClose.addEventListener('click', () => closePopup(propertyIdentifier));

    footerActions.appendChild(buttonClose);
  } else {
    const buttonClose = document.createElement('button');
    const spanButton = document.createElement('span');
    spanButton.textContent = 'Buscar outros imóveis';
    buttonClose.insertAdjacentHTML('afterbegin', iconSearch);
    buttonClose.appendChild(spanButton);
    buttonClose.addEventListener('click', () => closePopup(propertyIdentifier, true));

    footerActions.appendChild(buttonClose);
  }

  divActions.appendChild(footerActions);
  divPropertyInfos.appendChild(divActions);

  divPropertyContent.appendChild(divPropertyInfos);
};

const closeDialog = (dialogId) => {
  const dialog = document.getElementById(dialogId);
  dialog.close();
}

const navigateCarousel = (propertyIdentifier, operation, context) => {
  const property = properties.find(p => p.identifier === propertyIdentifier);
  if (!property) return;
  const containerSelectorStrategy = {
    article: () => document.querySelector(`#item_result > [data-id="${propertyIdentifier}"]`),
    popup: () => document.querySelector('.property_content')
  }
  const targetContainer = containerSelectorStrategy[context]();
  const buttonPrev = targetContainer.querySelector('.btn_prev');
  const buttonNext = targetContainer.querySelector('.btn_next');
  if (!property.images.currentImage) {
    property.images.currentImage = 0
  }
  const navigationStrategy = {
    next: () => {
      if ((property.images.currentImage + 1) === property.images.totalImages) {
        return true;
      }
      if ((property.images.currentImage + 2) === property.images.totalImages) {
        buttonNext.style.display = 'none';
      }
      property.images.currentImage++
      buttonPrev.style.display = 'block';
      if (context === 'article' && property.images.currentImage >= 3) {
        openPopup(propertyIdentifier);
        return true;
      }
    },
    prev: () => {
      if (!property.images.currentImage) {
        return true;
      }
      if ((property.images.currentImage - 1) === 0) {
        buttonPrev.style.display = 'none';
      }
      buttonNext.style.display = 'block';
      property.images.currentImage--;
    }
  }
  const notChangeImage = navigationStrategy[operation]();
  if (notChangeImage) {
    return;
  }

  const imgProperty = targetContainer.querySelector('figure .img_carousel');
  syncCarouselImage(imgProperty, property, property.images.currentImage);
}

let processSearchTimeout;

const searchProperties = () => {
  const districtsSelect = Array.from(document.querySelectorAll('#districts input[type="checkbox"]:checked')).map(el => el.value);
  const typeProperty = document.querySelector('#type_property').value;
  const princeRange = parseFloat(document.querySelector('#price_range').value);
  const rooms = parseInt(document.querySelector('#rooms').value);
  const garageSpaces = parseInt(document.querySelector('#garage_spaces').value);
  const districts = districtsSelect;
  if (isNaN(princeRange) || isNaN(rooms) || isNaN(garageSpaces) || districts.length === 0 || !typeProperty) {
    alert('Por favor, preencha todos os filtros para realizar a busca.');
    return;
  };
  dataDemand.criteria.city = actualCity;
  dataDemand.criteria.districts = districts;
  dataDemand.criteria.propertyType = typeProperty;
  dataDemand.criteria.rooms = rooms;
  dataDemand.criteria.garageSpaces = garageSpaces;
  dataDemand.criteria.value = princeRange;
  propertiesResult = properties.filter(property =>
    districts.includes(property.address.district) &&
    typeProperty === property.details.type &&
    princeRange >= property.billings.salePrice &&
    rooms <= property.details.rooms &&
    garageSpaces <= property.details.garageSpaces
  );
  const containerItemResult = document.getElementById('item_result');
  containerItemResult.innerHTML = '';
  if (!propertiesResult.length) {
    const contentResult = document.getElementById('search_result');
    const resultEmpty = document.createElement('div');
    resultEmpty.id = 'result_empty';
    const textEmpty = document.createElement('p');
    textEmpty.textContent = 'Não encontramos imóveis com esse perfil no momento. Ajuste a busca para ver outras opções.';
    resultEmpty.appendChild(textEmpty);
    contentResult.appendChild(resultEmpty);
    const search = document.getElementById('search');
    search.classList.add('hidden');
    const searchResult = document.getElementById('search_result');
    searchResult.classList.remove('hidden');
    const dialog = document.getElementById('register_demand_search_empty');
    dialog.showModal();
    return;
  }
  processResults();
  const search = document.getElementById('search');
  search.classList.add('hidden');
  const searchResult = document.getElementById('search_result');
  searchResult.classList.remove('hidden');

  const baseTimer = 8000;
  const extraTimePerProperty = 300;

  const delay = Math.min(baseTimer + (propertiesResult.length * extraTimePerProperty), 30000);

  processSearchTimeout = setTimeout(() => {
    if (propertiesResult.length) {
      if (!popupDetailPropetyOpened) {
        const dialog = document.getElementById('register_demand_search_not_empty');
        dialog.showModal();
      } else {
        triggerOpenPopupDemandWithProperty = true;
      }
    }
  }, delay);
}

const renewSearch = () => {
  const search = document.getElementById('search');
  search.classList.remove('hidden');
  const searchResult = document.getElementById('search_result');
  searchResult.classList.add('hidden');
  propertiesResult = [];
  currentShowPropertyIndex = 0;
  const containerItemResult = document.getElementById('item_result');
  containerItemResult.innerHTML = '';
  const emptyResult = document.getElementById('result_empty');
  if (emptyResult) {
    emptyResult.remove();
  }
  clearTimeout(processSearchTimeout);
}

const processRegistDemand = async (context) => {
  if (processRequest) return;
  validateProcessRequest('initial');
  const name = capitalizeLetter(document.getElementById(`name_${context}`).value, 'allFirstLetters');
  const whatsapp = document.getElementById(`whatsapp_${context}`).value;

  if (!name || !whatsapp) {
    validateProcessRequest('finish');
    alert('Por favor, preencha todos os campos para registrar sua demanda de busca.');
    return;
  }

  dataDemand.contact.name = name;
  dataDemand.contact.whatsapp = parsePhone(whatsapp);

  const registerDemand = await fetch(`${urlBase}/demands`, {
    method: 'POST',
    body: JSON.stringify(dataDemand),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  validateProcessRequest('finish');
  if (!registerDemand.ok) {
    alert('Ocorreu um erro ao registrar sua demanda. Por favor, tente novamente mais tarde.');
    return window.location.href = '/';
  }
  alert('Cadastro realizado com sucesso! Avisaremos você quando surgirem novos imóveis disponíveis.');
  const dialog = document.getElementById(`register_demand_${context}`);
  dialog.close();
}

window.addEventListener('scroll', () => {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

  if (nearBottom) {
    processResults();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  function setBodyFullHeight() {
    const altura = window.innerHeight;
    document.body.style.minHeight = altura + "px";
  }

  window.addEventListener("load", setBodyFullHeight);
  window.addEventListener("resize", setBodyFullHeight);
  window.addEventListener("orientationchange", setBodyFullHeight);
  
  const optionDistricts = document.getElementById("options_districts");
  districtsOptions.forEach(district => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = district;
    checkbox.checked = true;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(district));
    optionDistricts.appendChild(label);
  });

  const selectCity = document.getElementById('select_city');
  citiesOptions.forEach(city => {
    const option = document.createElement('option');
    option.value = city.value;
    option.textContent = city.label;
    if (city.label === actualCity) {
      option.selected = true;
    }
    selectCity.appendChild(option);
  });

  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('id');
  if (propertyId) {
    openPopup(propertyId, true);
  }

  const customSelects = document.querySelectorAll('.custom-select');

  customSelects.forEach(select => {
    const trigger = select.querySelector('.select-trigger');
    const options = select.querySelector('.options');
    const toggleButton = document.getElementById(`${select.id}_toggle`);
    const checkboxes = options.querySelectorAll('input[type="checkbox"]');
    const updateSelectedDistricts = () => {
      const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      if (selected.length === checkboxes.length) {
        trigger.textContent = 'Todos selecionados';
      } else {
        trigger.textContent = selected.length > 0 ? selected.join(', ') : 'Selecione';
      }

      if (toggleButton) {
        toggleButton.textContent = selected.length > 0 ? 'Remover seleção' : 'Selecionar todos';
      }
    };

    trigger.addEventListener('click', () => {
      options.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!select.contains(e.target)) {
        options.classList.remove('open');
      }
    });

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateSelectedDistricts);
    });

    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        const hasSelectedDistrict = Array.from(checkboxes).some(checkbox => checkbox.checked);
        checkboxes.forEach(checkbox => {
          checkbox.checked = !hasSelectedDistrict;
        });
        updateSelectedDistricts();
      });
    }

    updateSelectedDistricts();
  });
});
