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

CREATE FUNCTION toggle_subscription (_product_id bigint, _user_id bigint, out result boolean)
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM
  FROM
    product_x_user
  WHERE
    product_id = _product_id
    AND user_id = _user_id;
  IF FOUND THEN
    DELETE FROM product_x_user
    WHERE product_id = _product_id
      AND user_id = _user_id;
    result = FALSE;
  ELSE
    INSERT INTO product_x_user (product_id, user_id)
      VALUES (_product_id, _user_id);
    result = TRUE;
  END IF;
END
$$;

CREATE FUNCTION get_or_create_product (_product_url text, _user_id bigint, out product_id bigint,
  out is_new boolean, out is_subscribed bigint)
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT
    id,
    product_x_user.product_id INTO product_id,
    is_subscribed
  FROM
    product
  LEFT JOIN product_x_user ON product_x_user.product_id = product.id
    AND product_x_user.user_id = _user_id
    AND product.url = _product_url;
  IF found THEN
    is_new = FALSE;
  ELSE
    INSERT INTO product (url)
      VALUES (_product_url)
    RETURNING
      id INTO product_id;
    is_new = TRUE;
  END IF;
END
$$;
