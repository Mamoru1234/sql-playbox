CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  description TEXT,
  product TEXT,
  date TIMESTAMP
);

DROP TABLE orders;

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  description TEXT,
  order_id INTEGER REFERENCES orders(id),
  date TIMESTAMP,
  amount INT
);

DROP TABLE transactions;

SELECT * FROM transactions
  JOIN orders ON transactions.order_id = orders.id;