import { InvalidDecoderKeyError } from "./types.js";
import { base64ToBits } from "./base64-decode.js";
/**
 * Decompresses a stream of bits back into the set of characters that originally made it up.
 *
 * Runtime is `O(n)` where `n` is the number of bits.
 *
 * @param bits The array (or other Iterable) of bits to decompress
 * @param key The decoder key to use.
 * @returns A stream of characters. Use Array.from(decode()).join("") if you just need a string
 */
export function* decode(bits, key) {
    let currentNode = key;
    if (!Array.isArray(currentNode))
        return currentNode;
    for (let bit of bits) {
        let nextNode = currentNode[+bit];
        if (!Array.isArray(nextNode)) {
            yield nextNode;
            currentNode = key;
        }
        else {
            currentNode = nextNode;
        }
    }
    if (currentNode !== key)
        throw new InvalidDecoderKeyError();
}
/**
 * Decompresses a string that was Huffman encoded and turned into the pseudo-base64 used by the encodeFromBase64 function.
 *
 * **Note**: `T` is restricted to `string` in order to work with the most common use case:
 * returning the original string (so `T` must be a string type). Use `decode(base64ToBits(base64), key)`
 * if your `T` is, for example, `number`.
 */
export function decodeFromBase64(base64, key) {
    return Array.from(decode(base64ToBits(base64), key)).join("");
}
function* byteToBits(byte, leftoverBits) {
    console.assert((byte >= 0x0000 && byte < 0x0100) || (byte >= -0x80 && byte < 0x80), `Number was not within the range of a byte: ${byte < 0 ? "-" : ""}0x${Math.abs(byte).toString(16).padStart(4, "0")}`);
    if (byte < 0) {
        byte = byte + 0x80;
    }
    for (let bitIndex = 0; bitIndex < 8 - leftoverBits; ++bitIndex) {
        yield !!(byte & (1 << bitIndex));
    }
}
function* bytesToBits(bytes, leftoverBits) {
    // Any time we get a byte, and it's the last byte, we need to truncate it by `leftoverBits` amount.
    // But we can't know when it's the last one until we're done,
    // so we delay sending by one iteration.
    let nextByteToSend = null;
    for (let byte of bytes) {
        if (nextByteToSend != null) {
            yield* byteToBits(nextByteToSend, 0);
        }
        nextByteToSend = byte;
    }
    // The only way this is still null is if bytes.length is 0
    if (nextByteToSend != null) {
        // This is the final byte, so truncate it as appropriate
        yield* byteToBits(nextByteToSend, leftoverBits);
    }
}
export function* decodeFromBytes(bytes, leftoverBits, key) {
    return yield* decode(bytesToBits(bytes, leftoverBits), key);
}
//# sourceMappingURL=decode.js.map