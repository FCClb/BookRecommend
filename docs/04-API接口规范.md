# 04 · API 接口规范

> 版本：v1.0 · 日期：2026-06-24

---

## 一、通用约定

### 1.1 基础信息

| 项 | 值 |
|------|------|
| Base URL | `http://localhost:3000`（开发环境） |
| 数据格式 | `Content-Type: application/json`（请求与响应均为 JSON） |
| 字符编码 | UTF-8 |

### 1.2 认证方式

- 使用 JWT Bearer Token
- 登录成功后，后端返回 `token` 字段
- 前端存储于 `localStorage`，键名 `token`
- 需要认证的请求在 `Authorization` 头携带：`Bearer <token>`

### 1.3 统一响应格式

**成功：**

```json
{
  "code": 200,
  "message": "ok",
  "data": { ... }
}
```

**失败：**

```json
{
  "code": 400,
  "message": "错误描述（中文，可直接展示给用户）"
}
```

### 1.4 常见 HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或 Token 过期 |
| 403 | 权限不足（非管理员访问管理接口） |
| 404 | 资源不存在 |
| 409 | 冲突（用户名已存在、重复收藏等） |
| 500 | 服务器内部错误 |

---

## 二、接口列表总览

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| B1 | GET | `/api/books` | 图书列表（搜索/筛选/排序/分页） | 否 |
| B2 | GET | `/api/books/recommended` | 首页推荐图书 | 否 |
| B3 | GET | `/api/books/:id` | 图书详情 | 否 |
| B4 | POST | `/api/books` | 新增图书 | admin |
| B5 | PUT | `/api/books/:id` | 修改图书 | admin |
| B6 | DELETE | `/api/books/:id` | 删除图书 | admin |
| U1 | POST | `/api/auth/register` | 用户注册 | 否 |
| U2 | POST | `/api/auth/login` | 用户登录 | 否 |
| U3 | GET | `/api/user/profile` | 当前用户信息 | 是 |
| F1 | GET | `/api/favorites` | 我的收藏列表 | 是 |
| F2 | POST | `/api/favorites` | 添加收藏 | 是 |
| F3 | DELETE | `/api/favorites/:book_id` | 取消收藏 | 是 |
| C1 | GET | `/api/categories` | 分类列表 | 否 |

---

## 三、接口详细定义

### B1 · 图书列表

```
GET /api/books?page=1&keyword=三体&category_id=1&sort=rating_desc
```

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认 1 |
| page_size | int | 否 | 每页条数，默认 8 |
| keyword | string | 否 | 搜索关键词（匹配书名 + 作者） |
| category_id | int | 否 | 分类筛选 |
| sort | string | 否 | `rating_desc`（评分降序）/ `rating_asc`（评分升序）/ `newest`（最新）/ 默认不排序 |

**成功响应：**

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "三体",
        "author": "刘慈欣",
        "cover_url": "/images/covers/book-01.jpg",
        "category_id": 1,
        "category_name": "科幻",
        "rating": 9.5,
        "publisher": "重庆出版社",
        "publish_date": "2008-01-01",
        "pages": 302,
        "description": "文化大革命如火如荼..."
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 8,
      "total": 15,
      "total_pages": 2
    }
  }
}
```

---

### B2 · 首页推荐

```
GET /api/books/recommended?limit=8
```

**Query 参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | int | 否 | 返回数量，默认 8 |

**说明：** 按评分降序返回 Top N 本图书。

**成功响应：**

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "list": [ ... ]
  }
}
```

---

### B3 · 图书详情

```
GET /api/books/1
```

