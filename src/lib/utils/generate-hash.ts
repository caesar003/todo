import * as crypto from "crypto";

export default function generateHash() {
  return crypto
    .createHash("sha1")
    .update(Date.now().toString() + Math.random())
    .digest("hex");
}
