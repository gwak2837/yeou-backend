/** Types generated for queries found in "src/routes/auth/sql/auth.sql" */
import { PreparedQuery } from '@pgtyped/query';

/** Query 'Auth' is invalid, so its result is assigned type 'never' */
export type IAuthResult = never;

/** Query 'Auth' is invalid, so its parameters are assigned type 'never' */
export type IAuthParams = never;

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


