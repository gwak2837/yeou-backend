/** Types generated for queries found in "src/routes/product/sql/saveProductHistory.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'SaveProductHistory' parameters type */
export type ISaveProductHistoryParams = void;

/** 'SaveProductHistory' return type */
export type ISaveProductHistoryResult = void;

/** 'SaveProductHistory' query type */
export interface ISaveProductHistoryQuery {
  params: ISaveProductHistoryParams;
  result: ISaveProductHistoryResult;
}

const saveProductHistoryIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO product_history (is_out_of_stock, price, product_id)\n  VALUES ($1, $2, $3)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO product_history (is_out_of_stock, price, product_id)
 *   VALUES ($1, $2, $3)
 * ```
 */
export const saveProductHistory = new PreparedQuery<ISaveProductHistoryParams,ISaveProductHistoryResult>(saveProductHistoryIR);


