import crypto from "node:crypto";

// Uso: node scripts/totp.mjs <BASE32_SECRET> [offsetSeconds]
// Apenas operação local; não é usado pelo runtime do produto.

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const secret = (process.argv[2] ?? "").toUpperCase().replace(/=|\s/g, "");
const offset = Number(process.argv[3] ?? 0);

if (!secret) {
  console.error("Informe o segredo Base32.");
  process.exit(1);
}

let buffer = 0;
let bits = 0;
const key = [];
for (const char of secret) {
  const value = alphabet.indexOf(char);
  if (value < 0) {
    console.error("Segredo Base32 inválido.");
    process.exit(1);
  }
  buffer = (buffer << 5) | value;
  bits += 5;
  if (bits >= 8) {
    key.push((buffer >> (bits - 8)) & 0xff);
    bits -= 8;
  }
}

const counter = Math.floor((Date.now() + offset * 1000) / 30000);
const message = Buffer.alloc(8);
message.writeBigUInt64BE(BigInt(counter));
const digest = crypto.createHmac("sha1", Buffer.from(key)).update(message).digest();
const offsetBits = digest[digest.length - 1] & 0x0f;
const binary =
  ((digest[offsetBits] & 0x7f) << 24) |
  ((digest[offsetBits + 1] & 0xff) << 16) |
  ((digest[offsetBits + 2] & 0xff) << 8) |
  (digest[offsetBits + 3] & 0xff);
console.log(String(binary % 1_000_000).padStart(6, "0"));
