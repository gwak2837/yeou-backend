/* @name getOrCreateProduct */
SELECT
  product_id,
  is_new,
  prices,
  has_card_discount,
  has_coupon_discount,
  can_buy
FROM
  get_or_create_product ($1, $2);
