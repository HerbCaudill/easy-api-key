# CLAUDE.md

## Overview

`@herbcaudill/easy-api-key` is a package for password-encrypting API keys and secrets so they can be bundled with an app and decrypted at runtime in the browser.

## Commands

```bash
pnpm build      # Build with tsup (ESM + CJS)
pnpm test       # Run Vitest tests
pnpm format     # Format with Prettier
```

## Architecture

- **`src/decrypt.ts`** - Browser-side decryption using Web Crypto API
- **`src/encrypt.ts`** - Node-side encryption using built-in `crypto` module
- **`src/cli.ts`** - CLI tool for encrypting secrets
- **`src/index.ts`** - Browser-safe exports (decryption only)
- **`src/node.ts`** - Node.js exports (encryption + decryption)

## Crypto Details

- **Algorithm**: AES-256-GCM (authenticated encryption)
- **Key derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Salt**: 16 bytes (128 bits), random per encryption
- **IV**: 12 bytes (96 bits), random per encryption
