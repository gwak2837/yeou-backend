/* @name createNotification */
INSERT INTO notification (title, channels, content, third_party_id, link_url, receiver_id)
  VALUES ($1, $2, $3, $4, $5, $6);
