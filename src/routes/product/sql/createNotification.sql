/* @name createNotification */
INSERT INTO notification (title, content, third_party_id, link_url, type)
  VALUES ($1, $2, $3, $4, $5);
