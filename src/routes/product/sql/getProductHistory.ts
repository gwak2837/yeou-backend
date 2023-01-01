/** Types generated for queries found in "src/routes/product/sql/getProductHistory.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetProductHistory' parameters type */
export type IGetProductHistoryParams = void;

/** 'GetProductHistory' return type */
export interface IGetProductHistoryResult {
  creation_time: Date | null;
  id: string;
  is_out_of_stock: boolean;
  price: number | null;
}

/** 'GetProductHistory' query type */
export interface IGetProductHistoryQuery {
  params: IGetProductHistoryParams;
  result: IGetProductHistoryResult;
}

const getProductHistoryIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  id,\n  creation_time,\n  is_out_of_stock,\n  price\nFROM\n  product_history\nWHERE\n  product_id = $1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   creation_time,
 *   is_out_of_stock,
 *   price
 * FROM
 *   product_history
 * WHERE
 *   product_id = $1
 * ```
 */
export const getProductHistory = new PreparedQuery<IGetProductHistoryParams,IGetProductHistoryResult>(getProductHistoryIR);


