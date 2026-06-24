const jwt = require('jsonwebtoken');

/**
 * JWT 认证中间件 —— 校验 token 并将用户信息挂载到 req.user
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
}

/**
 * 管理员权限中间件 —— 必须在 authenticate 之后使用
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '权限不足，仅管理员可操作' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
