/** A mapping of characters to arrays of bits. */
export type HuffmanEncoderKey<T> = Map<T, boolean[]>;
/** Either a character (a leaf node) or a 2-tuple of [Key, Key] */
export type HuffmanDecoderKey<T> = (HuffmanDecoderKeyNode<T> | T);
export type HuffmanDecoderKeyNode<T> = [HuffmanDecoderKey<T>, HuffmanDecoderKey<T>];
/**
 * An error that occurs when a character was instructed to be encoded even though the key had no entry for it.
 */
export declare class InvalidEncoderKeyError extends Error {
    constructor(key?: unknown);
}
/**
 * An error that occurs then the bit stream could not be decoded because it ended in the middle of a character.
 */
export declare class InvalidDecoderKeyError extends Error {
    constructor();
}
//# sourceMappingURL=types.d.ts.map