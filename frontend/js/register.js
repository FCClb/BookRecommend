// register.js — 注册页逻辑

(function () {
  renderNavbar('');
  renderFooter();

  // 已登录用户跳转首页
  if (auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('registerForm');
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');

  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');
  const confirmError = document.getElementById('confirmError');

  // 实时清除字段错误
  usernameInput.addEventListener('input', () => hideFieldError(usernameError));
  passwordInput.addEventListener('input', () => hideFieldError(passwordError));
  confirmInput.addEventListener('input', () => hideFieldError(confirmError));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 清除所有提示
    clearErrors();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    // === 客户端校验 ===

    let valid = true;

    if (!username || username.length < 2 || username.length > 20) {
      showFieldError(usernameError, '用户名需要 2–20 个字符');
      valid = false;
    }

    if (!password || password.length < 6) {
      showFieldError(passwordError, '密码至少需要 6 位');
      valid = false;
    }

    if (password !== confirm) {
      showFieldError(confirmError, '两次输入的密码不一致');
      valid = false;
    }

    if (!valid) return;

    // 禁用按钮
    submitBtn.disabled = true;
    submitBtn.textContent = '注册中…';

    try {
      await api.post('/api/auth/register', { username, password });
      // 注册成功
      formSuccess.textContent = '注册成功！即将跳转到登录页…';
      formSuccess.classList.add('show');
      form.reset();
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (err) {
      showFormError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = '注 册';
    }
  });

  function showFieldError(el, msg) {
    el.textContent = msg;
    el.classList.add('show');
  }

  function hideFieldError(el) {
    el.classList.remove('show');
    el.textContent = '';
  }

  function showFormError(msg) {
    formError.textContent = msg;
    formError.classList.add('show');
  }

  function clearErrors() {
    formError.classList.remove('show');
    formError.textContent = '';
    formSuccess.classList.remove('show');
    formSuccess.textContent = '';
    hideFieldError(usernameError);
    hideFieldError(passwordError);
    hideFieldError(confirmError);
  }
})();
