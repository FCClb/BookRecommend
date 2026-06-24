// index.js — 首页逻辑：加载推荐图书 + 渲染卡片

(async function () {
  renderNavbar('home');
  renderFooter();

  // 2. 加载推荐图书
  const grid = document.getElementById('bookGrid');

  try {
    const data = await api.get('/api/books/recommended?limit=8');
    const books = data.data.list;

    if (books.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>暂无推荐图书</p></div>';
      return;
    }

    // 3. 渲染卡片
    grid.innerHTML = books.map(book => renderBookCard(book)).join('');

    // 4. 卡片点击跳转详情页
    grid.querySelectorAll('.book-card').forEach((card, i) => {
      card.addEventListener('click', () => {
        window.location.href = `detail.html?id=${books[i].id}`;
      });
    });
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>加载失败：${err.message}</p></div>`;
  }
})();
