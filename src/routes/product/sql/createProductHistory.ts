/** Types generated for queries found in "src/routes/product/sql/createProductHistory.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'CreateProductHistory' parameters type */
export type ICreateProductHistoryParams = void;

/** 'CreateProductHistory' return type */
export type ICreateProductHistoryResult = void;

/** 'CreateProductHistory' query type */
export interface ICreateProductHistoryQuery {
  params: ICreateProductHistoryParams;
  result: ICreateProductHistoryResult;
}

const createProductHistoryIR: any = {"usedParamSet":{},"params":[],"statement":"INSERT INTO product_history (creation_time, is_out_of_stock, price, product_id)\n  VALUES ($1, $2, $3, $4)"};

/**
 * Query generated from SQL:
 * ```
 * INSERT INTO product_history (creation_time, is_out_of_stock, price, product_id)
 *   VALUES ($1, $2, $3, $4)
 * ```
 */
export const createProductHistory = new PreparedQuery<ICreateProductHistoryParams,ICreateProductHistoryResult>(createProductHistoryIR);


