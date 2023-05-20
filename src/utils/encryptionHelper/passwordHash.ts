import { createHash } from "crypto";

function encode(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function verify(text: string, hash: string): boolean {
  return encode(text) === hash;
}

const passwordHash = {
  encode,
  verify,
};

export default passwordHash;
