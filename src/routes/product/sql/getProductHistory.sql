/* @name getProductHistory */
SELECT
  id,
  creation_time,
  is_out_of_stock,
  price
FROM
  product_history
WHERE
  product_id = $1;
