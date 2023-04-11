import { HuffmanEncoderKey, HuffmanDecoderKey } from "./types.js";
/**
 * Optional utility class to easily build huffman keys.
 *
 * ```typescript
 * const builder = new HuffmanKeyBuilder("Lorem ipsum[...]");
 * // Add a character to rare to appear in the source text:
 * builder.add("\x00", 0.001);
 * const encoderKey = builder.encoder;
 * const decoderKey = builder.decoder;
 * ```
 *
 * This class is really just a wrapper around the following:
 *
 * ```typescript
 * const rootNode = buildHuffmanTree([["L", 5], ["o", 9], [...]]);
 * const encoderKey = makeHuffmanEncoderKey(rootNode);
 * const decoderKey = makeHuffmanDecoderKey(rootNode);
 * ```
 *
 * Thus the class isn't necessary, but a nice way to
 * abstract away from the idea of Huffman trees and
 * just focus on making keys from strings.
 */
export declare class HuffmanKeyBuilder<T = string> {
    private _counts;
    private _encoderKey;
    private _decoderKey;
    constructor(input?: Iterable<T>);
    /**
     * `O(n)` for `n` characters added (`O(1)` per call).
     *
     * Adds a character to the key, increasing its weight by 1.
     * If you know the number of characters beforehand, you can specific the weight directly.
     * You can also specify a very small weight for values that you know might exist but aren't in the source.
     * Something akin to the following is perfectly reasonable, if somewhat large:
     *
     * ````
     * for (let i = 0; i < 0x110000; ++i)
     *     builder.add(String.fromCodePoint(i), 0.0000000001);
     * ````
     *
     * @param value The character to add. This should generally NOT be longer than one character unless that's how you're splitting your string up.
     * @param count The number of times the character is being added. Can be < 1, which implies a character that should be considered even though it's rarer than anything in the source text.
     */
    add(value: T, count?: number): void;
    get encoder(): HuffmanEncoderKey<T>;
    get decoder(): import("./types.js").HuffmanDecoderKeyNode<T> | NonNullable<T>;
    /**
     * Returns the weight for the given character that's been calculated up to this point.
     *
     * Each instance of a character increases its weight by one.
     */
    getWeight(value: T): number;
    private ensureKey;
}
/**
 * Represents the leaf node of a Huffman tree (i.e. a character and the number of times it occurs).
 * Only used when building a key, not when encoding/decoding.
 */
export interface HuffmanTreeLeafNode<T> {
    type: "l";
    value: T;
    weight: number;
}
/**
 * Represents the a node of other nodes in a Huffman tree.
 * Only used when building a key, not when encoding/decoding.
 */
export interface HuffmanTreeCombinationNode<T> {
    type: "c";
    left: HuffmanTreeNode<T>;
    right: HuffmanTreeNode<T>;
    weight: number;
}
/**
 * Represents a node in a Huffman tree.
 * Only used when building a key, not when encoding/decoding.
 */
export type HuffmanTreeNode<T> = HuffmanTreeLeafNode<T> | HuffmanTreeCombinationNode<T>;
/**
 * Returns the root node of a Huffman tree based on the input array of [character, characterCount]
 * @param weights An array (or any Iterable) of 2 tuples of [character, characterCount] (e.g. what you get from map.entries()).
 *
 * Runtime is `O(n ⋅ log n)` for `n` number of weights given.
 */
export declare function buildHuffmanTree<T>(weights: Iterable<[T, number]>): HuffmanTreeNode<T>;
/**
 * Builds a decoder key, which is just a tree made out of arrays.
 */
export declare function makeHuffmanDecoderKey<T>(rootNode: HuffmanTreeNode<T>): HuffmanDecoderKey<T>;
/**
 * Builds an encoder key, which is a mapping of characters to arrays of bits (booleans).
 */
export declare function makeHuffmanEncoderKey<T>(rootNode: HuffmanTreeNode<T>): HuffmanEncoderKey<T>;
//# sourceMappingURL=key.d.ts.map