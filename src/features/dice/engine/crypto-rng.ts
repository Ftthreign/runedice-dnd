/**
 * Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
 * Uses rejection sampling on 32-bit unsigned integers to eliminate modulo bias.
 */

const MAX_UINT32 = 4294967296; // 2^32

export function rollDie(sides: number): number {
  if (sides <= 0 || !Number.isInteger(sides)) {
    throw new Error(`Die sides must be a positive integer, got ${sides}`);
  }

  if (sides === 1) {
    return 1;
  }

  const cryptoObj =
    typeof globalThis !== "undefined" && globalThis.crypto
      ? globalThis.crypto
      : typeof window !== "undefined"
        ? window.crypto
        : null;

  if (!cryptoObj || typeof cryptoObj.getRandomValues !== "function") {
    return Math.floor(Math.random() * sides) + 1;
  }

  const buffer = new Uint32Array(1);
  const maxUsable = MAX_UINT32 - (MAX_UINT32 % sides);

  let randomUint32: number;
  do {
    cryptoObj.getRandomValues(buffer);
    randomUint32 = buffer[0];
  } while (randomUint32 >= maxUsable);

  return (randomUint32 % sides) + 1;
}

export function rollDice(count: number, sides: number): number[] {
  if (count <= 0) return [];
  const results: number[] = new Array(count);
  for (let i = 0; i < count; i++) {
    results[i] = rollDie(sides);
  }
  return results;
}
