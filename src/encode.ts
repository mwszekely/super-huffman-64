
import { HuffmanEncoderKey, InvalidEncoderKeyError } from "./types";
import { bitsToBase64 } from "./base64-encode";

/**
 * Compresses a string into a series of bits using the given Huffman encoder key.
 * @param string The string to compress. This can be a string, an array, etc.
 * @param key The encoder key to use.  It must contain a mapping for every character in the string, or else an error will be thrown.
 * @returns A stream of bits. Use Array.from(encode()) if you just need an array
 */
export function* encode<T>(string: Iterable<T>, key: HuffmanEncoderKey<T>): Generator<boolean> {
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
 */
export function encodeToBase64<T>(string: Iterable<T>, key: HuffmanEncoderKey<T>) {
    return Array.from(bitsToBase64(encode(string, key))).join("");
}

