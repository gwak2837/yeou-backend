/** Types generated for queries found in "src/routes/auth/sql/getGoogleUser.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'GetGoogleUser' parameters type */
export type IGetGoogleUserParams = void;

/** 'GetGoogleUser' return type */
export interface IGetGoogleUserResult {
  id: string;
  name: string | null;
}

/** 'GetGoogleUser' query type */
export interface IGetGoogleUserQuery {
  params: IGetGoogleUserParams;
  result: IGetGoogleUserResult;
}

const getGoogleUserIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  id,\n  name\nFROM\n  \"user\"\nWHERE\n  oauth_google = $1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   name
 * FROM
 *   "user"
 * WHERE
 *   oauth_google = $1
 * ```
 */
export const getGoogleUser = new PreparedQuery<IGetGoogleUserParams,IGetGoogleUserResult>(getGoogleUserIR);


