
import { HuffmanDecoderKey, HuffmanDecoderKeyNode, InvalidDecoderKeyError } from "./types";
import { base64ToBits } from "./base64-decode";

/**
 * Decompresses a stream of bits back into the set of characters that originally made it up.
 * @param bits The array (or other Iterable) of bits to decompress
 * @param key The decoder key to use.
 * @returns A stream of characters. Use Array.from(decode()).join("") if you just need a string
 */
export function* decode<T>(bits: Iterable<boolean>, key: HuffmanDecoderKey<T>): Generator<T> {

    let currentNode: HuffmanDecoderKey<T> = key;
    if (!Array.isArray(currentNode))
        return currentNode;

    for (let bit of bits) {
        let nextNode: HuffmanDecoderKey<T> = currentNode[+bit as 0 | 1];
        if (!Array.isArray(nextNode)) {
            yield nextNode;
            currentNode = key as (HuffmanDecoderKeyNode<T>);
        }
        else {
            currentNode = nextNode;
        }
    }

    if (currentNode !== key)
        throw new InvalidDecoderKeyError()
}


/**
 * Decompresses a string that was Huffman encoded and turned into the pseudo-base64 used by the encodeFromBase64 function.
 * 
 * **Note**: `T` is restricted to `string` in order to work with the most common use case:
 * returning the original string (so `T` must be a string type). Use `decode(base64ToBits(base64), key)`
 * if your `T` is, for example, `number`.
 */
export function decodeFromBase64<T extends string>(base64: string, key: HuffmanDecoderKey<T>) {
    return Array.from(decode(base64ToBits(base64), key)).join("");
}
