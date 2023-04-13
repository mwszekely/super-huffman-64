/** A mapping of characters to arrays of bits. */
export type HuffmanEncoderKey<T> = Map<T, boolean[]>;
/** Either a character (a leaf node) or a 2-tuple of [Key, Key] */
export type HuffmanDecoderKey<T> = (HuffmanDecoderKeyNode<T> | T);
export type HuffmanDecoderKeyNode<T> = [HuffmanDecoderKey<T>, HuffmanDecoderKey<T>];

/**
 * An error that occurs when a character was instructed to be encoded even though the key had no entry for it.
 */
export class InvalidEncoderKeyError extends Error {
    constructor(key?: unknown) {
        super(`Entry ${JSON.stringify(key)} does not exist in Huffman key and cannot be encoded.`);
        this.name = "InvalidEncoderKeyError";
    }
}

/**
 * An error that occurs then the bit stream could not be decoded because it ended in the middle of a character.
 */
export class InvalidDecoderKeyError extends Error {
    constructor() {
        super(`Unexpected end of bit stream.`);
        this.name = "InvalidDecoderKeyError";
    }
}

/**
 * An error that occurs when a key is built with no input data. It is impossible
 * to build a key without at least one input.
 */
export class EmptyInputError extends Error {
    constructor() {
        super(`This key could not be built because it had no input (or an input length of 0).`);
        this.name = "EmptyInputError";
    }
}
