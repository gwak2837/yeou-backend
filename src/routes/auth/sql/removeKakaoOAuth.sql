/* @name removeKakaoOAuth */
UPDATE
  "user"
SET
  kakao_oauth = NULL
WHERE
  kakao_oauth = $1;
