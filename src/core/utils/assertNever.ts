/**
 * assertNever ensures exhaustive handling in switch/if chains.
 * TypeScript will error at compile time if a case is missed.
 */
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}
