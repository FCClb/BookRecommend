// admin.js — 后台管理：图书 CRUD + 权限控制

let booksList = [];
let categoriesList = [];
let editId = null;      // 当前编辑的图书 ID（null = 新增模式）
let deleteId = null;    // 待删除的图书 ID

// ==================== 页面初始化 ====================
(async function () {
  renderNavbar('admin');
  renderFooter();

  // 权限守卫：非管理员禁止访问
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html?redirect=admin.html';
    return;
  }
  if (!auth.isAdmin()) {
    document.getElementById('tableContainer').innerHTML = `
      <div class="permission-denied">
        <div class="icon">🚫</div>
        <h2>权限不足</h2>
        <p>您需要管理员权限才能访问此页面</p>
        <a href="index.html" class="btn btn-primary">返回首页</a>
      </div>`;
    return;
  }

  // 加载分类 + 图书列表
  await Promise.all([loadCategories(), loadBooks()]);

  // ==================== 事件绑定 ====================

  // 新增图书按钮
  document.getElementById('addBtn').addEventListener('click', () => openFormModal());

  // 关闭模态框
  document.getElementById('closeModal').addEventListener('click', closeFormModal);
  document.getElementById('cancelBtn').addEventListener('click', closeFormModal);
  document.getElementById('formModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeFormModal();
  });

  // 表单提交
  document.getElementById('bookForm').addEventListener('submit', handleFormSubmit);

  // 删除确认模态框
  document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
  document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDeleteBtn').addEventListener('click', handleDelete);
  document.getElementById('deleteModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });
})();

// ==================== 分类加载 ====================
async function loadCategories() {
  try {
    const data = await api.get('/api/categories');
    categoriesList = data.data.list;

    const select = document.getElementById('category_id');
    categoriesList.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
  } catch (_) {}
}

// ==================== 图书列表加载 ====================
async function loadBooks() {
  const container = document.getElementById('tableContainer');

  try {
    const data = await api.get('/api/books?page_size=100');
    booksList = data.data.list;

    if (booksList.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <p>还没有任何图书</p>
        </div>`;
      return;
    }

    renderTable(booksList);
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>加载失败：${err.message}</p></div>`;
  }
}

// ==================== 表格渲染 ====================
function renderTable(books) {
  const rows = books.map(book => {
    const rating = parseFloat(book.rating || 0).toFixed(1);
    return `
      <tr>
        <td class="col-id">${book.id}</td>
        <td class="col-title">${book.title}</td>
        <td class="col-author">${book.author}</td>
        <td class="col-category">${book.category_name || '-'}</td>
        <td class="col-rating"><span class="rating-badge">⭐ ${rating}</span></td>
        <td class="col-actions">
          <button class="btn btn-outline btn-table btn-sm" data-edit="${book.id}">编辑</button>
          <button class="btn btn-danger btn-table btn-sm" data-delete="${book.id}" data-title="${book.title}">删除</button>
        </td>
      </tr>`;
  }).join('');

  document.getElementById('tableContainer').innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th class="col-id">ID</th>
          <th class="col-title">书名</th>
          <th class="col-author">作者</th>
          <th class="col-category">分类</th>
          <th class="col-rating">评分</th>
          <th class="col-actions">操作</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  // 绑定编辑按钮
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.edit);
      const book = booksList.find(b => b.id === id);
      if (book) openFormModal(book);
    });
  });

  // 绑定删除按钮
  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteId = parseInt(btn.dataset.delete);
      document.getElementById('deleteMessage').textContent =
        `确定要删除《${btn.dataset.title}》吗？此操作不可撤销。`;
      document.getElementById('deleteModal').classList.add('show');
    });
  });
}

// ==================== 模态框控制 ====================
function openFormModal(book = null) {
  const modal = document.getElementById('formModal');
  const form = document.getElementById('bookForm');
  const modalTitle = document.getElementById('modalTitle');
  const formError = document.getElementById('formError');

  form.reset();
  formError.classList.remove('show');
  formError.textContent = '';

  if (book) {
    // 编辑模式
    editId = book.id;
    modalTitle.textContent = '编辑图书';

    document.getElementById('title').value = book.title || '';
    document.getElementById('author').value = book.author || '';
    document.getElementById('category_id').value = book.category_id || '';
    document.getElementById('rating').value = book.rating ?? '';
    document.getElementById('publisher').value = book.publisher || '';
    document.getElementById('publish_date').value = book.publish_date ? book.publish_date.split('T')[0] : '';
    document.getElementById('pages').value = book.pages || '';
    document.getElementById('cover_url').value = book.cover_url || '';
    document.getElementById('description').value = book.description || '';
  } else {
    // 新增模式
    editId = null;
    modalTitle.textContent = '新增图书';
  }

  modal.classList.add('show');
}

function closeFormModal() {
  document.getElementById('formModal').classList.remove('show');
  editId = null;
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('show');
  deleteId = null;
}

// ==================== 表单提交 ====================
async function handleFormSubmit(e) {
  e.preventDefault();

  const formError = document.getElementById('formError');
  formError.classList.remove('show');
  formError.textContent = '';

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();

  if (!title) {
    showFormError('请输入书名');
    return;
  }
  if (!author) {
    showFormError('请输入作者');
    return;
  }

  const body = {
    title,
    author,
    category_id: document.getElementById('category_id').value || null,
    rating: document.getElementById('rating').value || null,
    publisher: document.getElementById('publisher').value.trim() || null,
    publish_date: document.getElementById('publish_date').value || null,
    pages: document.getElementById('pages').value || null,
    cover_url: document.getElementById('cover_url').value.trim() || null,
    description: document.getElementById('description').value.trim() || null,
  };

  // 清理空字符串
  Object.keys(body).forEach(k => {
    if (body[k] === '' || body[k] === null) {
      // category_id 转为 null
    }
    if (body[k] === '') body[k] = null;
  });
  if (body.rating === null || body.rating === '') body.rating = null;
  else body.rating = parseFloat(body.rating);

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = '保存中…';

  try {
    if (editId) {
      await api.put(`/api/books/${editId}`, body);
      showToast('图书更新成功！', 'success');
    } else {
      await api.post('/api/books', body);
      showToast('图书添加成功！', 'success');
    }
    closeFormModal();
    await loadBooks();
  } catch (err) {
    showFormError(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '保 存';
  }
}

// ==================== 删除图书 ====================
async function handleDelete() {
  if (!deleteId) return;

  const confirmBtn = document.getElementById('confirmDeleteBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = '删除中…';

  try {
    await api.delete(`/api/books/${deleteId}`);
    showToast('图书删除成功！', 'success');
    closeDeleteModal();
    await loadBooks();
  } catch (err) {
    showToast(err.message, 'error');
    closeDeleteModal();
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = '确认删除';
  }
}

function showFormError(msg) {
  const formError = document.getElementById('formError');
  formError.textContent = msg;
  formError.classList.add('show');
}
