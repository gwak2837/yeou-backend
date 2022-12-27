/* @name updateSubscription */
UPDATE
  product_x_user
SET
  last_check_time = CURRENT_TIMESTAMP
WHERE
  product_id = $1;
