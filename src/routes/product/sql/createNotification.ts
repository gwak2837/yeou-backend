/** Types generated for queries found in "src/routes/product/sql/createNotification.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'CreateNotification' is invalid, so its result is assigned type 'never' */
export type ICreateNotificationResult = never;

/** Query 'CreateNotification' is invalid, so its parameters are assigned type 'never' */
export type ICreateNotificationParams = never;

const createNotificationIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO notification (title, channels, content, third_party_message_id, link_url, price, receiver_id)\n  VALUES ($1, $2, $3, $4, $5, $6, $7)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notification (title, channels, content, third_party_message_id, link_url, price, receiver_id)
 *   VALUES ($1, $2, $3, $4, $5, $6, $7)
 * ```
 */
export const createNotification = new PreparedQuery<ICreateNotificationParams,ICreateNotificationResult>(createNotificationIR);


