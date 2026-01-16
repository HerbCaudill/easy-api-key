import * as crypto from "crypto"
import type { EncryptedData } from "./decrypt"

const ITERATIONS = 100_000
const KEY_LENGTH = 32 // 256 bits for AES-256
const SALT_LENGTH = 16
const IV_LENGTH = 12 // 96 bits for GCM

const deriveKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256")
}

/**
 * Encrypts a secret using the provided password.
 *
 * @param plaintext - The secret to encrypt
 * @param password - The password to use for encryption
 * @returns The encrypted data object containing salt, iv, and ciphertext (all base64 encoded)
 */
export const encryptSecret = (plaintext: string, password: string): EncryptedData => {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  const key = deriveKey(password, salt)

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  // Append auth tag to ciphertext (GCM standard practice)
  const ciphertextWithTag = Buffer.concat([encrypted, authTag])

  return {
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    ciphertext: ciphertextWithTag.toString("base64"),
  }
}
