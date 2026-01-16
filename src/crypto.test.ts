import { describe, it, expect } from "vitest"
import { encryptSecret } from "./encrypt"
import { decryptSecret } from "./decrypt"

describe("encrypt/decrypt round-trip", () => {
  it("encrypts and decrypts a secret correctly", async () => {
    const secret = "sk-ant-api03-test-secret-key-12345"
    const password = "mypassword123"

    const encrypted = encryptSecret(secret, password)
    const decrypted = await decryptSecret(password, encrypted)

    expect(decrypted).toBe(secret)
  })

  it("works with various secret lengths", async () => {
    const password = "testpass"
    const secrets = ["a", "short", "a".repeat(100), "a".repeat(1000)]

    for (const secret of secrets) {
      const encrypted = encryptSecret(secret, password)
      const decrypted = await decryptSecret(password, encrypted)
      expect(decrypted).toBe(secret)
    }
  })

  it("works with unicode characters", async () => {
    const secret = "こんにちは世界 🔐 émojis & ñ"
    const password = "пароль123"

    const encrypted = encryptSecret(secret, password)
    const decrypted = await decryptSecret(password, encrypted)

    expect(decrypted).toBe(secret)
  })

  it("generates different ciphertext for same secret (due to random salt/iv)", () => {
    const secret = "test-secret"
    const password = "password"

    const encrypted1 = encryptSecret(secret, password)
    const encrypted2 = encryptSecret(secret, password)

    expect(encrypted1.salt).not.toBe(encrypted2.salt)
    expect(encrypted1.iv).not.toBe(encrypted2.iv)
    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext)
  })
})

describe("decryption errors", () => {
  it("throws on incorrect password", async () => {
    const secret = "test-secret"
    const encrypted = encryptSecret(secret, "correct-password")

    await expect(decryptSecret("wrong-password", encrypted)).rejects.toThrow()
  })

  it("throws on tampered ciphertext", async () => {
    const encrypted = encryptSecret("test-secret", "password")

    // Tamper with ciphertext
    const tamperedCiphertext = "AAAA" + encrypted.ciphertext.slice(4)
    const tampered = { ...encrypted, ciphertext: tamperedCiphertext }

    await expect(decryptSecret("password", tampered)).rejects.toThrow()
  })

  it("throws on tampered salt", async () => {
    const encrypted = encryptSecret("test-secret", "password")

    // Tamper with salt (changes derived key)
    const tamperedSalt = "AAAA" + encrypted.salt.slice(4)
    const tampered = { ...encrypted, salt: tamperedSalt }

    await expect(decryptSecret("password", tampered)).rejects.toThrow()
  })

  it("throws on tampered IV", async () => {
    const encrypted = encryptSecret("test-secret", "password")

    // Tamper with IV
    const tamperedIv = "AAAA" + encrypted.iv.slice(4)
    const tampered = { ...encrypted, iv: tamperedIv }

    await expect(decryptSecret("password", tampered)).rejects.toThrow()
  })
})
