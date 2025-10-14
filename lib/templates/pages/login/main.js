const urlBase = '{{urlBase}}';

const getCookie = (name) => {
  const value = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return value ? decodeURIComponent(value.split('=')[1]) : null;
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
  const token = getCookie('token');
  if (user_name && token) {
    window.location.href = '/administrativo/index.html';
    return;
  }

  document.getElementById('login_form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const form = new FormData(event.target);

      const email = form.get('email');
      const password = form.get('password');

      if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      const res = await fetch(`${urlBase}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (res.status === 401) {
        alert('Email ou senha incorretos. Por favor, tente novamente.');
        return;
      }

      if (!res.ok) {
        alert('Erro ao fazer o login. Por favor, tente novamente.');
        return;
      }

      const { token, token_exp, user_name } = await res.json();

      // Tempo de expiração: 1 hora (em segundos)
      document.cookie = `user_name=${encodeURIComponent(user_name)}; max-age=${token_exp}; path=/`;
      document.cookie = `token=${encodeURIComponent(token)}; max-age=${token_exp}; path=/`;
      window.location.href = '/administrativo/index.html';
    } catch (error) {
      alert('Erro ao fazer o login. Por favor, tente novamente.');
    }
  });
});