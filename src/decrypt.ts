const ITERATIONS = 100_000
const KEY_LENGTH = 32 // 256 bits for AES-256

export type EncryptedData = {
  salt: string
  iv: string
  ciphertext: string
}

const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH * 8 },
    false,
    ["decrypt"],
  )
}

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Decrypts an encrypted secret using the provided password.
 *
 * @param password - The password used to encrypt the secret
 * @param encryptedData - The encrypted data object containing salt, iv, and ciphertext
 * @returns The decrypted secret string
 * @throws If the password is incorrect or the data is corrupted
 */
export const decryptSecret = async (
  password: string,
  encryptedData: EncryptedData,
): Promise<string> => {
  const salt = base64ToUint8Array(encryptedData.salt)
  const iv = base64ToUint8Array(encryptedData.iv)
  const ciphertextWithTag = base64ToUint8Array(encryptedData.ciphertext)

  const key = await deriveKey(password, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertextWithTag as BufferSource,
  )

  return new TextDecoder().decode(decrypted)
}
