// common.js — 导航栏 & 页脚渲染（所有页面共用）

/**
 * 渲染顶部导航栏
 * @param {string} currentPage 当前页面标识：'home' | 'list' | 'profile' | 'admin'
 */
function renderNavbar(currentPage = '') {
  const isLoggedIn = auth.isLoggedIn();
  const isAdmin = auth.isAdmin();
  const user = auth.getUser();

  const active = (page) => currentPage === page ? ' class="active"' : '';

  const html = `
    <nav class="navbar">
      <div class="container">
        <a href="index.html" class="logo">
          📚 图书推荐
        </a>
        <div class="nav-links">
          <a href="index.html"${active('home')}>首页</a>
          <a href="list.html"${active('list')}>图书列表</a>
          ${isAdmin ? '<a href="admin.html"' + active('admin') + '>管理</a>' : ''}
        </div>
        <div class="nav-right">
          ${isLoggedIn ? `
            <span class="username">👤 ${user.username}</span>
            <a href="profile.html" class="btn btn-outline btn-sm">个人中心</a>
            <button class="btn btn-outline btn-sm" onclick="auth.logout()">退出</button>
          ` : `
            <a href="login.html" class="btn btn-outline btn-sm">登录</a>
            <a href="register.html" class="btn btn-primary btn-sm">注册</a>
          `}
        </div>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', html);
}

/**
 * 渲染页脚
 */
function renderFooter() {
  const html = `
    <footer class="footer">
      <div class="container">
        <p>© 2026 图书推荐网站 · 高锦博 24469209</p>
      </div>
    </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * 显示 Toast 提示
 * @param {string} message 提示文字
 * @param {string} type 'success' | 'error' | 'info'
 * @param {number} duration 显示时长（毫秒）
 */
function showToast(message, type = 'info', duration = 2500) {
  const old = document.querySelector('.toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), duration);
}

/**
 * 获取 URL 查询参数
 */
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

// ============================================================
//  封面图片辅助函数
// ============================================================

/**
 * 修正封面路径：绝对路径 → 相对路径
 * 数据库存的是 "/images/covers/book-01.jpg"，转为相对路径 "images/covers/book-01.jpg"
 */
function fixCoverPath(url) {
  if (!url) return '';
  return url.replace(/^\/+/, '');
}

/**
 * 封面图片加载失败时的全局回调（扩展名自动回退）
 * 依次尝试 .jpg → .webp → .png，全部失败则显示占位符
 *
 * @param {HTMLImageElement} img     图片元素
 * @param {string}           placeholderSelector  占位符的选择器（相对于 img 的父元素）
 */
function handleCoverError(img, placeholderSelector) {
  // 记录已尝试的扩展名
  var tried = img.getAttribute('data-tried-ext');
  if (!tried) tried = '';
  var src = img.src;
  var lastDot = src.lastIndexOf('.');
  var base = lastDot > 0 ? src.substring(0, lastDot) : src;

  // 尝试列表
  var exts = ['.jpg', '.webp', '.png'];
  for (var i = 0; i < exts.length; i++) {
    if (tried.indexOf(exts[i]) === -1) {
      img.setAttribute('data-tried-ext', tried + exts[i]);
      img.src = base + exts[i];
      return;
    }
  }

  // 所有扩展名都失败了，显示占位符
  img.classList.add('is-hidden');
  var placeholder = img.parentElement.querySelector(placeholderSelector);
  if (placeholder) {
    placeholder.classList.add('is-visible');
  }
}

/**
 * 生成封面区块 HTML（图片 + 占位符，含扩展名回退）
 *
 * @param {string} coverUrl          数据库中的 cover_url
 * @param {string} title             书名（用于占位符首字）
 * @param {string} imgClass          图片 CSS 类名
 * @param {string} placeholderClass  占位符 CSS 类名
 * @returns {string} HTML 字符串
 */
function renderCoverBlock(coverUrl, title, imgClass, placeholderClass) {
  var src = fixCoverPath(coverUrl);
  var firstChar = title ? title.charAt(0) : '📖';

  if (!src) {
    return '<div class="' + placeholderClass + ' is-visible"><span class="placeholder-char">' + firstChar + '</span></div>';
  }

  return '<img src="' + src + '" alt="' + title + '" class="' + imgClass + '" loading="lazy"'
    + ' onerror="handleCoverError(this,\'.' + placeholderClass + '\')">'
    + '<div class="' + placeholderClass + '"><span class="placeholder-char">' + firstChar + '</span></div>';
}

/**
 * 渲染单张图书卡片 HTML（首页和列表页共用）
 */
function renderBookCard(book) {
  const rating = parseFloat(book.rating).toFixed(1);

  return `
    <div class="book-card" title="${book.title} — ${book.author}">
      <div class="card-cover-wrapper">
        ${renderCoverBlock(book.cover_url, book.title, 'card-cover', 'card-cover-placeholder')}
      </div>
      <div class="card-body">
        <div class="card-title">${book.title}</div>
        <div class="card-author">${book.author}</div>
        <div class="card-meta">
          <span class="card-rating">⭐ ${rating}</span>
          <span class="card-category">${book.category_name || ''}</span>
        </div>
      </div>
    </div>
  `;
}
