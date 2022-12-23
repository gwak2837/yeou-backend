/** Types generated for queries found in "src/routes/product/sql/saveProductHistory.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'SaveProductHistory' parameters type */
export type ISaveProductHistoryParams = void;

/** 'SaveProductHistory' return type */
export interface ISaveProductHistoryResult {
  condition: string | null;
  email: string | null;
  flare_lane_device_id: string | null;
  phone_number: string | null;
  should_notify_by_email: boolean | null;
  should_notify_by_kakaotalk: boolean | null;
  should_notify_by_line: boolean | null;
  should_notify_by_phone: boolean | null;
  should_notify_by_telegram: boolean | null;
  should_notify_by_web_push: boolean | null;
  telegram_user_id: number | null;
}

/** 'SaveProductHistory' query type */
export interface ISaveProductHistoryQuery {
  params: ISaveProductHistoryParams;
  result: ISaveProductHistoryResult;
}

const saveProductHistoryIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  condition,\n  email,\n  flare_lane_device_id,\n  phone_number,\n  should_notify_by_email,\n  should_notify_by_kakaotalk,\n  should_notify_by_line,\n  should_notify_by_phone,\n  should_notify_by_telegram,\n  should_notify_by_web_push,\n  telegram_user_id\nFROM\n  save_product_history ($1, $2, $3, $4, $5, $6)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   condition,
 *   email,
 *   flare_lane_device_id,
 *   phone_number,
 *   should_notify_by_email,
 *   should_notify_by_kakaotalk,
 *   should_notify_by_line,
 *   should_notify_by_phone,
 *   should_notify_by_telegram,
 *   should_notify_by_web_push,
 *   telegram_user_id
 * FROM
 *   save_product_history ($1, $2, $3, $4, $5, $6)
 * ```
 */
export const saveProductHistory = new PreparedQuery<ISaveProductHistoryParams,ISaveProductHistoryResult>(saveProductHistoryIR);


