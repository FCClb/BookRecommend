// detail.js — 图书详情页：全字段展示 + 收藏/取消收藏

let currentBook = null;

(async function () {
  renderNavbar('');
  renderFooter();

  const bookId = getQueryParam('id');
  if (!bookId) {
    document.getElementById('detailContent').innerHTML =
      '<div class="empty-state"><div class="icon">⚠️</div><p>缺少图书 ID 参数</p></div>';
    return;
  }

  try {
    const data = await api.get(`/api/books/${bookId}`);
    currentBook = data.data;

    renderDetail(currentBook);
  } catch (err) {
    document.getElementById('detailContent').innerHTML =
      `<div class="empty-state"><div class="icon">⚠️</div><p>加载失败：${err.message}</p></div>`;
  }
})();

function renderDetail(book) {
  const rating = parseFloat(book.rating).toFixed(1);
  const pubDate = book.publish_date ? new Date(book.publish_date).toLocaleDateString('zh-CN') : '未知';
  const isLoggedIn = auth.isLoggedIn();

  // 收藏按钮 HTML
  let favHTML = '';
  if (isLoggedIn) {
    const favClass = book.is_favorited ? 'btn-fav favorited' : 'btn-fav';
    const favText = book.is_favorited ? '❤️ 已收藏' : '🤍 收藏此书';
    favHTML = `<button class="btn ${favClass}" id="favBtn" onclick="toggleFavorite()">${favText}</button>`;
  } else {
    favHTML = `<p style="color:var(--text-light);font-size:0.85rem;">💡 <a href="login.html?redirect=detail.html%3Fid%3D${book.id}" style="color:var(--primary);text-decoration:underline">登录</a>后可以收藏图书</p>`;
  }

  const html = `
    <div class="detail-layout">
      <!-- 封面 -->
      <div class="detail-cover">
        ${renderCoverBlock(book.cover_url, book.title, 'detail-cover-img', 'detail-cover-placeholder')}
      </div>

      <!-- 信息 -->
      <div class="detail-info">
        <h1 class="book-title">${book.title}</h1>
        <p class="book-author">${book.author} 著</p>

        <div class="detail-rating">⭐ ${rating} 分</div>

        <table class="meta-table">
          <tr><td>出版社</td><td>${book.publisher || '未知'}</td></tr>
          <tr><td>出版日期</td><td>${pubDate}</td></tr>
          <tr><td>页数</td><td>${book.pages ? book.pages + ' 页' : '未知'}</td></tr>
          <tr><td>分类</td><td>${book.category_name || '未分类'}</td></tr>
        </table>

        <div class="book-description">
          <h3>📝 内容简介</h3>
          <p>${book.description || '暂无简介'}</p>
        </div>

        <div class="fav-section">
          ${favHTML}
        </div>
      </div>
    </div>
  `;

  document.getElementById('detailContent').innerHTML = html;
}

async function toggleFavorite() {
  if (!currentBook) return;

  try {
    if (currentBook.is_favorited) {
      await api.delete(`/api/favorites/${currentBook.id}`);
      currentBook.is_favorited = false;
      showToast('已取消收藏', 'info');
    } else {
      await api.post('/api/favorites', { book_id: currentBook.id });
      currentBook.is_favorited = true;
      showToast('收藏成功！', 'success');
    }
    // 刷新按钮状态
    renderDetail(currentBook);
  } catch (err) {
    showToast(err.message, 'error');
  }
}
