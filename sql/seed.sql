INSERT INTO users VALUES
  (1, 'Amina Otieno',  'amina@example.com', 5000),
  (2, 'Brian Kamau',   'brian@example.com', 3000),
  (3, 'Carol Wanjiru', 'carol@example.com', 2000),
  (4, 'Brian K.',      'brian@example.com', 3000),  -- duplicate email
  (5, 'Dan Mwangi',    'dan@example.com',   1000);  -- has no orders

INSERT INTO products VALUES
  (1, 'Wireless Mouse', 1200),
  (2, 'USB Cable',       350),
  (3, 'Phone Case',      500),
  (4, 'Desk Lamp',      2200),
  (5, 'Water Bottle',    800);

INSERT INTO vouchers VALUES
  (1, 'WELCOME100', 100, 1),
  (2, 'SAVE200',    200, 1),
  (3, 'FREESHIP',   150, 0);

INSERT INTO orders VALUES
  (101, 1,  1100, 1,    '2026-10-01 09:10:00'),
  (102, 2,  1100, 1,    '2026-10-02 11:45:00'),  -- single-use voucher 1 used again
  (103, 3,   700, NULL, '2026-10-02 14:20:00'),
  (104, 1,  2000, NULL, '2026-10-03 10:05:00'),  -- total does not match items
  (105, 3,  3000, NULL, '2026-10-04 16:30:00'),  -- above user 3 daily cap of 2000
  (106, 2,   650, 3,    '2026-10-04 12:00:00'),
  (107, 1,   650, 3,    '2026-10-05 08:40:00'),  -- multi-use voucher, fine
  (108, 99,  500, NULL, '2026-10-05 19:15:00'),  -- user 99 does not exist
  (109, 2,   900, NULL, '2026-10-06 13:00:00'),
  (110, 1,  -350, NULL, '2026-10-06 15:30:00');

INSERT INTO order_items VALUES
  (301, 101, 1, 1, 1200),
  (302, 102, 1, 1, 1200),
  (303, 103, 2, 2,  350),
  (304, 104, 4, 1, 2200),
  (305, 105, 4, 1, 2200),
  (306, 105, 5, 1,  800),
  (307, 106, 5, 1,  800),
  (308, 107, 5, 1,  800),
  (309, 108, 3, 1,  500),
  (310, 109, 99, 1, 900),   -- product 99 does not exist
  (311, 110, 2, -1, 350);   -- negative quantity
