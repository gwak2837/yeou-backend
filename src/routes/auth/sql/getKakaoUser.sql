/* @name getKakaoUser */
SELECT
  id,
  name
FROM
  "user"
WHERE
  oauth_kakao = $1;
