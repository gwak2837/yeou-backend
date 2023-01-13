/* @name createNotification */
INSERT INTO notification (title, channels, content, third_party_message_id, link_url, price, receiver_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7);
