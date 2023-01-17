/** Types generated for queries found in "src/routes/notification/sql/getNotifications.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetNotifications' parameters type */
export type IGetNotificationsParams = void;

/** 'GetNotifications' return type */
export interface IGetNotificationsResult {
  creation_time: Date | null;
  id: string;
  image_url: string | null;
  name: string | null;
  option: string | null;
}

/** 'GetNotifications' query type */
export interface IGetNotificationsQuery {
  params: IGetNotificationsParams;
  result: IGetNotificationsResult;
}

const getNotificationsIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  product_x_user.creation_time,\n  product.id,\n  product.name,\n  product.option,\n  product.image_url\nFROM\n  product_x_user\n  JOIN product ON product.id = product_x_user.product_id\n    AND product_x_user.user_id = $1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   product_x_user.creation_time,
 *   product.id,
 *   product.name,
 *   product.option,
 *   product.image_url
 * FROM
 *   product_x_user
 *   JOIN product ON product.id = product_x_user.product_id
 *     AND product_x_user.user_id = $1
 * ```
 */
export const getNotifications = new PreparedQuery<IGetNotificationsParams,IGetNotificationsResult>(getNotificationsIR);


