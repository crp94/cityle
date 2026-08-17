/**
 * Standard TypeScript exhaustiveness-checking utility.
 *
 * Call this in the `default` branch of a `switch` over a union type (e.g.
 * `GameMode`). If every member of the union is handled by an earlier `case`,
 * TypeScript narrows the value reaching `default` to `never`, so the call
 * type-checks. If a new member is later added to the union and this switch
 * isn't updated for it, the value reaching `default` is no longer `never`
 * and the call site fails to compile — turning a forgotten case into a
 * build-time error instead of a silent runtime fallthrough.
 */
export function assertNever(x: never, context: string): never {
  throw new Error(`Unhandled case in ${context}: ${JSON.stringify(x)}`);
}
