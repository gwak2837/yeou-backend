/* @name getGoogleUser */
SELECT
  id,
  name
FROM
  "user"
WHERE
  oauth_google = $1;
