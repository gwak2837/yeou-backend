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

CREATE FUNCTION toggle_subscription (_product_id bigint, _user_id bigint, _prices text,
  _has_card_discount boolean, _has_coupon_discount boolean, _can_buy boolean, out result boolean)
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
    IF _prices IS NULL AND _has_card_discount IS NULL AND _has_coupon_discount IS NULL AND _can_buy IS NULL THEN
      DELETE FROM product_x_user
      WHERE product_id = _product_id
        AND user_id = _user_id;
      result = FALSE;
    ELSE
      UPDATE
        product_x_user
      SET
        prices = _prices,
        has_card_discount = _has_card_discount,
        has_coupon_discount = _has_coupon_discount,
        can_buy = _can_buy
      WHERE
        product_id = _product_id
        AND user_id = _user_id;
      result = TRUE;
    END IF;
  ELSE
    IF _prices IS NULL AND _has_card_discount IS NULL AND _has_coupon_discount IS NULL AND _can_buy IS NULL THEN
      result = FALSE;
    ELSE
      INSERT INTO product_x_user (product_id, user_id, prices, has_card_discount, has_coupon_discount, can_buy)
        VALUES (_product_id, _user_id, _prices, _has_card_discount, _has_coupon_discount, _can_buy);
      result = TRUE;
    END IF;
  END IF;
END
$$;

CREATE FUNCTION get_or_create_product (_product_url text, _user_id bigint, out product_id bigint,
  out is_new boolean, out prices text, out has_card_discount boolean, out has_coupon_discount
  boolean, out can_buy boolean)
LANGUAGE plpgsql
AS $$
BEGIN
  SELECT
    id,
    product_x_user.prices,
    product_x_user.has_card_discount,
    product_x_user.has_coupon_discount,
    product_x_user.can_buy INTO product_id,
    prices,
    has_card_discount,
    has_coupon_discount,
    can_buy
  FROM
    product
  LEFT JOIN product_x_user ON product_x_user.product_id = product.id
    AND product_x_user.user_id = _user_id
WHERE
  product.url = _product_url;
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
