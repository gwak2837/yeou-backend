/** Types generated for queries found in "src/routes/product/sql/toggleSubscription.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'ToggleSubscription' parameters type */
export type IToggleSubscriptionParams = void;

/** 'ToggleSubscription' return type */
export interface IToggleSubscriptionResult {
  result: boolean | null;
}

/** 'ToggleSubscription' query type */
export interface IToggleSubscriptionQuery {
  params: IToggleSubscriptionParams;
  result: IToggleSubscriptionResult;
}

const toggleSubscriptionIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  result\nFROM\n  toggle_subscription ($1, $2, $3)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   result
 * FROM
 *   toggle_subscription ($1, $2, $3)
 * ```
 */
export const toggleSubscription = new PreparedQuery<IToggleSubscriptionParams,IToggleSubscriptionResult>(toggleSubscriptionIR);


