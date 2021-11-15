import TinyQueue from "tinyqueue";
import { HuffmanEncoderKey, HuffmanDecoderKey } from "./types";


/**
 * Utility class to easily build huffman keys.
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
export class HuffmanKeyBuilder<T = string> {

    private _counts: Map<T, number> = new Map();
    private _encoderKey: HuffmanEncoderKey<T> | null = null;
    private _decoderKey: HuffmanDecoderKey<T> | null = null;

    constructor(input?: Iterable<T>) {
        if (input) {
            for (let ch of input) {
                this.add(ch);
            }
            this.ensureKey();
        }
    }

    /**
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
    add(value: T, count = 1) {
        const newCount = ((this._counts.get(value) ?? 0) + (count));
        this._counts.set(value, newCount);
        this._encoderKey = null;
        this._decoderKey = null;
    }

    // Returns the Huffman key that can represent all the characters that have been added so far with their given weights.
    get encoder() {
        this.ensureKey();
        return this._encoderKey!;
    }

    get decoder() {
        this.ensureKey();
        return this._decoderKey!;
    }

    private ensureKey() {
        const rootNode = buildHuffmanTree(this._counts);
        this._encoderKey = makeHuffmanEncoderKey(rootNode);
        this._decoderKey = makeHuffmanDecoderKey(rootNode);
    }
}



/**
 * Represents the leaf node of a Huffman tree (i.e. a character and the number of times it occurs).
 * Only used when building a key, not when encoding/decoding.
 */
 export interface HuffmanTreeLeafNode<T> {
    type: "l"; // "leaf"
    value: T;
    weight: number; // The number of times this character appears in the source text
}

/**
 * Represents the a node of other nodes in a Huffman tree.
 * Only used when building a key, not when encoding/decoding.
 */
 export interface HuffmanTreeCombinationNode<T> {
    type: "c"; // "combination";
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
 */
export function buildHuffmanTree<T>(weights: Iterable<[T, number]>): HuffmanTreeNode<T> {
    const nodes = new TinyQueue<HuffmanTreeLeafNode<T> | HuffmanTreeCombinationNode<T>>([], (lhs, rhs) => {
        return lhs.weight - rhs.weight;
    });

    // Add all of our character -> count entries to our priority queue as a set of disconnected leaves
    // They're sorted by count ascending with the lowest at [0]
    //
    // Note that we prevent absolute 0 from ever being used as a count because
    // doing so prevents all the zero-count elements from all being shoved 
    // into one super-deep branch of the tree
    for (const entry of weights) {
        nodes.push({ type: "l", value: entry[0], weight: (entry[1] || Number.EPSILON) });
    }



    while (nodes.length > 1) {
        let smallest = nodes.pop()!;
        let secondSmallest = nodes.pop()!;


        let combination: HuffmanTreeCombinationNode<T> = {
            type: "c",
            left: smallest,
            right: secondSmallest,
            weight: smallest.weight + secondSmallest.weight
        }

        nodes.push(combination);
    }

    return nodes.peek()!;
}


/**
 * Builds a decoder key, which is just a tree made out of arrays.
 */
 export function makeHuffmanDecoderKey<T>(rootNode: HuffmanTreeNode<T>): HuffmanDecoderKey<T> {
    if (rootNode.type == "c")
        return [makeHuffmanDecoderKey(rootNode.left), makeHuffmanDecoderKey(rootNode.right)];
    else
        return rootNode.value;
}

/**
 * Builds an encoder key, which is a mapping of characters to arrays of bits (booleans).
 */
 export function makeHuffmanEncoderKey<T>(rootNode: HuffmanTreeNode<T>): HuffmanEncoderKey<T> {

    let encodingKey = new Map<T, boolean[]>();

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
function* traverseTree<T>(node: HuffmanTreeNode<T>, currentKey: boolean[]): Generator<readonly [T, boolean[]]> {

    if (node.type == "l") {
        yield [node.value, currentKey] as const;
    }
    else {
        let newLeftKey = currentKey.slice();
        let newRightKey = currentKey.slice();
        newLeftKey.push(false);
        newRightKey.push(true);

        let leftGen = traverseTree(node.left, newLeftKey);
        let rightGen = traverseTree(node.right, newRightKey);
        for (let l of leftGen)
            yield l;
        for (let r of rightGen)
            yield r;
    }
}

