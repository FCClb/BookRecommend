const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { success, created, fail } = require('../utils/response');

const router = express.Router();

// ==================== POST /register ====================
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 2, max: 20 }).withMessage('用户名需在2-20个字符之间'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return fail(res, errors.array()[0].msg, 400);
      }

      const { username, password } = req.body;

      // 查重
      const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (rows.length > 0) {
        return fail(res, '用户名已存在', 409);
      }

      // 加密
      const hashed = bcrypt.hashSync(password, 10);

      // 入库
      await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed]);

      return created(res, null, '注册成功');
    } catch (err) {
      next(err);
    }
  }
);

// ==================== POST /login ====================
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('请输入用户名'),
    body('password').notEmpty().withMessage('请输入密码'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return fail(res, errors.array()[0].msg, 400);
      }

      const { username, password } = req.body;

      // 查用户
      const [rows] = await pool.query('SELECT id, username, password, role FROM users WHERE username = ?', [username]);
      if (rows.length === 0) {
        return fail(res, '用户名或密码错误', 401);
      }

      const user = rows[0];

      // 验密码
      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) {
        return fail(res, '用户名或密码错误', 401);
      }

      // 签发 token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return success(res, {
        token,
        user: { id: user.id, username: user.username, role: user.role },
      }, '登录成功');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
