/** Types generated for queries found in "src/routes/product/sql/updateSubscription.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpdateSubscription' parameters type */
export type IUpdateSubscriptionParams = void;

/** 'UpdateSubscription' return type */
export type IUpdateSubscriptionResult = void;

/** 'UpdateSubscription' query type */
export interface IUpdateSubscriptionQuery {
  params: IUpdateSubscriptionParams;
  result: IUpdateSubscriptionResult;
}

const updateSubscriptionIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE\n  product_x_user\nSET\n  last_check_time = CURRENT_TIMESTAMP\nWHERE\n  product_id = $1"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *   product_x_user
 * SET
 *   last_check_time = CURRENT_TIMESTAMP
 * WHERE
 *   product_id = $1
 * ```
 */
export const updateSubscription = new PreparedQuery<IUpdateSubscriptionParams,IUpdateSubscriptionResult>(updateSubscriptionIR);


