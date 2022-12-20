/** Types generated for queries found in "src/routes/auth/sql/getFlareLaneUser.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetFlareLaneUser' parameters type */
export type IGetFlareLaneUserParams = void;

/** 'GetFlareLaneUser' return type */
export interface IGetFlareLaneUserResult {
  user_id: string | null;
}

/** 'GetFlareLaneUser' query type */
export interface IGetFlareLaneUserQuery {
  params: IGetFlareLaneUserParams;
  result: IGetFlareLaneUserResult;
}

const getFlareLaneUserIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  user_id\nFROM\n  get_flare_lane_user ($1)"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   user_id
 * FROM
 *   get_flare_lane_user ($1)
 * ```
 */
export const getFlareLaneUser = new PreparedQuery<IGetFlareLaneUserParams,IGetFlareLaneUserResult>(getFlareLaneUserIR);


