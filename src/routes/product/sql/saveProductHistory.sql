/* @name saveProductHistory */
SELECT
  condition,
  email,
  flare_lane_device_id,
  phone_number,
  should_notify_by_email,
  should_notify_by_kakaotalk,
  should_notify_by_line,
  should_notify_by_phone,
  should_notify_by_telegram,
  should_notify_by_web_push,
  telegram_user_id
FROM
  save_product_history ($1, $2, $3, $4, $5, $6);
