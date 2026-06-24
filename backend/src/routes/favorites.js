const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { success, created, fail } = require('../utils/response');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ==================== GET / — 我的收藏列表 ====================
router.get('/', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.id, f.book_id, f.created_at AS favorited_at,
              b.title, b.author, b.cover_url, b.rating
       FROM favorites f
       JOIN books b ON f.book_id = b.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    return success(res, { list: rows });
  } catch (err) {
    next(err);
  }
});

// ==================== POST / — 添加收藏 ====================
router.post(
  '/',
  authenticate,
  [body('book_id').isInt({ min: 1 }).withMessage('图书ID无效')],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return fail(res, errors.array()[0].msg, 400);
      }

      const { book_id } = req.body;

      // 验证图书存在
      const [books] = await pool.query('SELECT id FROM books WHERE id = ?', [book_id]);
      if (books.length === 0) {
        return fail(res, '图书不存在', 404);
      }

      // 检查重复
      const [existing] = await pool.query(
        'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?',
        [req.user.id, book_id]
      );
      if (existing.length > 0) {
        return fail(res, '已收藏过该图书', 409);
      }

      await pool.query(
        'INSERT INTO favorites (user_id, book_id) VALUES (?, ?)',
        [req.user.id, book_id]
      );

      return created(res, null, '收藏成功');
    } catch (err) {
      next(err);
    }
  }
);

// ==================== DELETE /:book_id — 取消收藏 ====================
router.delete('/:book_id', authenticate, async (req, res, next) => {
  try {
    const { book_id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?',
      [req.user.id, book_id]
    );
    if (existing.length === 0) {
      return fail(res, '未收藏该图书', 404);
    }

    await pool.query(
      'DELETE FROM favorites WHERE user_id = ? AND book_id = ?',
      [req.user.id, book_id]
    );

    return success(res, null, '取消收藏成功');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
