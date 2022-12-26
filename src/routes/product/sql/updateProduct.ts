/** Types generated for queries found in "src/routes/product/sql/updateProduct.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'UpdateProduct' parameters type */
export type IUpdateProductParams = void;

/** 'UpdateProduct' return type */
export type IUpdateProductResult = void;

/** 'UpdateProduct' query type */
export interface IUpdateProductQuery {
  params: IUpdateProductParams;
  result: IUpdateProductResult;
}

const updateProductIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE\n  product\nSET\n  name = $1,\n  option = $2,\n  image_url = $3\nWHERE\n  id = $4"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *   product
 * SET
 *   name = $1,
 *   option = $2,
 *   image_url = $3
 * WHERE
 *   id = $4
 * ```
 */
export const updateProduct = new PreparedQuery<IUpdateProductParams,IUpdateProductResult>(updateProductIR);


