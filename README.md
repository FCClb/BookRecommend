# 📚 图书推荐网站

> 课程项目 · 高锦博 · 24469209

---

## 项目简介

图书推荐网站是一个基于 **HTML + CSS + JavaScript 前端**、**Node.js + Express 后端**、**MySQL 数据库**构建的全栈 Web 应用。用户可浏览、搜索、收藏高分图书；管理员可通过后台管理图书数据。

**主题：** 图书浏览与推荐

---

## 主要功能

### 前台展示
| 页面 | 功能 |
|------|------|
| 首页 | 高分推荐图书展示（评分降序 Top 8）+ 右上角学生信息 |
| 列表页 | 图书浏览、关键词搜索、分类筛选、评分排序、分页（8 本/页） |
| 详情页 | 完整图书信息展示（封面、评分、出版社、页数、简介）+ 收藏/取消收藏 |

### 用户系统
| 功能 | 说明 |
|------|------|
| 用户注册 | 用户名 2-20 字符，密码 ≥6 位，bcrypt 加密存储 |
| 用户登录 | JWT 认证，Token 有效期 7 天 |
| 个人中心 | 用户信息展示 + 我的收藏列表 + 取消收藏 |

### 后台管理（管理员）
| 功能 | 说明 |
|------|------|
| 图书列表 | 表格展示全部图书 |
| 新增图书 | 模态框表单，9 个字段 |
| 编辑图书 | 数据回填，部分字段更新 |
| 删除图书 | 二次确认弹窗 |
| 权限控制 | 前端 + 后端双重校验，非管理员 403 |

---

## 技术栈

| 层 | 技术 | 版本 |
|------|------|------|
| 前端 | HTML + CSS + JavaScript（原生） | — |
| 后端 | Node.js + Express | 4.21.x |
| 数据库 | MySQL | 8.0 |
| 认证 | JWT（jsonwebtoken） | 9.x |
| 加密 | bcryptjs | 2.x |
| 数据库驱动 | mysql2（promise） | 3.11.x |

---

## 运行方式

### 1. 构建数据库

在 MySQL 中依次执行以下 SQL 脚本：

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. 配置环境变量

编辑 `backend/.env`，填入数据库连接信息：

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=你的MySQL密码
DB_NAME=book_recommend
JWT_SECRET=你的JWT密钥
PORT=3000
```

### 3. 安装依赖

```bash
cd backend
npm install
```

### 4. 启动后端

```bash
npm start
```

服务启动于 `http://localhost:3000`。

### 5. 启动前端

使用 **Live Server**（VS Code 插件）或任意静态服务器在 `frontend/` 目录启动：

```
frontend/ → http://127.0.0.1:5500（Live Server 默认）
```

---

## 项目结构

```
├── frontend/                # 前端
│   ├── index.html           # 首页
│   ├── list.html            # 图书列表页
│   ├── detail.html          # 图书详情页
│   ├── login.html           # 登录页
│   ├── register.html        # 注册页
│   ├── profile.html         # 个人中心
│   ├── admin.html           # 后台管理
│   ├── css/                 # 样式文件
│   │   ├── common.css       # 公共样式 + 设计系统
│   │   ├── index.css        # 首页
│   │   ├── list.css         # 列表页
│   │   ├── detail.css       # 详情页
│   │   ├── auth.css         # 登录/注册
│   │   ├── profile.css      # 个人中心
│   │   └── admin.css        # 后台管理
│   ├── js/                  # 脚本文件
│   │   ├── config.js        # API 地址配置
│   │   ├── api.js           # fetch 封装
│   │   ├── auth.js          # JWT 认证管理
│   │   ├── common.js        # 导航栏/页脚/工具函数
│   │   ├── index.js         # 首页逻辑
│   │   ├── list.js          # 列表页逻辑
│   │   ├── detail.js        # 详情页逻辑
│   │   ├── login.js         # 登录逻辑
│   │   ├── register.js      # 注册逻辑
│   │   ├── profile.js       # 个人中心逻辑
│   │   └── admin.js         # 后台管理逻辑
│   └── images/              # 图片资源
├── backend/                 # 后端
│   ├── src/
│   │   ├── server.js        # Express 入口
│   │   ├── config/db.js     # MySQL 连接池
│   │   ├── middleware/auth.js # JWT + 角色中间件
│   │   ├── routes/          # 路由模块
│   │   │   ├── auth.js      # 注册/登录
│   │   │   ├── books.js     # 图书 CRUD
│   │   │   ├── user.js      # 用户信息
│   │   │   ├── favorites.js # 收藏管理
│   │   │   └── categories.js# 分类列表
│   │   └── utils/response.js# 统一响应格式
│   ├── package.json
│   └── .env.example
├── database/                # SQL 脚本
│   ├── schema.sql           # 建库建表
│   └── seed.sql             # 测试数据
├── docs/                    # 项目文档
│   ├── 01-项目需求文档.md
│   ├── 02-技术选型文档.md
│   ├── 03-项目目录结构.md
│   ├── 04-API接口规范.md
│   └── 05-开发分步计划.md
├── README.md                # 本文件
└── AI使用说明.md
```

---

## 数据库说明

| 表名 | 说明 | 关键字段 |
|------|------|------|
| `users` | 用户表 | id, username, password(bcrypt), role(admin/user), created_at |
| `categories` | 分类表 | id, name（科幻/文学/历史） |
| `books` | 图书表 | id, title, author, cover_url, description, category_id(FK), rating, publisher, publish_date, pages |
| `favorites` | 收藏表 | id, user_id(FK), book_id(FK), created_at, UNIQUE(user_id, book_id) |

---

## API 接口（共 13 个）

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| B1 | GET | `/api/books` | 图书列表（搜索/筛选/排序/分页） | 否 |
| B2 | GET | `/api/books/recommended` | 首页推荐（评分降序） | 否 |
| B3 | GET | `/api/books/:id` | 图书详情（含收藏状态） | 可选 |
| B4 | POST | `/api/books` | 新增图书 | admin |
| B5 | PUT | `/api/books/:id` | 修改图书 | admin |
| B6 | DELETE | `/api/books/:id` | 删除图书 | admin |
| U1 | POST | `/api/auth/register` | 用户注册 | 否 |
| U2 | POST | `/api/auth/login` | 用户登录 | 否 |
| U3 | GET | `/api/user/profile` | 用户信息 | 是 |
| F1 | GET | `/api/favorites` | 收藏列表 | 是 |
| F2 | POST | `/api/favorites` | 添加收藏 | 是 |
| F3 | DELETE | `/api/favorites/:book_id` | 取消收藏 | 是 |
| C1 | GET | `/api/categories` | 分类列表 | 否 |

---

## 测试账号

| 角色 | 用户名 | 密码 |
|------|------|------|
| 管理员 | `admin` | `admin123` |
| 普通用户 | `testuser` | `123456` |

---

## 许可

本作品为课程项目，仅用于学习目的。
