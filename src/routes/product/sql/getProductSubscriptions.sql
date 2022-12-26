/* @name getProductSubscriptions */
SELECT
  product_x_user.condition,
  "user".email,
  "user".flare_lane_device_id,
  "user".phone_number,
  "user".should_notify_by_email,
  "user".should_notify_by_kakaotalk,
  "user".should_notify_by_line,
  "user".should_notify_by_phone,
  "user".should_notify_by_telegram,
  "user".should_notify_by_web_push,
  "user".telegram_user_id
FROM
  "user"
  JOIN product_x_user ON product_x_user.user_id = "user".id
    AND product_x_user.product_id = $1;
