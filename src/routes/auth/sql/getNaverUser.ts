/** Types generated for queries found in "src/routes/auth/sql/getNaverUser.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetNaverUser' parameters type */
export type IGetNaverUserParams = void;

/** 'GetNaverUser' return type */
export interface IGetNaverUserResult {
  id: string;
  name: string | null;
}

/** 'GetNaverUser' query type */
export interface IGetNaverUserQuery {
  params: IGetNaverUserParams;
  result: IGetNaverUserResult;
}

const getNaverUserIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  id,\n  name\nFROM\n  \"user\"\nWHERE\n  oauth_naver = $1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   name
 * FROM
 *   "user"
 * WHERE
 *   oauth_naver = $1
 * ```
 */
export const getNaverUser = new PreparedQuery<IGetNaverUserParams,IGetNaverUserResult>(getNaverUserIR);


