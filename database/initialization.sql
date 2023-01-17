-- public 스키마 삭제 후 생성
DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public AUTHORIZATION lobinreview;

COMMENT ON SCHEMA public IS 'standard public schema';

GRANT ALL ON SCHEMA public TO lobinreview;

CREATE TABLE "user" (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz DEFAULT CURRENT_TIMESTAMP,
  flare_lane_device_id uuid UNIQUE,
  grade int NOT NULL DEFAULT 0,
  email varchar(100) UNIQUE,
  image_urls text[],
  name varchar(50) UNIQUE,
  nickname varchar(50),
  oauth_google varchar(100) UNIQUE,
  oauth_kakao varchar(100) UNIQUE,
  oauth_naver varchar(100) UNIQUE,
  phone_number varchar(20) UNIQUE,
  should_notify_by_email boolean NOT NULL DEFAULT FALSE,
  should_notify_by_kakaotalk boolean NOT NULL DEFAULT FALSE,
  should_notify_by_line boolean NOT NULL DEFAULT FALSE,
  should_notify_by_phone boolean NOT NULL DEFAULT FALSE,
  should_notify_by_telegram boolean NOT NULL DEFAULT FALSE,
  should_notify_by_web_push boolean NOT NULL DEFAULT FALSE,
  telegram_user_id bigint UNIQUE
);

CREATE TABLE product (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz DEFAULT CURRENT_TIMESTAMP,
  name varchar(100),
  option varchar(300),
  image_url text,
  url text NOT NULL UNIQUE
);

CREATE TABLE product_history (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz DEFAULT CURRENT_TIMESTAMP,
  is_out_of_stock boolean NOT NULL DEFAULT FALSE,
  has_card_discount boolean NOT NULL DEFAULT FALSE,
  has_coupon_discount boolean NOT NULL DEFAULT FALSE,
  price int,
  --
  product_id bigint NOT NULL REFERENCES product ON DELETE CASCADE
);

CREATE TABLE hashtag (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar(100) NOT NULL UNIQUE
);

CREATE TABLE notification (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title varchar(100) NOT NULL,
  content text NOT NULL,
  channels int[] NOT NULL,
  is_read boolean NOT NULL DEFAULT FALSE,
  link_url text NOT NULL,
  price int NOT NULL,
  third_party_message_id text,
  --
  product_id bigint NOT NULL REFERENCES product ON DELETE CASCADE,
  receiver_id bigint NOT NULL REFERENCES "user" ON DELETE CASCADE
);

CREATE TABLE post (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  creation_time timestamptz DEFAULT CURRENT_TIMESTAMP,
  update_time timestamptz,
  deletion_time timestamptz,
  content varchar(300),
  image_urls text[],
  --
  parent_post_id bigint REFERENCES post ON DELETE SET NULL,
  sharing_post_id bigint REFERENCES post ON DELETE SET NULL,
  user_id bigint REFERENCES "user" ON DELETE SET NULL
);

-- post에 있는 해시태그
CREATE TABLE hashtag_x_post (
  hashtag_id bigint REFERENCES hashtag ON DELETE CASCADE,
  post_id bigint REFERENCES post ON DELETE CASCADE,
  --
  PRIMARY KEY (hashtag_id, post_id)
);

CREATE TABLE post_x_mentioned_user (
  post_id bigint REFERENCES post ON DELETE CASCADE,
  user_id bigint REFERENCES "user" ON DELETE CASCADE,
  --
  PRIMARY KEY (post_id, user_id)
);

-- like
CREATE TABLE post_x_user (
  post_id bigint REFERENCES post ON DELETE CASCADE,
  user_id bigint REFERENCES "user" ON DELETE CASCADE,
  --
  PRIMARY KEY (post_id, user_id)
);

-- 사용자가 알림 설정한 제품
CREATE TABLE product_x_user (
  product_id bigint REFERENCES product ON DELETE CASCADE,
  user_id bigint REFERENCES "user" ON DELETE CASCADE,
  creation_time timestamptz DEFAULT CURRENT_TIMESTAMP,
  prices text,
  has_card_discount boolean NOT NULL DEFAULT FALSE,
  has_coupon_discount boolean NOT NULL DEFAULT FALSE,
  can_buy boolean NOT NULL DEFAULT FALSE,
  last_check_time timestamptz,
  --
  PRIMARY KEY (product_id, user_id)
);

CREATE TABLE user_x_user (
  leader_id bigint REFERENCES "user" ON DELETE CASCADE,
  follower_id bigint REFERENCES "user" ON DELETE CASCADE,
  --
  PRIMARY KEY (leader_id, follower_id)
);
