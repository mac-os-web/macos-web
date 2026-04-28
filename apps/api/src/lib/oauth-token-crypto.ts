import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

let _key: Buffer | null = null;

function tokenKey(): Buffer {
  if (_key) return _key;
  const decoded = Buffer.from(process.env.GMAIL_TOKEN_ENCRYPTION_KEY ?? "", "base64");
  if (decoded.length !== 32) {
    throw new Error("GMAIL_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  }
  _key = decoded;
  return _key;
}

export function encryptToken(token: string | null | undefined): string | null {
  if (!token) return null;

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", tokenKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `v1.${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptToken(payload: string | null | undefined): string | null {
  if (!payload) return null;

  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") {
    throw new Error("Invalid encrypted token payload");
  }

  const iv = Buffer.from(parts[1]!, "base64");
  const tag = Buffer.from(parts[2]!, "base64");
  const encrypted = Buffer.from(parts[3]!, "base64");

  const decipher = createDecipheriv("aes-256-gcm", tokenKey(), iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return out.toString("utf8");
}
