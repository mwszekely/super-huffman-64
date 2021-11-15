
import { base64ToBits } from "./base64-decode";
import { bitsToBase64 } from "./base64-encode";
import { HuffmanKeyBuilder, decodeFromBase64, encodeToBase64 } from ".";
import { base64LeftoverBitsMap } from "./constants";

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

test("Keys reference characters they were built with", () => {
    let keyBuilder = new HuffmanKeyBuilder();
    keyBuilder.add("a");
    expect(keyBuilder.encoder.get("a")).not.toBeUndefined();
    expect(keyBuilder.encoder.get("b")).toBeUndefined();
    expect(keyBuilder.decoder).toBe("a");

    keyBuilder.add("b");
    expect(keyBuilder.encoder.get("a")).not.toBeUndefined();
    expect(keyBuilder.encoder.get("b")).not.toBeUndefined();
    expect(keyBuilder.decoder).toEqual(expect.arrayContaining(["a", "b"]));

});




test("Encoding/decoding natural language to Huffman & base64 gives the same result", () => {

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

        expect(binary).toStrictEqual(bits);
    }

});
