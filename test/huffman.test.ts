import { test, expect } from '@playwright/test';
import { HuffmanKeyBuilder, base64ToBits, bitsToBase64, decodeFromBase64, decodeFromBytes, encodeToBase64, encodeToBytes } from "../dist/index.js";

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

test("Keys reference characters they were built with", async ({page}) => {
    let keyBuilder = new HuffmanKeyBuilder();
    keyBuilder.add("a");
    expect(keyBuilder.encoder.get("a")).toBeInstanceOf(Array);
    expect(keyBuilder.encoder.get("b")).toBeUndefined();
    expect(keyBuilder.decoder).toStrictEqual("a")

    keyBuilder.add("b");
    expect(keyBuilder.encoder.get("a")).toBeInstanceOf(Array);
    expect(keyBuilder.encoder.get("b")).toBeInstanceOf(Array);
    expect(keyBuilder.decoder).toStrictEqual(["a", "b"]);

});

test("Encoding/decoding natural language to Huffman & base64 gives the same result", async ({page, }) => {

    for (let stringLength = 1; stringLength < 256; stringLength *= 2) {
        let keyBuilder = new HuffmanKeyBuilder();

        for (let c of lorem) {
            keyBuilder.add(c);
        }

        for (let i = 0; i < 256; ++i) {
            keyBuilder.add(String.fromCodePoint(i), 0.0001);
        }


        let preEncoded = lorem.substr(0, stringLength);
        while (preEncoded.length < stringLength)
            preEncoded += String.fromCodePoint(Math.floor(Math.random() * 255));

        const base64 = encodeToBase64(preEncoded, keyBuilder.encoder);
        const decoded = decodeFromBase64(base64, keyBuilder.decoder);

        expect(preEncoded).toEqual(decoded);
    }
});

test("Pseudo-base64 encodes and decodes properly (1 - 16 bits, 0 - 0xFFFF each time)", () => {
    for (let length = 1; length < 16; ++length) {
        const max = 2 ** length;
        let binary: boolean[] = [];

        for (let i = 0; i < max; ++i) {

            for (let bitPos = 0; bitPos < length; ++bitPos) {
                binary.push((i & (1 << bitPos)) != 0);
            }
        }

        const base64 = Array.from(bitsToBase64(binary)).join("");
        const bits = Array.from(base64ToBits(base64));

        expect(binary).toEqual(bits);
    }
});

test("encodeToBytes and decodeFromBytes both function as expected", () => {
    let keyBuilder = new HuffmanKeyBuilder();

    for (let c of lorem) {
        keyBuilder.add(c);
    }

    for (let i = 0; i < 256; ++i) {
        keyBuilder.add(String.fromCodePoint(i), 0.0001);
    }

    const input = lorem.repeat(5);
    const bytes = Array.from(encodeToBytes(input, keyBuilder.encoder));
    const debytes = Array.from(decodeFromBytes(bytes.map(b => b.byte), (bytes.at(-1)?.leftoverBits) || 0, keyBuilder.decoder)).join("");

    expect(debytes).toEqual(input);

});
