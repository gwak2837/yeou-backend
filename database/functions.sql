CREATE FUNCTION save_product_history (_product_name varchar(100), _product_image_url text,
  _product_url text, _is_out_of_stock boolean, _product_price int, out result boolean)
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
    INSERT INTO product (name, image_url, url)
      VALUES (_product_name, _product_image_url, _product_url)
    RETURNING
      id INTO product_id;
  END IF;
  --
  INSERT INTO product_history (is_out_of_stock, price, product_id)
    VALUES (_is_out_of_stock, _product_price, product_id);
  --
  result = TRUE;
END
$$;
