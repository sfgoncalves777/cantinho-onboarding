const siteMode = '{{siteMode}}';
const citiesOptions = {{citiesOptions}};
const contactOptions = {{contactOptions}};

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

document.addEventListener('DOMContentLoaded', function () {
  function setBodyFullHeight() {
    const altura = window.innerHeight;
    document.body.style.minHeight = altura + "px";
  }

  window.addEventListener("load", setBodyFullHeight);
  window.addEventListener("resize", setBodyFullHeight);
  window.addEventListener("orientationchange", setBodyFullHeight);

  const selectCity = document.getElementById('selected_city');
  citiesOptions.forEach(city => {
    const option = document.createElement('option');
    option.value = city.value;
    option.textContent = city.label;
    selectCity.appendChild(option);
  });

  const buyBtn = document.querySelector('[data-action="buy"]');
  const rentBtn = document.querySelector('[data-action="rent"]');

  if (siteMode === 'sale') {
    buyBtn.style.display = 'flex';
  }

  if (siteMode === 'rent') {
    rentBtn.style.display = 'flex';
  }

  if (siteMode === 'both') {
    buyBtn.style.display = 'flex';
    rentBtn.style.display = 'flex';
  }

  const buyButton = document.querySelector('button[data-action="buy"]');
  const rentButton = document.querySelector('button[data-action="rent"]');
  const citySelect = document.getElementById('selected_city');

  function redirectTo(action) {
    const city = citySelect.value;
    if (!city) {
      alert("Por favor, selecione uma cidade.");
      return;
    }
    window.location.href = `/imoveis/${action}/${city}/index.html`;
  }

  if (buyButton) {
    buyButton.addEventListener('click', function () {
      redirectTo('venda');
    });
  }

  if (rentButton) {
    rentButton.addEventListener('click', function () {
      redirectTo('alugar');
    });
  }
});
