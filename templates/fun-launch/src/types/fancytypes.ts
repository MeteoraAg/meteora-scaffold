/**
 * Compiler would throw an error if a switch-case is not exhaustive.
 * @see {@link https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#union-exhaustiveness-checking Unions and Intersection Types}
 */
export function assertNever(_arg: never, message = 'Unknown error occured.'): never {
  throw new Error(message);
}

/**
 * Extract the query data type from a query definition
 *
 * @example
 * ```ts
 * type Data = ExtractQueryData<typeof DatapiQueries.tokenList>;
 * ```
 */
export type ExtractQueryData<T> = T extends (...args: any) => infer Opt
  ? ExtractQueryData<Opt>
  : T extends { queryFn?: (...args: any) => infer QueryResult }
    ? Awaited<QueryResult>
    : never;
