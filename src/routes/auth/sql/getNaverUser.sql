/* @name getNaverUser */
SELECT
  id,
  name
FROM
  "user"
WHERE
  oauth_naver = $1;
