// list.js — 图书列表页：搜索 / 筛选 / 排序 / 分页

let currentPage = 1;
let currentKeyword = '';
let currentCategoryId = '';
let currentSort = '';

(async function () {
  renderNavbar('list');
  renderFooter();

  // 从 URL 恢复状态
  currentKeyword = getQueryParam('keyword') || '';
  currentCategoryId = getQueryParam('category_id') || '';
  currentSort = getQueryParam('sort') || '';
  currentPage = parseInt(getQueryParam('page')) || 1;

  document.getElementById('searchInput').value = currentKeyword;

  // 加载分类下拉
  await loadCategories();

  // 恢复筛选/排序值
  document.getElementById('categoryFilter').value = currentCategoryId;
  document.getElementById('sortSelect').value = currentSort;

  // 加载图书
  await loadBooks();

  // 事件绑定
  document.getElementById('searchBtn').addEventListener('click', () => {
    currentKeyword = document.getElementById('searchInput').value.trim();
    currentPage = 1;
    updateURL();
    loadBooks();
  });

  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('searchBtn').click();
    }
  });

  document.getElementById('categoryFilter').addEventListener('change', (e) => {
    currentCategoryId = e.target.value;
    currentPage = 1;
    updateURL();
    loadBooks();
  });

  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    updateURL();
    loadBooks();
  });
})();

async function loadCategories() {
  try {
    const data = await api.get('/api/categories');
    const select = document.getElementById('categoryFilter');
    data.data.list.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
  } catch (_) {}
}

async function loadBooks() {
  const grid = document.getElementById('bookGrid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div><p>正在加载…</p></div>';

  try {
    const params = new URLSearchParams();
    params.set('page', currentPage);
    params.set('page_size', 8);
    if (currentKeyword) params.set('keyword', currentKeyword);
    if (currentCategoryId) params.set('category_id', currentCategoryId);
    if (currentSort) params.set('sort', currentSort);

    const data = await api.get(`/api/books?${params.toString()}`);
    const { list, pagination } = data.data;

    if (list.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>没有找到匹配的图书</p></div>';
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    // 渲染卡片（复用 index.js 的 renderBookCard）
    grid.innerHTML = list.map(book => renderBookCard(book)).join('');

    // 卡片点击跳转
    grid.querySelectorAll('.book-card').forEach((card, i) => {
      card.addEventListener('click', () => {
        window.location.href = `detail.html?id=${list[i].id}`;
      });
    });

    // 渲染分页
    renderPagination(pagination);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>加载失败：${err.message}</p></div>`;
    document.getElementById('pagination').innerHTML = '';
  }
}

function renderPagination(p) {
  const container = document.getElementById('pagination');
  if (p.total_pages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<button ${p.page <= 1 ? 'disabled' : ''} data-page="${p.page - 1}">‹</button>`;

  for (let i = 1; i <= p.total_pages; i++) {
    const active = i === p.page ? ' class="active"' : '';
    html += `<button${active} data-page="${i}">${i}</button>`;
  }

  html += `<button ${p.page >= p.total_pages ? 'disabled' : ''} data-page="${p.page + 1}">›</button>`;
  html += `<span class="page-info">共 ${p.total} 本</span>`;

  container.innerHTML = html;

  container.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page);
      if (page >= 1 && page <= p.total_pages && page !== currentPage) {
        currentPage = page;
        updateURL();
        loadBooks();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

function updateURL() {
  const params = new URLSearchParams();
  if (currentKeyword) params.set('keyword', currentKeyword);
  if (currentCategoryId) params.set('category_id', currentCategoryId);
  if (currentSort) params.set('sort', currentSort);
  if (currentPage > 1) params.set('page', currentPage);
  const qs = params.toString();
  history.replaceState(null, '', qs ? `list.html?${qs}` : 'list.html');
}
