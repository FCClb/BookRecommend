-- ============================================
-- 图书推荐网站 · 数据库建表脚本
-- 执行方式：mysql -u root -p < schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS book_recommend
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE book_recommend;

-- --------------------------------------------
-- 1. 分类表
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id   INT          AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50)  NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- 2. 用户表
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         INT                        AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(50)                NOT NULL UNIQUE,
  password   VARCHAR(255)               NOT NULL,
  role       ENUM('user', 'admin')      NOT NULL DEFAULT 'user',
  created_at DATETIME                   DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- 3. 图书表
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS books (
  id           INT            AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200)   NOT NULL,
  author       VARCHAR(100)   NOT NULL,
  cover_url    VARCHAR(500)   DEFAULT NULL,
  description  TEXT           DEFAULT NULL,
  category_id  INT            DEFAULT NULL,
  rating       DECIMAL(3,2)   DEFAULT 0.00,
  publisher    VARCHAR(200)   DEFAULT NULL,
  publish_date DATE           DEFAULT NULL,
  pages        INT            DEFAULT NULL,
  created_at   DATETIME       DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------
-- 4. 收藏表
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  id         INT       AUTO_INCREMENT PRIMARY KEY,
  user_id    INT       NOT NULL,
  book_id    INT       NOT NULL,
  created_at DATETIME  DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_book (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
