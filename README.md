# Super Huffman 64

Allows for simple compressing/decompressing of data via Huffman encoding to a Base64*-encoded string, array of numbers, etc. In particular, this library's key focus is **encoding arbitrary bit lengths**, even those that don't align to full bytes.

This library is unlicenced into the public domain. If you find anything of worth here, please feel free to take it for yourself.

\* The generated Base64 string isn't *exactly* Base64 (the final character being the giveaway) because of different padding requirements. Base64 turns 8-bit bytes into 6-bit sextets, with 0 to 2 bits leftover as padding as a result. This Base64 turns *any* number of bits into 6-bit sextets, so it may result in a full 0 to 5 bits leftover as padding. 

## Highest level
`encodeToBase64`/`decodeToBase64` and `encodeToBytes`/`encodeFromBytes` are the simplist, highest-level ways to encode/decode data. If you don't ever need to think about the Huffman tree and its nodes and such, this is all you'll need.

The encoder/decoder keys needed by the two aforementioned functions can be quickly made with a `HuffmanKeyBuilder`.  A decoder key is simply a recursive array of arrays (specifically doubles of doubles), and an encoder key is a `Map` of inputs to bits (specifically `Map<string, boolean[]>`).

````typescript
const source = "Lorem ipsum dolor [...]";   // (Full text below)

// Register each character's weight (or count, frequency, etc.)
const keyBuilder = new HuffmanKeyBuilder(source);

// Encode and decode some sample text
const toEncode = "Lorem ipsum dolor sit amet";
const base64 = encodeToBase64(toEncode, keyBuilder.encoder);    // 'V0p98Q8e+7Iym4a0X+g]'
const decoded = decodeFromBase64(base64, keyBuilder.decoder);   // 'Lorem ipsum dolor sit amet'

console.assert(toEncode == decoded);

// A decoder key is just a recursive array of arrays
// and is very easy to serialize and pass around.
console.log(JSON.stringify(keyBuilder.decoder));
// '[[[[[[",",[["D","h"],"b"]],"p"],"l"],"i"],[["r",[["q",["f",["E",["L","U"]]]],[["g","v"],["x","."]]]],["n","u"]]],[[["a","o"],["t",["c","m"]]],[" ",[["s","d"],"e"]]]]'
````

As a result, while normal Base64 simply needs to indicate 1 bit of padding (=) or 2 bits of padding (==), this Base64 needs 5 different indicators (+=$#%).

## Encoding other things
You don't have to encode just single characters in strings. Because these functions all accept generic `Iterable` objects, you can pass in anything you can make a dictionary for.  You could encode a paragraph word by word, for example (assuming it contains a lot of repeating text).

````typescript
// Same example as above, but encode words instead of letters.
// (The "Lorem ipsum" text doesn't really contain a lot of
// repeating words, but we'll pretend)
const source = "Lorem ipsum dolor [...]".split(" ");
const keyBuilder = new HuffmanKeyBuilder(source);
keyBuilder.add(" ", source.length - 1);

const toEncode = ["Lorem", " ", "ipsum"];
const base64 = encodeToBase64(toEncode, keyBuilder.encoder);    // "nJ4["
const decoded = decodeFromBase64(base64, keyBuilder.decoder);   // "Lorem ipsum"

console.assert(toEncode.join("") == JSON.stringify(decoded))

console.log(JSON.stringify(keyBuilder.key.decoder));
// [" ",[[[[["dolore",["sint","Ut"]],[["deserunt","commodo"],["id","ex"]]],[[["tempor","veniam,"],["Excepteur","reprehenderit"]],[["sit","elit,"],["Lorem","ipsum"]]]],[[[["mollit","ea"],"ut"],[["exercitation","adipiscing"],["magna","Duis"]]],[[["laboris","labore"],["pariatur.","quis"]],[["non","irure"],["cupidatat","amet,"]]]]],[[[[["est","et"],["nisi","aliquip"]],[["sunt","aute"],["anim","laborum."]]],[[["qui","sed"],["eiusmod","ad"]],[["cillum","eu"],["voluptate","enim"]]]],[[[["nulla","velit"],["fugiat","esse"]],[["occaecat","do"],"dolor"]],[[["ullamco","culpa"],"in"],[[["incididunt","nostrud"],["officia","consequat."]],[["minim","consectetur"],["proident,","aliqua."]]]]]]]]'

````

## Lower level
If you need the lower-level compression functions without conversion to Base64, lower-level functions are also made available.  They take `Iterable` streams of characters/bits and, as generator functions, return their results bit by bit or character by character.
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

## Full text
For reference for the above examples. (Guess which free encyclopedia that anyone can edit supplied this text)
````typescript
const source = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
````
