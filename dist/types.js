/**
 * An error that occurs when a character was instructed to be encoded even though the key had no entry for it.
 */
export class InvalidEncoderKeyError extends Error {
    constructor(key) {
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
//# sourceMappingURL=types.js.map