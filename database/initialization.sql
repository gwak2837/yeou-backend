-- public 스키마 삭제 후 생성
DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public AUTHORIZATION jayudam_admin;

COMMENT ON SCHEMA public IS 'standard public schema';

GRANT ALL ON SCHEMA public TO jayudam_admin;

-- deleted 스키마 삭제 후 생성
DROP SCHEMA IF EXISTS deleted CASCADE;

CREATE SCHEMA deleted AUTHORIZATION jayudam_admin;

COMMENT ON SCHEMA deleted IS 'deleted records history';

GRANT ALL ON SCHEMA deleted TO jayudam_admin;

-- 함수 생성
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE FUNCTION random_string (len int)
  RETURNS text
  AS $$
DECLARE
  chars text[] = '{3,4,5,6,7,8,9,a,b,c,d,f,g,h,i,j,k,m,n,p,q,r,s,t,u,v,w,x,y,z}';
  result text = '';
  i int = 0;
  rand bytea;
BEGIN
  -- generate secure random bytes and convert them to a string of chars.
  rand = gen_random_bytes($1);
  FOR i IN 0..len - 1 LOOP
    -- rand indexing is zero-based, chars is 1-based.
    result = result || chars[1 + (get_byte(rand, i) % array_length(chars, 1))];
  END LOOP;
  RETURN result;
END;
$$
LANGUAGE plpgsql;

CREATE FUNCTION unique_random (len int, _table text, _col text)
  RETURNS text
  AS $$
DECLARE
  result text;
  numrows int;
BEGIN
  result = random_string (len);
  LOOP
    EXECUTE format('select 1 from %I where %I = %L', _table, _col, result);
    get diagnostics numrows = row_count;
    IF numrows = 0 THEN
      RETURN result;
    END IF;
    result = random_string (len);
  END LOOP;
END;
$$
LANGUAGE plpgsql;

CREATE TABLE "user" (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz DEFAULT CURRENT_TIMESTAMP,
  update_time timestamptz,
  bio varchar(100),
  birthyear int,
  birthday char(4),
  blocking_start_time timestamptz,
  blocking_end_time timestamptz,
  cover_image_urls text[],
  cert_agreement text,
  cherry int NOT NULL DEFAULT 10 CHECK (cherry >= 0),
  deactivation_time timestamptz,
  email varchar(50) UNIQUE,
  grade int DEFAULT 0,
  legal_name varchar(30),
  image_urls text[],
  invitation_code char(8) UNIQUE DEFAULT unique_random (8, 'user', 'invitation_code'),
  is_private boolean NOT NULL DEFAULT FALSE,
  is_verified_birthyear boolean NOT NULL DEFAULT FALSE,
  is_verified_birthday boolean NOT NULL DEFAULT FALSE,
  is_verified_email boolean NOT NULL DEFAULT FALSE,
  is_verified_legal_name boolean NOT NULL DEFAULT FALSE,
  is_verified_phone_number boolean NOT NULL DEFAULT FALSE,
  is_verified_sex boolean NOT NULL DEFAULT FALSE,
  last_attendance timestamptz,
  name varchar(30),
  nickname varchar(30) UNIQUE,
  oauth_bbaton varchar(100) NOT NULL UNIQUE,
  oauth_google varchar(100) UNIQUE,
  oauth_kakao varchar(100) UNIQUE,
  oauth_naver varchar(100) UNIQUE,
  personal_data_storing_year int NOT NULL DEFAULT 1,
  phone_number varchar(20) UNIQUE,
  service_agreement text,
  sex int,
  sleeping_time timestamptz,
  town1_count int NOT NULL DEFAULT 0,
  town1_name varchar(50),
  town2_count int NOT NULL DEFAULT 0,
  town2_name varchar(50)
  /* CHECK (town1_name != town2_name) */
);

-- 인증서 검증 요청용
CREATE TABLE cert_pending (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  birthdate timestamptz NOT NULL,
  issue_date timestamptz NOT NULL,
  legal_name varchar(30) NOT NULL,
  sex int NOT NULL,
  verification_code varchar(100) NOT NULL,
  --
  user_id bigint REFERENCES "user" ON DELETE SET NULL
);

CREATE TABLE cert (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  birthdate timestamptz NOT NULL,
  content text NOT NULL,
  effective_date timestamptz NOT NULL,
  issue_date timestamptz NOT NULL,
  legal_name varchar(30) NOT NULL,
  location varchar(100) NOT NULL,
  name varchar(50) NOT NULL,
  sex int NOT NULL,
  "type" int NOT NULL,
  verification_code varchar(100) NOT NULL,
  --
  user_id bigint REFERENCES "user" ON DELETE SET NULL
);

