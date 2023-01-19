/** Types generated for queries found in "src/routes/auth/sql/removeKakaoOAuth.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'RemoveKakaoOAuth' parameters type */
export type IRemoveKakaoOAuthParams = void;

/** 'RemoveKakaoOAuth' return type */
export type IRemoveKakaoOAuthResult = void;

/** 'RemoveKakaoOAuth' query type */
export interface IRemoveKakaoOAuthQuery {
  params: IRemoveKakaoOAuthParams;
  result: IRemoveKakaoOAuthResult;
}

const removeKakaoOAuthIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE\n  \"user\"\nSET\n  oauth_kakao = NULL\nWHERE\n  oauth_kakao = $1"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *   "user"
 * SET
 *   oauth_kakao = NULL
 * WHERE
 *   oauth_kakao = $1
 * ```
 */
export const removeKakaoOAuth = new PreparedQuery<IRemoveKakaoOAuthParams,IRemoveKakaoOAuthResult>(removeKakaoOAuthIR);


