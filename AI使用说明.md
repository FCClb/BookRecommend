# AI 使用说明

## 一、是否使用 AI

是

## 二、使用 AI 的位置

1. 使用 AI（Claude Code）辅助设计项目整体架构与目录结构。
2. 使用 AI 辅助生成后端代码（Express 路由、JWT 中间件、MySQL 查询、统一响应格式）。
3. 使用 AI 辅助生成前端页面结构与样式（HTML 页面、CSS 设计系统、响应式布局）。
4. 使用 AI 调整前端 JavaScript 逻辑（fetch 封装、DOM 渲染、表单校验、分页状态管理）。
5. 使用 AI 辅助编写项目文档（需求文档、技术选型、API 规范、开发计划）。
6. 使用 AI 辅助排查后端接口错误与前端跨页面依赖问题。
7. 使用 AI 辅助进行 API 接口端到端验证。

## 三、本人完成的内容

1. 项目主题设计（图书推荐网站）。
2. MySQL 数据库的安装、建库建表、数据导入。
3. 部分前端html的设计与编写
4. 部分前端css的设计与编写
5. 前后端联调测试。
6. 各页面功能验证与边界情况检查。
7. 代码整合与项目完整性的最终确认。
8. 测试账号创建与密码 bcrypt 哈希生成。

## 四、能够独立说明的关键代码

1. **CSS 设计系统**（`frontend/css/common.css`）：通过 `:root` 中的 CSS 变量统一定义全站颜色（`--primary`、`--bg`、`--accent`）、阴影层级（`--shadow` / `--shadow-lg`）、圆角半径（`--radius`）等设计令牌。所有组件样式引用变量而非硬编码色值，修改一处即可全局生效，保证 7 个页面的视觉一致性。

2. **图书卡片与封面加载**（`frontend/js/common.js` 的 `renderBookCard` / `renderCoverBlock`）：封面用相对路径加载并添加 `loading="lazy"` 延迟加载；`onerror` 时自动依次尝试 `.jpg` → `.webp` → `.png` 三种扩展名，全部失败则展示书名首字的渐变色占位符。封面容器使用 `aspect-ratio: 3/4` 保持统一宽高比，hover 时 `scale(1.05)` 轻微放大。

3. **导航栏权限感知渲染**（`frontend/js/common.js` 的 `renderNavbar`）：通过 `auth.isLoggedIn()` 和 `auth.isAdmin()` 判断用户状态，未登录显示登录/注册按钮，普通用户显示用户名和个人中心入口，管理员额外显示后台管理链接。所有页面共用此函数，导航栏结构保持一致。

4. **图书列表分页与 URL 同步**（`frontend/js/list.js`）：搜索关键词、分类筛选、排序方式、当前页码四个筛选状态全部写入 URL 查询参数（`URLSearchParams`），通过 `history.replaceState` 无刷新同步地址栏。用户刷新页面或分享链接时可完整还原搜索条件，分页器动态生成带省略逻辑的页码按钮。

5. **后台管理模态框状态复用**（`frontend/js/admin.js`）：新增和编辑图书共用同一个表单模态框，通过模块级变量 `editId`（null=新增 / 有值=编辑）切换标题文字和表单预填逻辑；删除使用独立的小尺寸确认弹窗，`deleteId` 变量中转待删除图书 ID。操作完成后自动刷新表格数据。

6. **数据库表结构设计**（`database/schema.sql`）：4 张表——`users`（用户名+bcrypt 密码+角色字段）、`categories`（分类名）、`books`（15 个字段含外键 `category_id` 关联分类表）、`favorites`（`user_id` + `book_id` 复合 UNIQUE 约束防止重复收藏）。全部采用 utf8mb4 字符集和 InnoDB 引擎，支持中文存储与事务回滚。

7. **测试数据设计**（`database/seed.sql`）：15 本图书均匀覆盖科幻、文学、历史 3 个分类，评分 7.8~9.7 呈梯度分布，用户密码使用 bcrypt 哈希预生成后写入 SQL，每本图书配备出版社、出版日期、页数、内容简介等完整元数据，可直接导入用于功能验证和界面展示。

8. **JWT 认证与密码安全**（`backend/src/middleware/auth.js` + `backend/src/routes/auth.js`）：注册时 `bcrypt.hash(password, 10)` 加盐哈希后存储，登录时 `bcrypt.compare` 验证明文与哈希的匹配性，全程不落盘明文密码。认证中间件从请求头提取 Bearer Token、解码并挂载用户信息到 `req.user`，`requireAdmin` 中间件检查角色字段实现接口级权限控制。
