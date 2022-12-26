/* @name updateProduct */
UPDATE
  product
SET
  name = $1,
  option = $2,
  image_url = $3
WHERE
  id = $4;
