/** Types generated for queries found in "src/routes/auth/sql/getKakaoUser.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetKakaoUser' parameters type */
export type IGetKakaoUserParams = void;

/** 'GetKakaoUser' return type */
export interface IGetKakaoUserResult {
  id: string;
  name: string | null;
  phone_number: string | null;
}

/** 'GetKakaoUser' query type */
export interface IGetKakaoUserQuery {
  params: IGetKakaoUserParams;
  result: IGetKakaoUserResult;
}

const getKakaoUserIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  id,\n  name,\n  phone_number\nFROM\n  \"user\"\nWHERE\n  oauth_kakao = $1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   name,
 *   phone_number
 * FROM
 *   "user"
 * WHERE
 *   oauth_kakao = $1
 * ```
 */
export const getKakaoUser = new PreparedQuery<IGetKakaoUserParams,IGetKakaoUserResult>(getKakaoUserIR);


