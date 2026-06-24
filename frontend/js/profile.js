// profile.js — 个人中心：用户信息 + 收藏列表管理

let currentUser = null;
let favoritesList = [];

(async function () {
  renderNavbar('profile');
  renderFooter();

  // 未登录用户重定向到登录页
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html?redirect=profile.html';
    return;
  }

  const container = document.getElementById('profileContent');

  try {
    // 并行加载用户信息和收藏列表
    const [profileData, favData] = await Promise.all([
      api.get('/api/user/profile'),
      api.get('/api/favorites'),
    ]);

    currentUser = profileData.data;
    favoritesList = favData.data.list;

    renderProfile(currentUser, favoritesList);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>加载失败：${err.message}</p></div>`;
  }
})();

function renderProfile(user, favorites) {
  const roleLabel = user.role === 'admin' ? '管理员' : '普通用户';
  const roleClass = user.role === 'admin' ? 'admin' : 'user';
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString('zh-CN')
    : '未知';

  let favHTML = '';
  if (favorites.length === 0) {
    favHTML = `
      <div class="favorites-section">
        <h3>❤️ 我的收藏 <span class="fav-count">（0 本）</span></h3>
        <div class="empty-state">
          <div class="icon">📭</div>
          <p>还没有收藏任何图书</p>
          <a href="list.html" class="btn btn-primary" style="margin-top:16px;">去逛逛 →</a>
        </div>
      </div>`;
  } else {
    favHTML = `
      <div class="favorites-section">
        <h3>❤️ 我的收藏 <span class="fav-count">（${favorites.length} 本）</span></h3>
        <div class="fav-grid">
          ${favorites.map(fav => renderFavCard(fav)).join('')}
        </div>
      </div>`;
  }

  const html = `
    <div class="profile-card">
      <div class="profile-avatar">${user.username.charAt(0).toUpperCase()}</div>
      <div class="profile-info">
        <div class="profile-name">${user.username}</div>
        <div class="profile-meta">
          <span class="role-badge ${roleClass}">${roleLabel}</span>
          <span>📅 注册于 ${createdAt}</span>
        </div>
      </div>
    </div>
    ${favHTML}
  `;

  document.getElementById('profileContent').innerHTML = html;

  // 绑定取消收藏事件
  document.querySelectorAll('.btn-unfav').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const bookId = parseInt(btn.dataset.bookId);
      await removeFavorite(bookId);
    });
  });

  // 绑定卡片标题点击跳转
  document.querySelectorAll('.fav-card .card-title').forEach(title => {
    title.addEventListener('click', () => {
      const bookId = title.dataset.bookId;
      window.location.href = `detail.html?id=${bookId}`;
    });
  });
}

function renderFavCard(fav) {
  const rating = parseFloat(fav.rating).toFixed(1);
  const favDate = fav.favorited_at
    ? new Date(fav.favorited_at).toLocaleDateString('zh-CN')
    : '';

  return `
    <div class="fav-card" title="${fav.title} — ${fav.author}">
      ${renderCoverBlock(fav.cover_url, fav.title, 'card-cover', 'card-cover-placeholder')}
      <button class="btn-unfav" data-book-id="${fav.book_id}" title="取消收藏">✕</button>
      <div class="card-body">
        <div class="card-title" data-book-id="${fav.book_id}">${fav.title}</div>
        <div class="card-author">${fav.author}</div>
        <div class="card-rating">⭐ ${rating}</div>
        <div class="fav-date">${favDate} 收藏</div>
      </div>
    </div>
  `;
}

async function removeFavorite(bookId) {
  try {
    await api.delete(`/api/favorites/${bookId}`);
    favoritesList = favoritesList.filter(f => f.book_id !== bookId);
    showToast('已取消收藏', 'info');

    // 重新渲染收藏区域（保留原始用户信息）
    renderProfile(currentUser, favoritesList);
  } catch (err) {
    showToast(err.message, 'error');
  }
}