CREATE TABLE hashtag (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar(100) NOT NULL UNIQUE
);

CREATE TABLE notification (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "type" int NOT NULL,
  content text NOT NULL,
  link_url text NOT NULL,
  is_read boolean NOT NULL DEFAULT FALSE,
  --
  receiver_id bigint NOT NULL REFERENCES "user" ON DELETE CASCADE,
  sender_id bigint REFERENCES "user" ON DELETE SET NULL
);

CREATE TABLE post (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz DEFAULT CURRENT_TIMESTAMP,
  update_time timestamptz,
  deletion_time timestamptz,
  content varchar(300),
  for_adult boolean NOT NULL DEFAULT FALSE,
  image_urls text[],
  --
  parent_post_id bigint REFERENCES post ON DELETE SET NULL,
  sharing_post_id bigint REFERENCES post ON DELETE SET NULL,
  user_id bigint REFERENCES "user" ON DELETE SET NULL
);

CREATE TABLE verification_history (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  content text NOT NULL,
  --
  user_id bigint REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE chatroom (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  content varchar(1000) NOT NULL,
  "type" int NOT NULL,
  --
  chatroom_id bigint REFERENCES chatroom ON DELETE CASCADE,
  user_id bigint REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE chatroom_x_user (
  chatroom_id bigint REFERENCES chatroom ON DELETE CASCADE,
  user_id bigint REFERENCES "user" ON DELETE CASCADE,
  last_chat_id bigint REFERENCES chat,
  --
  PRIMARY KEY (chatroom_id, user_id)
);

-- post에 있는 해시태그
CREATE TABLE hashtag_x_post (
  hashtag_id bigint REFERENCES hashtag ON DELETE CASCADE,
  post_id bigint REFERENCES post ON DELETE CASCADE,
  --
  PRIMARY KEY (hashtag_id, post_id)
);

-- bio에 있는 해시태그
CREATE TABLE hashtag_x_user (
  hashtag_id bigint REFERENCES hashtag ON DELETE CASCADE,
  user_id bigint REFERENCES "user" ON DELETE CASCADE,
  --
  PRIMARY KEY (hashtag_id, user_id)
);

-- like
CREATE TABLE post_x_user (
  post_id bigint REFERENCES post ON DELETE CASCADE,
  user_id bigint REFERENCES "user" ON DELETE CASCADE,
  --
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE post_x_mentioned_user (
  post_id bigint REFERENCES post ON DELETE CASCADE,
  user_id bigint REFERENCES "user" ON DELETE CASCADE,
  --
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE user_x_user (
  leader_id bigint REFERENCES "user" ON DELETE CASCADE,
  follower_id bigint REFERENCES "user" ON DELETE CASCADE,
  --
  PRIMARY KEY (leader_id, follower_id)
);

CREATE FUNCTION toggle_liking_post (_user_id bigint, _post_id bigint, out "like" boolean, out like_count int)
LANGUAGE plpgsql
AS $$
BEGIN
  /* 삭제된 글엔 좋아요 하기/취소 불가 */
  PERFORM
  FROM
    post
  WHERE
    id = _post_id
    AND deletion_time IS NOT NULL;
  IF found THEN
    RETURN;
  END IF;

  /* 좋아요 하기/취소 */
  PERFORM
  FROM
    post_x_user
  WHERE
    user_id = _user_id
    AND post_id = _post_id;
  IF FOUND THEN
    DELETE FROM post_x_user
    WHERE user_id = _user_id
      AND post_id = _post_id;
    "like" = FALSE;
  ELSE
    INSERT INTO post_x_user (user_id, post_id)
      VALUES (_user_id, _post_id);
    "like" = TRUE;
  END IF;

  /* 좋아요 개수 */
  SELECT
    COUNT(user_id) INTO like_count
  FROM
    post_x_user
  WHERE
    post_id = _post_id;
END
$$;

CREATE FUNCTION create_post (_content varchar(300), _image_urls text[], _parent_post_id bigint, _shared_post_id bigint, _user_id bigint, _hashtags varchar(100)[] DEFAULT NULL, out reason int, out new_post record)
LANGUAGE plpgsql
AS $$
BEGIN
  /* 댓글 달기 검사 */
  IF _parent_post_id IS NOT NULL THEN
    PERFORM
    FROM
      post
    WHERE
      id = _parent_post_id
      AND deletion_time IS NOT NULL;
    IF found THEN
      reason = 1;
      RETURN;
    END IF;
  END IF;

  /* 공유하기 검사 */
  IF _shared_post_id IS NOT NULL THEN
    PERFORM
    FROM
      post
    WHERE
      user_id = _user_id
      AND sharing_post_id = _shared_post_id;
    IF found THEN
      reason = 2;
      RETURN;
    END IF;
    PERFORM
    FROM
      post
    WHERE
      id = _shared_post_id
      AND deletion_time IS NOT NULL;
    IF found THEN
      reason = 3;
      RETURN;
    END IF;
  END IF;

  /* 글쓰기 */
  INSERT INTO post (content, image_urls, parent_post_id, sharing_post_id, user_id)
    VALUES (_content, _image_urls, _parent_post_id, _shared_post_id, _user_id)
  RETURNING
    id, creation_time INTO new_post;

  /* 해시태그 추출 */
  WITH hashtag_input (
    name
) AS (
    SELECT
      unnest(_hashtags)
),
inserted AS (
INSERT INTO hashtag (name)
  SELECT
    name
  FROM
    hashtag_input
  ON CONFLICT (name)
    DO NOTHING
  RETURNING
    id
),
hashtag_ids AS (
  SELECT
    id
  FROM
    inserted
  UNION ALL
  SELECT
    hashtag.id
  FROM
    hashtag_input
    JOIN hashtag ON hashtag.name = hashtag_input.name)
  INSERT INTO hashtag_x_post (hashtag_id, post_id)
  SELECT
    hashtag_ids.id,
    new_post.id
  FROM
    hashtag_ids;
END
$$;

CREATE FUNCTION delete_post (_post_id bigint, _user_id bigint, out has_authorized boolean, out is_deleted boolean, out deletion_time timestamptz, out image_urls text[])
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM
  FROM
    post
  WHERE
    parent_post_id = _post_id
    OR sharing_post_id = _post_id;

  /* 댓글이 있거나 공유됐을 경우 내용만 삭제. 그외 경우 레코드를 삭제 */
  IF FOUND THEN
    UPDATE
      post
    SET
      deletion_time = CURRENT_TIMESTAMP,
      content = NULL,
      image_urls = NULL,
      parent_post_id = NULL,
      sharing_post_id = NULL
    FROM
      post AS old_post
    WHERE
      post.id = old_post.id
      AND post.id = _post_id
      AND post.user_id = _user_id
      AND post.deletion_time IS NULL
    RETURNING
      post.deletion_time,
      old_post.image_urls INTO delete_post.deletion_time,
      delete_post.image_urls;
    IF FOUND THEN
      has_authorized = TRUE;
      is_deleted = FALSE;
    ELSE
      has_authorized = FALSE;
      delete_post.deletion_time = NULL;
    END IF;
  ELSE
    DELETE FROM post
    WHERE id = _post_id
      AND user_id = _user_id
    RETURNING
      post.image_urls INTO delete_post.image_urls;
    IF FOUND THEN
      has_authorized = TRUE;
      is_deleted = TRUE;
      delete_post.deletion_time = CURRENT_TIMESTAMP;
    ELSE
      has_authorized = FALSE;
    END IF;
  END IF;
END
$$;

CREATE FUNCTION create_chatroom (_user_id bigint, _other_user_id bigint, out new_chatroom_id bigint)
LANGUAGE plpgsql
AS $$
DECLARE
  chatroom_count bigint;
BEGIN
  SELECT
    chatroom_x_user.chatroom_id INTO new_chatroom_id
  FROM
    chatroom_x_user
    JOIN chatroom_x_user AS cxu ON cxu.chatroom_id = chatroom_x_user.chatroom_id
      AND chatroom_x_user.user_id = _user_id
      AND cxu.user_id = _other_user_id;
  IF NOT found THEN
    INSERT INTO chatroom
      VALUES (DEFAULT)
    RETURNING
      id INTO new_chatroom_id;
    INSERT INTO chatroom_x_user (chatroom_id, user_id)
      VALUES (new_chatroom_id, _user_id), (new_chatroom_id, _other_user_id);
    chatroom_count = (
      SELECT
        COUNT(chatroom_x_user.chatroom_id)
      FROM
        chatroom_x_user
        JOIN chatroom_x_user AS cxu ON cxu.chatroom_id = chatroom_x_user.chatroom_id
          AND chatroom_x_user.user_id = _user_id
          AND cxu.user_id = _other_user_id);
    IF (chatroom_count > 1) THEN
      RAISE EXCEPTION 'There was concurrency problem. Please try again later';
    END IF;
  END IF;
END
$$;

