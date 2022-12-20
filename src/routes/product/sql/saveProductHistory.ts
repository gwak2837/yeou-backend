/** Types generated for queries found in "src/routes/product/sql/saveProductHistory.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'SaveProductHistory' parameters type */
export type ISaveProductHistoryParams = void;

/** 'SaveProductHistory' return type */
export interface ISaveProductHistoryResult {
  result: boolean | null;
}

/** 'SaveProductHistory' query type */
export interface ISaveProductHistoryQuery {
  params: ISaveProductHistoryParams;
  result: ISaveProductHistoryResult;
}

const saveProductHistoryIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  result\nFROM\n  save_product_history ($1, $2, $3, $4, $5, $6)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   result
 * FROM
 *   save_product_history ($1, $2, $3, $4, $5, $6)
 * ```
 */
export const saveProductHistory = new PreparedQuery<ISaveProductHistoryParams,ISaveProductHistoryResult>(saveProductHistoryIR);


