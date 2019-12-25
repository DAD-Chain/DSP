import * as base58 from 'base-58';
import * as cryptoJS from 'crypto-js';

export function sha256(data) {
    const hex = cryptoJS.enc.Hex.parse(data);
    const sha = cryptoJS.SHA256(hex).toString();
    return sha;
}
/**
 * Turn array buffer into hex string
 * @param arr Array like value
 */
export function ab2hexstring(arr) {
    let result = '';
    const uint8Arr = new Uint8Array(arr);
    for (let i = 0; i < uint8Arr.byteLength; i++) {
        let str = uint8Arr[i].toString(16);
        str = str.length === 0
            ? '00'
            : str.length === 1
                ? '0' + str
                : str;
        result += str;
    }
    return result;
}

export const ADDR_VERSION = '17';

/**
 *
 * @param programhash
 */
function hexToBase58(hexEncoded) {
    const data = ADDR_VERSION + hexEncoded;

    const hash = sha256(data);
    const hash2 = sha256(hash);
    const checksum = hash2.slice(0, 8);

    const datas = data + checksum;

    return base58.encode(new Buffer(datas, 'hex'));
}

export function base58ToHex(base58Encoded) {
    const decoded = base58.decode(base58Encoded);
    const hexEncoded = ab2hexstring(decoded).substr(2, 40);

    if (base58Encoded !== hexToBase58(hexEncoded)) {
        return false;
    }
    return true;
}