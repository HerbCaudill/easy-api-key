# @herbcaudill/easy-api-key

Password-encrypt API keys and secrets for bundling with your app. Decryption happens entirely in the browser using the Web Crypto API.

## Use case

You want to ship an app that needs an API key, but you don't want to:

- Expose the raw API key in your source code
- Set up a backend proxy just to hide the key
- Require users to obtain their own API key

With this package, you encrypt your API key with a password, bundle the encrypted data with your app, and users enter the password to decrypt it at runtime.

## Installation

```bash
pnpm add @herbcaudill/easy-api-key
```

## Usage

### 1. Encrypt your secret

Use the CLI to encrypt your API key:

```bash
# Interactive mode
npx easy-api-key -o src/encrypted-key.json

# Or pipe the secret
echo "sk-ant-api03-xxx" | npx easy-api-key -p mypassword -o src/encrypted-key.json
```

This creates a JSON file like:

```json
{
  "salt": "base64...",
  "iv": "base64...",
  "ciphertext": "base64..."
}
```

### 2. Decrypt in your app

```typescript
import { decryptSecret, type EncryptedData } from "@herbcaudill/easy-api-key"
import encryptedKey from "./encrypted-key.json"

const apiKey = await decryptSecret(password, encryptedKey as EncryptedData)
```

### Programmatic encryption (Node.js)

```typescript
import { encryptSecret } from "@herbcaudill/easy-api-key/node"
import fs from "fs"

const encrypted = encryptSecret("my-api-key", "password123")
fs.writeFileSync("encrypted.json", JSON.stringify(encrypted, null, 2))
```

## CLI options

```
Usage: easy-api-key [options]

Options:
  -o, --output <file>    Write encrypted data to file (default: stdout)
  -p, --password <pass>  Use this password (otherwise prompts)
  -h, --help             Show this help message
```

## Security

- **Encryption**: AES-256-GCM (authenticated encryption)
- **Key derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **No server required**: Decryption happens entirely in the browser using the Web Crypto API

The encrypted data is safe to commit to your repo. Without the password, the secret cannot be recovered.

**Note**: Once decrypted, your app will typically store the API key in memory or localStorage for the session. Consider the security implications for your specific use case.

## Bundler configuration

The encrypted JSON file needs to be importable. Most bundlers (Vite, webpack, etc.) support JSON imports out of the box.

For TypeScript, you may need to add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

## License

MIT
