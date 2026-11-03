-- ============================================================
-- PART A: Basic queries (SELECT, JOIN, GROUP BY)
-- ============================================================

-- A1. Row counts per table (first sanity check after loading data)
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'vouchers', COUNT(*) FROM vouchers
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;

-- A2. Revenue per product, highest first
SELECT p.name, SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN products p ON p.product_id = oi.product_id
GROUP BY p.name
ORDER BY revenue DESC;

-- A3. Number of orders per user, including users with none (LEFT JOIN)
SELECT u.user_id, u.full_name, COUNT(o.order_id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY order_count DESC;

-- ============================================================
-- PART B: Data validation checks
-- Each check should return 0 rows on healthy data.
-- Rows returned = defects to report.
-- ============================================================

-- B1. Duplicate email addresses
SELECT email, COUNT(*) AS occurrences
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- B2. Orders that point to a user that does not exist
SELECT o.order_id, o.user_id
FROM orders o
LEFT JOIN users u ON u.user_id = o.user_id
WHERE u.user_id IS NULL;

-- B3. Order items that point to a product that does not exist
SELECT oi.item_id, oi.order_id, oi.product_id
FROM order_items oi
LEFT JOIN products p ON p.product_id = oi.product_id
WHERE p.product_id IS NULL;

-- B4. Order items with zero or negative quantity
SELECT item_id, order_id, quantity
FROM order_items
WHERE quantity <= 0;

-- B5. Single-use vouchers redeemed more than once
SELECT v.code, COUNT(*) AS times_used
FROM orders o
JOIN vouchers v ON v.voucher_id = o.voucher_id
WHERE v.single_use = 1
GROUP BY v.voucher_id, v.code
HAVING COUNT(*) > 1;

-- B6. Order total does not match items minus voucher discount
SELECT *
FROM (
  SELECT o.order_id,
         o.order_total,
         SUM(oi.quantity * oi.unit_price) - COALESCE(v.discount_amount, 0) AS expected_total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  LEFT JOIN vouchers v ON v.voucher_id = o.voucher_id
  GROUP BY o.order_id, o.order_total, v.discount_amount
) AS totals
WHERE order_total <> expected_total;

-- B7. Users who spent more than their daily spending cap
SELECT u.user_id, u.full_name, DATE(o.created_at) AS order_day,
       SUM(o.order_total) AS day_total, u.spending_cap
FROM orders o
JOIN users u ON u.user_id = o.user_id
GROUP BY u.user_id, u.full_name, u.spending_cap, DATE(o.created_at)
HAVING SUM(o.order_total) > u.spending_cap;
