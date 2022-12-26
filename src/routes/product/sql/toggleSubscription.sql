/* @name toggleSubscription */
SELECT
  result
FROM
  toggle_subscription ($1, $2);
