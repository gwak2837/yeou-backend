/* @name getOrCreateProduct */
SELECT
  product_id,
  is_new,
  condition
FROM
  get_or_create_product ($1, $2);
