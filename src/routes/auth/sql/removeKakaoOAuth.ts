/** Types generated for queries found in "src/routes/auth/sql/removeKakaoOAuth.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'RemoveKakaoOAuth' is invalid, so its result is assigned type 'never' */
export type IRemoveKakaoOAuthResult = never;

/** Query 'RemoveKakaoOAuth' is invalid, so its parameters are assigned type 'never' */
export type IRemoveKakaoOAuthParams = never;

const removeKakaoOAuthIR: any = {"usedParamSet":{},"params":[],"statement":"UPDATE\n  \"user\"\nSET\n  kakao_oauth = NULL\nWHERE\n  kakao_oauth = $1"};

/**
 * Query generated from SQL:
 * ```
 * UPDATE
 *   "user"
 * SET
 *   kakao_oauth = NULL
 * WHERE
 *   kakao_oauth = $1
 * ```
 */
export const removeKakaoOAuth = new PreparedQuery<IRemoveKakaoOAuthParams,IRemoveKakaoOAuthResult>(removeKakaoOAuthIR);


