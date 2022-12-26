/** Types generated for queries found in "src/routes/product/sql/getProductSubscriptions.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetProductSubscriptions' parameters type */
export type IGetProductSubscriptionsParams = void;

/** 'GetProductSubscriptions' return type */
export interface IGetProductSubscriptionsResult {
  condition: string | null;
  email: string | null;
  flare_lane_device_id: string | null;
  phone_number: string | null;
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

const getProductSubscriptionsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  product_x_user.condition,\n  \"user\".email,\n  \"user\".flare_lane_device_id,\n  \"user\".phone_number,\n  \"user\".should_notify_by_email,\n  \"user\".should_notify_by_kakaotalk,\n  \"user\".should_notify_by_line,\n  \"user\".should_notify_by_phone,\n  \"user\".should_notify_by_telegram,\n  \"user\".should_notify_by_web_push,\n  \"user\".telegram_user_id\nFROM\n  \"user\"\n  JOIN product_x_user ON product_x_user.user_id = \"user\".id\n    AND product_x_user.product_id = $1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   product_x_user.condition,
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
 *   "user"
 *   JOIN product_x_user ON product_x_user.user_id = "user".id
 *     AND product_x_user.product_id = $1
 * ```
 */
export const getProductSubscriptions = new PreparedQuery<IGetProductSubscriptionsParams,IGetProductSubscriptionsResult>(getProductSubscriptionsIR);


