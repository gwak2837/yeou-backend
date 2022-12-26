/* @name getOrCreateProduct */
SELECT
  product_id,
  is_new,
  is_subscribed
FROM
  get_or_create_product ($1, $2);
