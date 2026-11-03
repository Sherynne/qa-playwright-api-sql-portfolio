-- Simple online store schema used for data validation practice.
-- Deliberately has no UNIQUE or FOREIGN KEY constraints, so bad data can exist
-- and the checks in queries.sql have something to find.

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS vouchers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id      INTEGER PRIMARY KEY,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  spending_cap INTEGER NOT NULL      -- max a user may spend per day
);

CREATE TABLE products (
  product_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  price      INTEGER NOT NULL
);

CREATE TABLE vouchers (
  voucher_id      INTEGER PRIMARY KEY,
  code            TEXT NOT NULL,
  discount_amount INTEGER NOT NULL,
  single_use      INTEGER NOT NULL   -- 1 = may only be redeemed once
);

CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  order_total INTEGER NOT NULL,
  voucher_id  INTEGER,               -- NULL when no voucher was used
  created_at  TEXT NOT NULL
);

CREATE TABLE order_items (
  item_id    INTEGER PRIMARY KEY,
  order_id   INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);
