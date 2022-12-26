/* @name saveProductHistory */
INSERT INTO product_history (is_out_of_stock, price, product_id)
  VALUES ($1, $2, $3);
