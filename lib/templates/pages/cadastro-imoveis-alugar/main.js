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
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
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

const slugifyCity = (cityName = '') => cityName
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/ç/g, "c")
  .replace(/Ç/g, "c")
  .toLowerCase()
  .trim()
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9-]/g, "")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

const getPropertyPublicLink = (property) => {
  const currentUrl = new URL(window.location.href);
  const citySlug = slugifyCity(property?.address?.city);
  const propertyIdentifier = property?.identifier;

  return `${currentUrl.origin}/imoveis/alugar/${citySlug}/index.html?id=${propertyIdentifier}`;
};

const isAdActive = (property) => {
  if (!property?.ad?.visibleFrom) return false;
  const now = new Date();
  return property.ad && (new Date(property.ad.visibleUntil) > new Date() || !property.ad.visibleUntil);
}

const copyTextToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const generateQRCodeUrl = (link) => {
  const encoded = encodeURIComponent(link);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`;
}

const printSticker = (qrCodeUrl) => {
  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
    <html>
      <head>
        <style>
          @media print {
            body {
              margin: 0;
            }

            .page {
              width: 21cm;
              height: 29.7cm;
              padding: 0cm 0.5cm;
              box-sizing: border-box;
              position: relative;
              font-family: Arial, sans-serif;
            }

            .sticker {
              position: absolute;
              top: 0;
              left: 0;

              width: 10cm;
              height: 8cm;

              display: flex;
              align-items: center;
              gap: 12px;
            }

            .qr {
              width: 4.5cm;
              height: 4.5cm;
            }

            .info {
              display: flex;
              flex-direction: column;
              justify-content: center;
            }

            .text {
              font-size: 18px;
              line-height: 1.3;
              color: #333;
              font-weight: 600;
            }
          }
        </style>
      </head>

      <body>
        <div class="page">
          <div class="sticker">
            <img class="qr" src="${qrCodeUrl}" />

            <div class="info">
              <div class="text">
                Aponte a câmera para o código e veja detalhes do imóvel
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  const user_name = getCookie('user_name');
  const token = getCookie('token');
  if (!user_name || !token) {
    window.location.href = '/login/index.html';
    return;
  }

  const res = await fetch(`${urlBase}/properties?intent=rent`, {
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
    const wrapper = document.createElement('div');
    wrapper.classList.add('property-card');
    const link = document.createElement('a');
    link.href = `/administrativo/imoveis/alugar/editar/index.html?id=${_id}`;
    const article = document.createElement('article');
    const name = document.createElement('p');
    name.textContent = capitalizeLetter(responsible.ownerName, 'allFirstLetters');
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
    wrapper.appendChild(link);

    if (isAdActive(property)) {
      const actions = document.createElement('div');
      actions.classList.add('card_buttons_actions');

      const generateLinkButton = document.createElement('button');
      generateLinkButton.type = 'button';
      generateLinkButton.classList.add('buttons_actions');
      generateLinkButton.textContent = 'Gerar link';
      
      generateLinkButton.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        try {
          const propertyPublicLink = getPropertyPublicLink(property);
          await copyTextToClipboard(propertyPublicLink);
          generateLinkButton.textContent = 'Link copiado!';
          window.setTimeout(() => {
            generateLinkButton.textContent = 'Gerar link';
          }, 2000);
        } catch (error) {
          alert('Não foi possível copiar o link do imóvel. Tente novamente.');
        }
      });

      const generateQrCodeButton = document.createElement('button');
      generateQrCodeButton.type = 'button';
      generateQrCodeButton.classList.add('buttons_actions', 'button_qrcode');
      generateQrCodeButton.textContent = 'Gerar QR Code';
      generateQrCodeButton.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const propertyPublicLink = getPropertyPublicLink(property);
        const qrCodeUrl = generateQRCodeUrl(propertyPublicLink);
        printSticker(qrCodeUrl);
      });

      actions.appendChild(generateLinkButton);
      actions.appendChild(generateQrCodeButton);

      wrapper.appendChild(actions);
    }
    fragment.appendChild(wrapper);
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
    if (selectedStatusValue === 'published') {
      propertiesFiltered = properties.filter(property => isAdActive(property));
    } else {
      propertiesFiltered = properties.filter(property => property.propertyStatus.status === selectedStatusValue);
    }
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