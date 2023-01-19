/* @name removeKakaoOAuth */
UPDATE
  "user"
SET
  oauth_kakao = NULL
WHERE
  oauth_kakao = $1;
