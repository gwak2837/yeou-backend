CREATE FUNCTION save_product_history (_product_name varchar(100), _product_option varchar(300),
  _product_image_url text, _product_url text, _is_out_of_stock boolean, _product_price int)
  RETURNS TABLE (
    condition text,
    email varchar(100),
    flare_lane_device_id uuid,
    phone_number varchar(20),
    should_notify_by_email boolean,
    should_notify_by_kakaotalk boolean,
    should_notify_by_line boolean,
    should_notify_by_phone boolean,
    should_notify_by_telegram boolean,
    should_notify_by_web_push boolean,
    telegram_user_id int)
  LANGUAGE plpgsql
  AS $$
DECLARE
  product_id bigint;
BEGIN
  SELECT
    id INTO product_id
  FROM
    product
  WHERE
    url = _product_url;
  --
  IF NOT found THEN
    INSERT INTO product (name, option, image_url, url)
      VALUES (_product_name, _product_option, _product_image_url, _product_url)
    RETURNING
      id INTO product_id;
  END IF;
  --
  INSERT INTO product_history (is_out_of_stock, price, product_id)
    VALUES (_is_out_of_stock, _product_price, product_id);
  --
  RETURN query
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
    product_x_user
    JOIN "user" ON "user".id = product_x_user.user_id;
END
$$;

CREATE FUNCTION get_flare_lane_user (_flare_lane_device_id uuid, out user_id bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT
    id INTO user_id
  FROM
    "user"
  WHERE
    flare_lane_device_id = _flare_lane_device_id;
  IF NOT found THEN
    INSERT INTO "user" (flare_lane_device_id, should_notify_by_web_push)
      VALUES (_flare_lane_device_id, TRUE)
    RETURNING
      id INTO user_id;
  END IF;
END
$$;
