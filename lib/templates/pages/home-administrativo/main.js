const siteMode = '{{siteMode}}';

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

document.addEventListener('DOMContentLoaded', () => {
  function setBodyFullHeight() {
    const altura = window.innerHeight;
    document.body.style.minHeight = altura + "px";
  }

  window.addEventListener("load", setBodyFullHeight);
  window.addEventListener("resize", setBodyFullHeight);
  window.addEventListener("orientationchange", setBodyFullHeight);

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

  const user_name = getCookie('user_name');
  const token = getCookie('token');
  if (!user_name || !token) {
    window.location.href = '/login/index.html';
    return;
  }
  const userNameElement = document.getElementById('user_name');
  userNameElement.textContent = user_name;
});