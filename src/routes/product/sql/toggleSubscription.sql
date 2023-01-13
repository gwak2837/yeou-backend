/* @name toggleSubscription */
SELECT
  result
FROM
  toggle_subscription ($1, $2, $3, $4, $5, $6);
