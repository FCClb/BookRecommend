const express = require('express');
const { body, query, validationResult } = require('express-validator');
const pool = require('../config/db');
const { success, created, fail } = require('../utils/response');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ==================== GET / — 图书列表（搜索/筛选/排序/分页） ====================
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('page_size').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('keyword').optional().trim(),
    query('category_id').optional().isInt().toInt(),
    query('sort').optional().isIn(['rating_desc', 'rating_asc', 'newest']),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return fail(res, errors.array()[0].msg, 400);
      }

      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.page_size) || 8;
      const keyword = req.query.keyword || '';
      const categoryId = req.query.category_id ? parseInt(req.query.category_id) : null;
      const sort = req.query.sort || '';

      let sql = `
        SELECT b.*, c.name AS category_name
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      // 关键词搜索：书名 + 作者
      if (keyword) {
        sql += ' AND (b.title LIKE ? OR b.author LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`);
      }

      // 分类筛选
      if (categoryId) {
        sql += ' AND b.category_id = ?';
        params.push(categoryId);
      }

      // 排序
      if (sort === 'rating_desc') {
        sql += ' ORDER BY b.rating DESC';
      } else if (sort === 'rating_asc') {
        sql += ' ORDER BY b.rating ASC';
      } else if (sort === 'newest') {
        sql += ' ORDER BY b.created_at DESC';
      } else {
        sql += ' ORDER BY b.id DESC';
      }

      // 总数
      const countSql = sql.replace(/SELECT b\.\*, c\.name AS category_name[\s\S]*?FROM/, 'SELECT COUNT(*) AS total FROM');
      const [countRows] = await pool.query(countSql, params);
      const total = countRows[0].total;

      // 分页
      const offset = (page - 1) * pageSize;
      sql += ' LIMIT ? OFFSET ?';
      params.push(pageSize, offset);

      const [rows] = await pool.query(sql, params);

      return success(res, {
        list: rows,
        pagination: {
          page,
          page_size: pageSize,
          total,
          total_pages: Math.ceil(total / pageSize),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ==================== GET /recommended — 首页推荐（评分降序） ====================
router.get('/recommended', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const [rows] = await pool.query(
      `SELECT b.*, c.name AS category_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       ORDER BY b.rating DESC
       LIMIT ?`,
      [limit]
    );

    return success(res, { list: rows });
  } catch (err) {
    next(err);
  }
});

// ==================== GET /:id — 图书详情 ====================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT b.*, c.name AS category_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return fail(res, '图书不存在', 404);
    }

    const book = rows[0];

    // 若已登录，查询是否已收藏
    book.is_favorited = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        const [favRows] = await pool.query(
          'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?',
          [decoded.id, id]
        );
        book.is_favorited = favRows.length > 0;
      } catch (_) {
        // token 无效则忽略
      }
    }

    return success(res, book);
  } catch (err) {
    next(err);
  }
});

// ==================== POST / — 新增图书 🔒 admin ====================
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('title').trim().notEmpty().withMessage('书名不能为空'),
    body('author').trim().notEmpty().withMessage('作者不能为空'),
    body('rating').optional().isFloat({ min: 0, max: 10 }).withMessage('评分需在0-10之间'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return fail(res, errors.array()[0].msg, 400);
      }

      const { title, author, cover_url, description, category_id, rating, publisher, publish_date, pages } = req.body;

      const [result] = await pool.query(
        `INSERT INTO books (title, author, cover_url, description, category_id, rating, publisher, publish_date, pages)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          author,
          cover_url || null,
          description || null,
          category_id || null,
          rating ?? 0,
          publisher || null,
          publish_date || null,
          pages || null,
        ]
      );

      return created(res, { id: result.insertId }, '图书添加成功');
    } catch (err) {
      next(err);
    }
  }
);

// ==================== PUT /:id — 修改图书 🔒 admin ====================
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查是否存在
    const [existing] = await pool.query('SELECT id FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      return fail(res, '图书不存在', 404);
    }

    const allowed = ['title', 'author', 'cover_url', 'description', 'category_id', 'rating', 'publisher', 'publish_date', 'pages'];
    const sets = [];
    const params = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        sets.push(`${key} = ?`);
        params.push(req.body[key]);
      }
    }

    if (sets.length === 0) {
      return fail(res, '未提供需要修改的字段', 400);
    }

    params.push(id);
    await pool.query(`UPDATE books SET ${sets.join(', ')} WHERE id = ?`, params);

    return success(res, null, '图书更新成功');
  } catch (err) {
    next(err);
  }
});

// ==================== DELETE /:id — 删除图书 🔒 admin ====================
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      return fail(res, '图书不存在', 404);
    }

    await pool.query('DELETE FROM books WHERE id = ?', [id]);

    return success(res, null, '图书删除成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
