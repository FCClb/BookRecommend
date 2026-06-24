const express = require('express');
const pool = require('../config/db');
const { success } = require('../utils/response');

const router = express.Router();

// ==================== GET / — 全部分类 ====================
router.get('/', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM categories ORDER BY id ASC');
    return success(res, { list: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