**成功响应：**

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "id": 1,
    "title": "三体",
    "author": "刘慈欣",
    "cover_url": "/images/covers/book-01.jpg",
    "category_id": 1,
    "category_name": "科幻",
    "rating": 9.5,
    "publisher": "重庆出版社",
    "publish_date": "2008-01-01",
    "pages": 302,
    "description": "文化大革命如火如荼...",
    "is_favorited": false
  }
}
```

> `is_favorited`：若用户已登录，返回该用户是否已收藏此书；未登录则为 `false`。

**失败响应：**

```json
{
  "code": 404,
  "message": "图书不存在"
}
```

---

### B4 · 新增图书 🔒

```
POST /api/books
Authorization: Bearer <admin_token>
```

**请求体：**

```json
{
  "title": "三体",
  "author": "刘慈欣",
  "cover_url": "/images/covers/book-01.jpg",
  "description": "文化大革命如火如荼...",
  "category_id": 1,
  "rating": 9.5,
  "publisher": "重庆出版社",
  "publish_date": "2008-01-01",
  "pages": 302
}
```

**成功响应：** `201`

```json
{
  "code": 201,
  "message": "图书添加成功",
  "data": { "id": 16 }
}
```

---

### B5 · 修改图书 🔒

```
PUT /api/books/1
Authorization: Bearer <admin_token>
```

**请求体：** 同 B4，字段均可选（只发送要修改的字段）。

**成功响应：**

```json
{
  "code": 200,
  "message": "图书更新成功"
}
```

---

### B6 · 删除图书 🔒

```
DELETE /api/books/1
Authorization: Bearer <admin_token>
```

**成功响应：**

```json
{
  "code": 200,
  "message": "图书删除成功"
}
```

---

### U1 · 用户注册

```
POST /api/auth/register
```

**请求体：**

```json
{
  "username": "testuser",
  "password": "123456"
}
```

> 约束：`username` 2–20 字符，`password` ≥ 6 字符。密码经 bcrypt 哈希存储。

**成功响应：** `201`

```json
{
  "code": 201,
  "message": "注册成功"
}
```

**失败响应：** `409`

```json
{
  "code": 409,
  "message": "用户名已存在"
}
```

---

### U2 · 用户登录

```
POST /api/auth/login
```

**请求体：**

```json
{
  "username": "testuser",
  "password": "123456"
}
```

**成功响应：**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 2,
      "username": "testuser",
      "role": "user"
    }
  }
}
```

**失败响应：** `401`

```json
{
  "code": 401,
  "message": "用户名或密码错误"
}
```

---

### U3 · 当前用户信息 🔒

```
GET /api/user/profile
Authorization: Bearer <token>
```

**成功响应：**

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "id": 2,
    "username": "testuser",
    "role": "user",
    "created_at": "2026-06-20T10:00:00.000Z"
  }
}
```

---

### F1 · 我的收藏列表 🔒

```
GET /api/favorites
Authorization: Bearer <token>
```

**成功响应：**

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": 1,
        "book_id": 1,
        "title": "三体",
        "author": "刘慈欣",
        "cover_url": "/images/covers/book-01.jpg",
        "rating": 9.5,
        "created_at": "2026-06-22T14:00:00.000Z"
      }
    ]
  }
}
```

---

### F2 · 添加收藏 🔒

```
POST /api/favorites
Authorization: Bearer <token>
```

**请求体：**

```json
{
  "book_id": 1
}
```

**成功响应：** `201`

```json
{
  "code": 201,
  "message": "收藏成功"
}
```

**失败响应：** `409`

```json
{
  "code": 409,
  "message": "已收藏过该图书"
}
```

---

### F3 · 取消收藏 🔒

```
DELETE /api/favorites/1
Authorization: Bearer <token>
```

> 路径参数为 `book_id`，非收藏记录 ID。

**成功响应：**

```json
{
  "code": 200,
  "message": "取消收藏成功"
}
```

---

### C1 · 分类列表

```
GET /api/categories
```

**成功响应：**

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "list": [
      { "id": 1, "name": "科幻" },
      { "id": 2, "name": "文学" },
      { "id": 3, "name": "历史" }
    ]
  }
}
```

---

## 四、错误码速查

| code | 含义 |
|------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数不合法（express-validator 校验失败） |
| 401 | 未登录 / Token 无效或过期 |
| 403 | 权限不足（非 admin 访问管理接口） |
| 404 | 资源不存在 |
| 409 | 业务冲突（用户名重复、重复收藏） |
| 500 | 服务器内部错误 |
