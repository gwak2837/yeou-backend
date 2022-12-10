/* @name auth */
SELECT
  id,
  name
FROM
  "user"
WHERE
  id = $1;

