/* @name getProductSubscriptions */
SELECT
  product_x_user.prices,
  product_x_user.has_card_discount AS condition__card_discount,
  product_x_user.has_coupon_discount AS condition__coupon_discount,
  product_x_user.can_buy,
  "user".id,
  "user".email,
  "user".flare_lane_device_id,
  "user".phone_number,
  "user".should_notify_by_email,
  "user".should_notify_by_kakaotalk,
  "user".should_notify_by_line,
  "user".should_notify_by_phone,
  "user".should_notify_by_telegram,
  "user".should_notify_by_web_push,
  "user".telegram_user_id,
  notification.price AS notification__price,
  product_history.is_out_of_stock,
  product_history.has_card_discount,
  product_history.has_coupon_discount,
  product_history.price AS product_history__price
FROM
  product_x_user
  JOIN "user" ON "user".id = product_x_user.user_id
    AND product_x_user.product_id = $1
    AND (product_x_user.last_check_time IS NULL
      OR product_x_user.last_check_time < $2)
  LEFT JOIN notification ON notification.receiver_id = "user".id
    AND notification.product_id = $1
    AND product_x_user.prices IS NOT NULL
  LEFT JOIN notification n2 ON n2.receiver_id = "user".id
    AND n2.product_id = $1
    AND product_x_user.prices IS NOT NULL
    AND (notification.creation_time < n2.creation_time
      OR (notification.creation_time = n2.creation_time
        AND notification.id < n2.id))
  LEFT JOIN product_history ON product_history.product_id = $1
    AND (product_x_user.has_card_discount = TRUE
      OR product_x_user.has_coupon_discount = TRUE
      OR product_x_user.can_buy = TRUE)
  LEFT JOIN product_history h2 ON h2.product_id = $1
    AND (product_x_user.has_card_discount = TRUE
      OR product_x_user.has_coupon_discount = TRUE
      OR product_x_user.can_buy = TRUE)
    AND (product_history.creation_time < h2.creation_time
      OR (product_history.creation_time = h2.creation_time
        AND product_history.id < h2.id))
WHERE
  n2.id IS NULL
  AND h2.id IS NULL;
