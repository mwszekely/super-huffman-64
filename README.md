
# Super Huffman 64

Allows for simple compressing/decompressing of data via Huffman encoding to a Base64-encoded* string.

\* (It's not **true** Base64 because the encoded data often won't fill the whole 8 bits in the final byte, more below)


Example usages:

## Highest level
A lot of functions are combined together by using a `HuffmanKeyBuilder` class,
then just using `encodeToBase64` and `decodeToBase64`. If you don't ever need to
think about the Huffman tree and its nodes and such, this is all you'll need.
````typescript
const source = "Lorem ipsum dolor [...]";   // (Full text below)

// Register each character's weight (or count, frequency, etc.)
const keyBuilder = new HuffmanKeyBuilder(source);

// Encode and decode some sample text
const toEncode = "Lorem ipsum dolor sit amet";
const base64 = encodeToBase64(toEncode, keyBuilder.encoder);    // 'V0p98Q8e+7Iym4a0X+g]'
const decoded = decodeFromBase64(base64, keyBuilder.decoder);   // 'Lorem ipsum dolor sit amet'

console.assert(toEncode == decoded);

console.log(JSON.stringify(keyBuilder.decoder));
// '[[[[[[",",[["D","h"],"b"]],"p"],"l"],"i"],[["r",[["q",["f",["E",["L","U"]]]],[["g","v"],["x","."]]]],["n","u"]]],[[["a","o"],["t",["c","m"]]],[" ",[["s","d"],"e"]]]]'
````

The generated Base64 string here isn't *exactly* Base64 (the final character being the giveaway) because Base64 requires everything to be aligned to 8-bit bytes, and encoded Huffman
strings can result in a stream of bits of *any* length. These strings use a final character
that indicates how many bits need to be dropped from the preceding character (1 - 5) instead
of 1 or 2 equals signs.

## Lower level
The above functions all use these functions internally.  They take `Iterable` streams
of characters/bits and, as generator functions, return their results bit by bit or
character by character.
````typescript
const charCounts = [
    ["L",1],
    ["o",29],
    ["r",22],
    ["e",37],
    ["m",17],
    [" ",68],
    ...
];

// Build the keys used to encode/decode this set of characters
const rootNode = buildHuffmanTree(charCounts);
const encoderKey = makeHuffmanEncoderKey(rootNode);
const decoderKey = makeHuffmanDecoderKey(rootNode);

// encode returns a Generator yielding 
// bit by bit (or boolean by boolean) 
// the compressed data.
const encodedBits: boolean[] = Array.from(encode(str, encoderKey));

// decode works similarly, yielding a stream of strings.
const decoded: string = Array.from(decode(encodedBits, decoderKey)).join("");

console.assert(decoded == str);
````

## Backup characters
A `HuffmanKeyBuilder`'s `add` method can take an optional argument indicating
the number of characters that exist, if you know ahead of time and don't 
want to add them one by one.  Additionally, you can pass a number that's < 1,
which implies a character that's so rare it doesn't appear in the source text,
but should still have an entry in the key.
````typescript 

const source = "Lorem ipsum dolor [...]";
const keyBuilder = new HuffmanKeyBuilder(source);

// Add all ASCII characters to the map, just in case.
// (Keep in mind the size of the key scales linearly with the # of characters it can encode
// but the number of bits it takes to encode the actual character scales logarithmically.  
// You could add all Unicode characters instead of just the ASCII characters, 
// but you wouldn't want to send such a large key as part of a message -- instead it
// would need to be a "global" key for everyone.)
for (let i = 0; i < 0x80; ++i)
    keyBuilder.add(String.fromCodePoint(i), 0);

// The ? character at the end here wasn't in our source string
const toEncode = "Lorem ipsum dolor sit amet?";
const base64 = encodeToBase64(toEncode, keyBuilder.key);    // '6jn9sEca2u5Oe4K0W+u/l+w)'
const decoded = decodeFromBase64(base64, keyBuilder.key);

console.assert(toEncode == decoded);

````

## Encoding other things
You don't have to encode just single characters in strings. Because these 
functions all accept generic `Iterable` objects, you can pass in anything
you can make a dictionary for.  You could encode a paragraph word by word, 
for example (assuming it contains a lot of repeating text).

````typescript
// The Lorem ipsum text doesn't really have a whole lot of repeating
// words, but we'll keep using it anyway.
const source = "Lorem ipsum dolor [...]".split(" ");
const keyBuilder = new HuffmanKeyBuilder();
for (const c of source)
    keyBuilder.add(c);
keyBuilder.add(" ", source.length - 1);

const toEncode = ["Lorem", " ", "ipsum"];
const base64 = encodeToBase64(toEncode, keyBuilder.key);    // "nJ4["
const decoded = decodeFromBase64(base64, keyBuilder.key);   // "Lorem ipsum"

console.assert(toEncode.join("") == JSON.stringify(decoded))

console.log(JSON.stringify(keyBuilder.key.decoder));
// [" ",[[[[["dolore",["sint","Ut"]],[["deserunt","commodo"],["id","ex"]]],[[["tempor","veniam,"],["Excepteur","reprehenderit"]],[["sit","elit,"],["Lorem","ipsum"]]]],[[[["mollit","ea"],"ut"],[["exercitation","adipiscing"],["magna","Duis"]]],[[["laboris","labore"],["pariatur.","quis"]],[["non","irure"],["cupidatat","amet,"]]]]],[[[[["est","et"],["nisi","aliquip"]],[["sunt","aute"],["anim","laborum."]]],[[["qui","sed"],["eiusmod","ad"]],[["cillum","eu"],["voluptate","enim"]]]],[[[["nulla","velit"],["fugiat","esse"]],[["occaecat","do"],"dolor"]],[[["ullamco","culpa"],"in"],[[["incididunt","nostrud"],["officia","consequat."]],[["minim","consectetur"],["proident,","aliqua."]]]]]]]]'

````
## Full text
For reference. (Guess which online encyclopedia I copied this text from)
````typescript
const source = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
````