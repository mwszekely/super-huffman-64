import { InvalidEncoderKeyError } from "./types.js";
import { bitsToBase64 } from "./base64-encode.js";
/**
 * Compresses a string into a series of bits using the given Huffman encoder key.
 *
 * Runtime is `O(n)` where `n` is the length of the string.
 *
 * @param string The string to compress. This can be a string, an array, etc.
 * @param key The encoder key to use.  It must contain a mapping for every character in the string, or else an error will be thrown.
 * @returns A stream of bits. Use Array.from(encode()) if you just need an array
 */
export function* encode(string, key) {
    for (let char of string) {
        const arrayForChar = key.get(char);
        if (arrayForChar === undefined)
            throw new InvalidEncoderKeyError(char);
        for (let bit of arrayForChar)
            yield bit;
    }
}
/**
 * Compresses a string into a series of bits, then encodes that back into a string encoded in a sort of pseudo-base64
 * (It's not exactly the same because base64 assumes 8-bit bytes, whereas the compressed string can be any number of bits)
 *
 * Runtime is `O(n)` where `n` is the length of the string.
 */
export function encodeToBase64(string, key) {
    return Array.from(bitsToBase64(encode(string, key))).join("");
}
//# sourceMappingURL=encode.js.map