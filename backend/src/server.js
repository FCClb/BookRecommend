require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --------------- 中间件 ---------------
app.use(cors());
app.use(express.json());

// --------------- 根路由（健康检查） ---------------
app.get('/', (_req, res) => {
  res.json({ code: 200, message: '图书推荐网站 API 运行中', data: null });
});

// --------------- 业务路由 ---------------
app.use('/api/books', require('./routes/books'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/categories', require('./routes/categories'));

// --------------- 404 ---------------
app.use((_req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// --------------- 全局错误处理 ---------------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// --------------- 启动 ---------------
app.listen(PORT, () => {
  console.log(`✅ 服务已启动: http://localhost:${PORT}`);
});
