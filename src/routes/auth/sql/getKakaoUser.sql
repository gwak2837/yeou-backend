/* @name getKakaoUser */
SELECT
  id,
  name,
  phone_number
FROM
  "user"
WHERE
  oauth_kakao = $1;

