/** Types generated for queries found in "src/routes/product/sql/createNotification.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateNotification' parameters type */
export type ICreateNotificationParams = void;

/** 'CreateNotification' return type */
export type ICreateNotificationResult = void;

/** 'CreateNotification' query type */
export interface ICreateNotificationQuery {
  params: ICreateNotificationParams;
  result: ICreateNotificationResult;
}

const createNotificationIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO notification (title, channels, content, third_party_message_id, link_url, price, receiver_id)\n  VALUES ($1, $2, $3, $4, $5, $6, $7)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO notification (title, channels, content, third_party_message_id, link_url, price, receiver_id)
 *   VALUES ($1, $2, $3, $4, $5, $6, $7)
 * ```
 */
export const createNotification = new PreparedQuery<ICreateNotificationParams,ICreateNotificationResult>(createNotificationIR);


