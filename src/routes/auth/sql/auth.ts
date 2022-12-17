/** Types generated for queries found in "src/routes/auth/sql/auth.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** 'Auth' parameters type */
export type IAuthParams = void;

/** 'Auth' return type */
export interface IAuthResult {
  id: string;
  name: string | null;
}

/** 'Auth' query type */
export interface IAuthQuery {
  params: IAuthParams;
  result: IAuthResult;
}

const authIR: any = {"usedParamSet":{},"params":[],"statement":"SELECT\n  id,\n  name\nFROM\n  \"user\"\nWHERE\n  id = $1"};

/**
 * Query generated from SQL:
 * ```
 * SELECT
 *   id,
 *   name
 * FROM
 *   "user"
 * WHERE
 *   id = $1
 * ```
 */
export const auth = new PreparedQuery<IAuthParams,IAuthResult>(authIR);


