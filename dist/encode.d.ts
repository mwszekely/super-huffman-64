import { HuffmanEncoderKey } from "./types.js";
/**
 * Compresses a string into a series of bits using the given Huffman encoder key.
 *
 * Runtime is `O(n)` where `n` is the length of the string.
 *
 * @param string The string to compress. This can be a string, an array, etc.
 * @param key The encoder key to use.  It must contain a mapping for every character in the string, or else an error will be thrown.
 * @returns A stream of bits. Use Array.from(encode()) if you just need an array
 */
export declare function encode<T>(string: Iterable<T>, key: HuffmanEncoderKey<T>): Generator<boolean>;
/**
 * Compresses a string into a series of bits, then encodes that back into a string encoded in a sort of pseudo-base64
 * (It's not exactly the same because base64 assumes 8-bit bytes, whereas the compressed string can be any number of bits)
 *
 * Runtime is `O(n)` where `n` is the length of the string.
 */
export declare function encodeToBase64<T>(string: Iterable<T>, key: HuffmanEncoderKey<T>): string;
//# sourceMappingURL=encode.d.ts.map