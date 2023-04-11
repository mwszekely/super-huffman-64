import { base64EncodeMap, base64LeftoverBitsMap } from "./constants.js";
/**
 * Converts an array of bits to a pseudo-base64 string.
 * "Pseudo" because base64 expects 8-bit bytes, and can't natively handle, say, an array of 9 bits.
 * Instead of ending with = or == to indicate the number of padding bits,
 * the characters accessed by leftoverBitsMap[excessBitCount] are used.
 * @param array
 */
export function* bitsToBase64(array) {
    let currentSextet = 0;
    let bitsInSextetSoFar = 0;
    for (let bit of array) {
        currentSextet <<= 1;
        currentSextet |= +bit;
        bitsInSextetSoFar += 1;
        if (bitsInSextetSoFar == 6) {
            yield base64EncodeMap[currentSextet];
            currentSextet = 0;
            bitsInSextetSoFar = 0;
        }
    }
    if (bitsInSextetSoFar) {
        // We need to handle an incomplete sextet at the end.
        // Output a padded sextet along with a trailing character that determines how many bits to chop off.
        let leftover = (6 - bitsInSextetSoFar);
        while (bitsInSextetSoFar < 6) {
            currentSextet <<= 1;
            ++bitsInSextetSoFar;
        }
        yield base64EncodeMap[currentSextet];
        yield base64LeftoverBitsMap[leftover];
    }
}
//# sourceMappingURL=base64-encode.js.map