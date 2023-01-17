/* @name getNotifications */
SELECT
  product_x_user.creation_time,
  product.id,
  product.name,
  product.option,
  product.image_url
FROM
  product_x_user
  JOIN product ON product.id = product_x_user.product_id
    AND product_x_user.user_id = $1;
