/** Types generated for queries found in "src/routes/product/sql/getProductSubscriptions.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetProductSubscriptions' parameters type */
export type IGetProductSubscriptionsParams = void;

/** 'GetProductSubscriptions' return type */
export interface IGetProductSubscriptionsResult {
  can_buy: boolean;
  email: string | null;
  flare_lane_device_id: string | null;
  has_card_discount: boolean;
  has_coupon_discount: boolean;
  id: string;
  phone_number: string | null;
  prices: string | null;
  should_notify_by_email: boolean;
  should_notify_by_kakaotalk: boolean;
  should_notify_by_line: boolean;
  should_notify_by_phone: boolean;
  should_notify_by_telegram: boolean;
  should_notify_by_web_push: boolean;
  telegram_user_id: string | null;
}

/** 'GetProductSubscriptions' query type */
export interface IGetProductSubscriptionsQuery {
  params: IGetProductSubscriptionsParams;
  result: IGetProductSubscriptionsResult;
}

const getProductSubscriptionsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  product_x_user.prices,\n  product_x_user.has_card_discount,\n  product_x_user.has_coupon_discount,\n  product_x_user.can_buy,\n  \"user\".id,\n  \"user\".email,\n  \"user\".flare_lane_device_id,\n  \"user\".phone_number,\n  \"user\".should_notify_by_email,\n  \"user\".should_notify_by_kakaotalk,\n  \"user\".should_notify_by_line,\n  \"user\".should_notify_by_phone,\n  \"user\".should_notify_by_telegram,\n  \"user\".should_notify_by_web_push,\n  \"user\".telegram_user_id\nFROM\n  product_x_user\n  JOIN \"user\" ON \"user\".id = product_x_user.user_id\n    AND product_x_user.product_id = $1\n    AND (product_x_user.last_check_time IS NULL\n      OR product_x_user.last_check_time < $2)\n  LEFT JOIN notification ON notification.receiver_id = \"user\".id\n    AND notification.product_id = $1\n    AND product_x_user.prices IS NOT NULL\n  LEFT JOIN notification n2 ON n2.receiver_id = \"user\".id\n    AND n2.product_id = $1\n    AND product_x_user.prices IS NOT NULL\n    AND (notification.creation_time < n2.creation_time\n      OR (notification.creation_time = n2.creation_time\n        AND notification.id < n2.id))\n  LEFT JOIN product_history ON product_history.product_id = $1\n    AND (product_x_user.has_card_discount = TRUE\n      OR product_x_user.has_coupon_discount = TRUE\n      OR product_x_user.can_buy = TRUE)\n  LEFT JOIN product_history h2 ON h2.product_id = $1\n    AND (product_x_user.has_card_discount = TRUE\n      OR product_x_user.has_coupon_discount = TRUE\n      OR product_x_user.can_buy = TRUE)\nWHERE\n  n2.id IS NULL\n  AND h2.id IS NULL"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   product_x_user.prices,
 *   product_x_user.has_card_discount,
 *   product_x_user.has_coupon_discount,
 *   product_x_user.can_buy,
 *   "user".id,
 *   "user".email,
 *   "user".flare_lane_device_id,
 *   "user".phone_number,
 *   "user".should_notify_by_email,
 *   "user".should_notify_by_kakaotalk,
 *   "user".should_notify_by_line,
 *   "user".should_notify_by_phone,
 *   "user".should_notify_by_telegram,
 *   "user".should_notify_by_web_push,
 *   "user".telegram_user_id
 * FROM
 *   product_x_user
 *   JOIN "user" ON "user".id = product_x_user.user_id
 *     AND product_x_user.product_id = $1
 *     AND (product_x_user.last_check_time IS NULL
 *       OR product_x_user.last_check_time < $2)
 *   LEFT JOIN notification ON notification.receiver_id = "user".id
 *     AND notification.product_id = $1
 *     AND product_x_user.prices IS NOT NULL
 *   LEFT JOIN notification n2 ON n2.receiver_id = "user".id
 *     AND n2.product_id = $1
 *     AND product_x_user.prices IS NOT NULL
 *     AND (notification.creation_time < n2.creation_time
 *       OR (notification.creation_time = n2.creation_time
 *         AND notification.id < n2.id))
 *   LEFT JOIN product_history ON product_history.product_id = $1
 *     AND (product_x_user.has_card_discount = TRUE
 *       OR product_x_user.has_coupon_discount = TRUE
 *       OR product_x_user.can_buy = TRUE)
 *   LEFT JOIN product_history h2 ON h2.product_id = $1
 *     AND (product_x_user.has_card_discount = TRUE
 *       OR product_x_user.has_coupon_discount = TRUE
 *       OR product_x_user.can_buy = TRUE)
 * WHERE
 *   n2.id IS NULL
 *   AND h2.id IS NULL
 * ```
 */
export const getProductSubscriptions = new PreparedQuery<IGetProductSubscriptionsParams,IGetProductSubscriptionsResult>(getProductSubscriptionsIR);


