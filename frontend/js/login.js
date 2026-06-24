// login.js — 登录页逻辑

(function () {
  renderNavbar('');
  renderFooter();

  // 已登录用户直接跳转首页
  if (auth.isLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const formError = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 清除错误
    formError.classList.remove('show');
    formError.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // 客户端校验
    if (!username) {
      showFormError('请输入用户名');
      return;
    }
    if (!password) {
      showFormError('请输入密码');
      return;
    }

    // 禁用按钮防重复提交
    submitBtn.disabled = true;
    submitBtn.textContent = '登录中…';

    try {
      const data = await api.post('/api/auth/login', { username, password });
      auth.setToken(data.data.token);
      showToast('登录成功！', 'success');
      // 跳转到登录前的页面，或默认首页
      const redirect = getQueryParam('redirect');
      setTimeout(() => {
        window.location.href = redirect || 'index.html';
      }, 500);
    } catch (err) {
      showFormError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = '登 录';
    }
  });

  function showFormError(msg) {
    formError.textContent = msg;
    formError.classList.add('show');
  }
})();
