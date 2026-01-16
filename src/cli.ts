import * as fs from "fs"
import * as readline from "readline"
import { encryptSecret } from "./encrypt"

const question = (rl: readline.Interface, prompt: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(prompt, resolve)
  })
}

const readStdin = (): Promise<string | null> => {
  return new Promise(resolve => {
    if (process.stdin.isTTY) {
      resolve(null)
      return
    }

    let data = ""
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", chunk => {
      data += chunk
    })
    process.stdin.on("end", () => {
      resolve(data.trim())
    })
  })
}

const printUsage = () => {
  console.log(`
Usage: easy-api-key [options]

Options:
  -o, --output <file>    Write encrypted data to file (default: stdout)
  -p, --password <pass>  Use this password (otherwise prompts)
  -h, --help             Show this help message

Examples:
  easy-api-key                           # Interactive mode
  easy-api-key -o encrypted.json         # Write to file
  echo "my-secret" | easy-api-key -p pw  # Pipe secret, provide password
`)
}

const parseArgs = (args: string[]) => {
  const result: { output?: string; password?: string; help?: boolean } = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === "-o" || arg === "--output") {
      result.output = args[++i]
    } else if (arg === "-p" || arg === "--password") {
      result.password = args[++i]
    } else if (arg === "-h" || arg === "--help") {
      result.help = true
    }
  }

  return result
}

export const main = async () => {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printUsage()
    process.exit(0)
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    // Get secret from stdin pipe or prompt
    let secret = await readStdin()
    if (!secret) {
      secret = await question(rl, "Enter secret to encrypt: ")
    }

    if (!secret.trim()) {
      console.error("Error: Secret is required")
      process.exit(1)
    }

    // Get password from args or prompt
    let password = args.password
    if (!password) {
      password = await question(rl, "Enter encryption password: ")
    }

    if (!password.trim()) {
      console.error("Error: Password is required")
      process.exit(1)
    }

    if (password.length < 4) {
      console.error("Error: Password must be at least 4 characters")
      process.exit(1)
    }

    const encrypted = encryptSecret(secret.trim(), password.trim())
    const output = JSON.stringify(encrypted, null, 2)

    if (args.output) {
      fs.writeFileSync(args.output, output + "\n")
      console.log(`Encrypted data written to: ${args.output}`)
    } else {
      console.log(output)
    }
  } finally {
    rl.close()
  }
}
