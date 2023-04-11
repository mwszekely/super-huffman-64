import { HuffmanDecoderKey } from "./types.js";
/**
 * Decompresses a stream of bits back into the set of characters that originally made it up.
 *
 * Runtime is `O(n)` where `n` is the number of bits.
 *
 * @param bits The array (or other Iterable) of bits to decompress
 * @param key The decoder key to use.
 * @returns A stream of characters. Use Array.from(decode()).join("") if you just need a string
 */
export declare function decode<T>(bits: Iterable<boolean>, key: HuffmanDecoderKey<T>): Generator<T>;
/**
 * Decompresses a string that was Huffman encoded and turned into the pseudo-base64 used by the encodeFromBase64 function.
 *
 * **Note**: `T` is restricted to `string` in order to work with the most common use case:
 * returning the original string (so `T` must be a string type). Use `decode(base64ToBits(base64), key)`
 * if your `T` is, for example, `number`.
 */
export declare function decodeFromBase64<T extends string>(base64: string, key: HuffmanDecoderKey<T>): string;
//# sourceMappingURL=decode.d.ts.map