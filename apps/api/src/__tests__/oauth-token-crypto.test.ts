import { before, after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

const TEST_KEY = randomBytes(32).toString("base64");
let originalKey: string | undefined;

before(() => {
  originalKey = process.env.GMAIL_TOKEN_ENCRYPTION_KEY;
  process.env.GMAIL_TOKEN_ENCRYPTION_KEY = TEST_KEY;
});

after(() => {
  process.env.GMAIL_TOKEN_ENCRYPTION_KEY = originalKey;
});

const { encryptToken, decryptToken } = await import("../lib/oauth-token-crypto.js");

describe("encryptToken / decryptToken", () => {
  it("roundtrip: encrypts and decrypts back to original", () => {
    const original = "ya29.access_token_example";
    const encrypted = encryptToken(original);
    assert.ok(encrypted, "encrypted value should be truthy");
    assert.equal(decryptToken(encrypted), original);
  });

  it("each encryption produces a unique ciphertext (random IV)", () => {
    const token = "same-token";
    const a = encryptToken(token);
    const b = encryptToken(token);
    assert.notEqual(a, b, "same input should produce different ciphertexts");
  });

  it("returns null for null input", () => {
    assert.equal(encryptToken(null), null);
    assert.equal(decryptToken(null), null);
  });

  it("returns null for undefined input", () => {
    assert.equal(encryptToken(undefined), null);
    assert.equal(decryptToken(undefined), null);
  });

  it("returns null for empty string", () => {
    assert.equal(encryptToken(""), null);
    assert.equal(decryptToken(""), null);
  });

  it("throws on tampered ciphertext (auth tag mismatch)", () => {
    const encrypted = encryptToken("secret");
    assert.ok(encrypted !== null, "encrypted should not be null");
    const parts = encrypted.split(".");
    const tampered = parts[3]!.split("");
    tampered[0] = tampered[0] === "A" ? "B" : "A";
    const tamperedPayload = [...parts.slice(0, 3), tampered.join("")].join(".");

    assert.throws(() => decryptToken(tamperedPayload));
  });

  it("throws on invalid payload format", () => {
    assert.throws(() => decryptToken("not-a-valid-payload"));
    assert.throws(() => decryptToken("v2.iv.tag.data")); // wrong version
  });
});
