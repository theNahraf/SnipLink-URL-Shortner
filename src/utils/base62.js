/**
 * Base62 Encoder/Decoder
 * 
 * Converts BigInt IDs to short, URL-safe strings using charset:
 * 0-9, a-z, A-Z (62 characters)
 * 
 * A 64-bit Snowflake ID typically encodes to 6-8 characters.
 */

const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(CHARSET.length); // 62n

/**
 * Encode a BigInt (or number/string) to a Base62 string
 * @param {BigInt|number|string} num 
 * @returns {string}
 */
function encode(num) {
  let n = BigInt(num);
  if (n === 0n) return CHARSET[0];

  let result = '';
  while (n > 0n) {
    result = CHARSET[Number(n % BASE)] + result;
    n = n / BASE;
  }
  return result;
}

/**
 * Decode a Base62 string back to a BigInt
 * @param {string} str 
 * @returns {BigInt}
 */
function decode(str) {
  let result = 0n;
  for (const char of str) {
    const index = CHARSET.indexOf(char);
    if (index === -1) throw new Error(`Invalid Base62 character: ${char}`);
    result = result * BASE + BigInt(index);
  }
  return result;
}

module.exports = { encode, decode };
