const express = require('express');
const pool = require('../config/db');
const { success } = require('../utils/response');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ==================== GET /profile — 当前用户信息 ====================
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '用户不存在' });
    }

    return success(res, rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
