/* @name createProductHistory */
INSERT INTO product_history (creation_time, is_out_of_stock, price, product_id)
  VALUES ($1, $2, $3, $4);
