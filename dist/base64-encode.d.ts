/**
 * Converts an array of bits to a pseudo-base64 string.
 * "Pseudo" because base64 expects 8-bit bytes, and can't natively handle, say, an array of 9 bits.
 * Instead of ending with = or == to indicate the number of padding bits,
 * the characters accessed by leftoverBitsMap[excessBitCount] are used.
 * @param array
 */
export declare function bitsToBase64(array: Iterable<boolean>): Generator<string, void, unknown>;
//# sourceMappingURL=base64-encode.d.ts.map