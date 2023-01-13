/** Types generated for queries found in "src/routes/product/sql/getOrCreateProduct.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetOrCreateProduct' parameters type */
export type IGetOrCreateProductParams = void;

/** 'GetOrCreateProduct' return type */
export interface IGetOrCreateProductResult {
  can_buy: boolean | null;
  has_card_discount: boolean | null;
  has_coupon_discount: boolean | null;
  is_new: boolean | null;
  prices: string | null;
  product_id: string | null;
}

/** 'GetOrCreateProduct' query type */
export interface IGetOrCreateProductQuery {
  params: IGetOrCreateProductParams;
  result: IGetOrCreateProductResult;
}

const getOrCreateProductIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  product_id,\n  is_new,\n  prices,\n  has_card_discount,\n  has_coupon_discount,\n  can_buy\nFROM\n  get_or_create_product ($1, $2)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   product_id,
 *   is_new,
 *   prices,
 *   has_card_discount,
 *   has_coupon_discount,
 *   can_buy
 * FROM
 *   get_or_create_product ($1, $2)
 * ```
 */
export const getOrCreateProduct = new PreparedQuery<IGetOrCreateProductParams,IGetOrCreateProductResult>(getOrCreateProductIR);


