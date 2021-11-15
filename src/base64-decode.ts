import { base64DecodeMap, base64LeftoverBitsMap } from "./constants";


/**
 * Given a pseudo-base64 string, returns a stream of the bits that originally encoded it.
 * @see bitsToBase64 for why this handles *pseudo*-base64 strings.
 * @param original 
 */
export function* base64ToBits(original: Iterable<string>): Generator<boolean> {

    // We can't immediately output a sextet once we decode a character
    // because if the next character is the final padding character, we might need to remove some bits.
    let previousSextet: boolean[] | null = null;

    for (let ch of original) {
        let sextet = base64DecodeMap[ch as keyof typeof base64DecodeMap];
        if (sextet != undefined) {

            if (previousSextet) {
                for (let b of previousSextet) {
                    yield b;
                }
            }

            previousSextet = sextet.slice();
        }
        else {
            console.assert(previousSextet != null);

            if (previousSextet) {

                let leftoverBits = base64LeftoverBitsMap.indexOf(ch)!;
                while (leftoverBits) {
                    previousSextet.pop();
                    --leftoverBits;
                }

                // This should be the last iteration of the loop, so we'll fall out and add those bits then.
            }
        }

    }


    if (previousSextet) {
        for (let b of previousSextet) {
            yield b;
        }
    }
}