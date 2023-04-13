import FlatQueue from "flatqueue";
import { EmptyInputError } from "./types.js";
/**
 * Optional utility class to easily build huffman keys.
 *
 * Create one, tell it the weights to use, and get your encoder/decoder keys.
 *
 * ```typescript
 * const builder = new HuffmanKeyBuilder("Lorem ipsum[...]");
 * // Manually add a rare character that wasn't in the source text:
 * builder.add("\x00", 0);
 * const encoderKey = builder.encoder;
 * const decoderKey = builder.decoder;
 * ```
 *
 * This class is really just a wrapper around the following:
 *
 * ```typescript
 * const mapOfWeights = new Map([["a", 5], ["b", 4], ...])
 * const rootNode = buildHuffmanTree(mapOfWeights);
 * const encoderKey = makeHuffmanEncoderKey(rootNode);
 * const decoderKey = makeHuffmanDecoderKey(rootNode);
 * ```
 *
 * Thus the class isn't necessary, but a nice way to
 * abstract away from the idea of Huffman trees and
 * just focus on making keys from strings.
 */
export class HuffmanKeyBuilder {
    _counts = new Map();
    _encoderKey = null;
    _decoderKey = null;
    constructor(input) {
        if (input) {
            for (let ch of input) {
                this.add(ch);
            }
            this.ensureKey();
        }
    }
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
    add(value, count = 1) {
        const newCount = ((this._counts.get(value) ?? 0) + (count));
        this._counts.set(value, newCount);
        this._encoderKey = null;
        this._decoderKey = null;
    }
    // Returns the Huffman key that can represent all the characters that have been added so far with their given weights.
    get encoder() {
        this.ensureKey();
        return this._encoderKey;
    }
    get decoder() {
        this.ensureKey();
        return this._decoderKey;
    }
    /**
     * Returns the weight for the given character that's been calculated up to this point.
     *
     * Each instance of a character increases its weight by one.
     */
    getWeight(value) { return this._counts.get(value) ?? 0; }
    ensureKey() {
        if (!this._encoderKey) {
            const rootNode = buildHuffmanTree(this._counts);
            this._encoderKey = makeHuffmanEncoderKey(rootNode);
            this._decoderKey = makeHuffmanDecoderKey(rootNode);
        }
    }
}
/**
 * Returns the root node of a Huffman tree based on the input array of [character, characterCount]
 * @param weights An array (or any Iterable) of 2 tuples of [character, characterCount] (e.g. what you get from map.entries()).
 *
 * Runtime is `O(n ⋅ log n)` for `n` number of weights given.
 */
export function buildHuffmanTree(weights) {
    const nodes = new FlatQueue();
    // Add all of our character -> count entries to our priority queue as a set of disconnected leaves
    // They're sorted by count ascending with the lowest at [0]
    //
    // Note that we prevent absolute 0 from ever being used as a count because
    // doing so prevents all the zero-count elements from all being shoved 
    // into one super-deep branch of the tree
    for (const entry of weights) {
        const weight = (entry[1] || Number.EPSILON);
        nodes.push({ type: "l", value: entry[0], weight }, weight);
    }
    while (nodes.length > 1) {
        let smallest = nodes.pop();
        let secondSmallest = nodes.pop();
        let weight = smallest.weight + secondSmallest.weight;
        let combination = {
            type: "c",
            left: smallest,
            right: secondSmallest,
            weight
        };
        // O(log n)
        nodes.push(combination, weight);
    }
    if (nodes.length == 0)
        throw new EmptyInputError();
    return nodes.peek();
}
/**
 * Builds a decoder key, which is just a tree made out of arrays.
 */
export function makeHuffmanDecoderKey(rootNode) {
    if (rootNode.type == "c")
        return [makeHuffmanDecoderKey(rootNode.left), makeHuffmanDecoderKey(rootNode.right)];
    else
        return rootNode.value;
}
/**
 * Builds an encoder key, which is a mapping of characters to arrays of bits (booleans).
 */
export function makeHuffmanEncoderKey(rootNode) {
    let encodingKey = new Map();
    let gen = traverseTree(rootNode, []);
    for (const [value, binaryKey] of gen) {
        encodingKey.set(value, binaryKey);
    }
    return encodingKey;
}
/**
 * Utility function that simply yields every entry in a given tree,
 * while keeping track of what key we've needed to use so far
 * to get to that point in the tree.
 */
function* traverseTree(node, currentKey) {
    if (node.type == "l") {
        yield [node.value, currentKey];
    }
    else {
        let newLeftKey = currentKey.slice();
        let newRightKey = currentKey.slice();
        newLeftKey.push(false);
        newRightKey.push(true);
        yield* traverseTree(node.left, newLeftKey);
        yield* traverseTree(node.right, newRightKey);
    }
}
//# sourceMappingURL=key.js.map