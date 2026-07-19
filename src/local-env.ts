import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { parse } from "dotenv";
import { Wallet } from "ethers";

const PRIVATE_KEY_PATTERN = /^0x[0-9a-fA-F]{64}$/;

export function validatePrivateKey(value: string | undefined): string {
  if (value === undefined || value.trim() === "") {
    throw new Error(
      "PRIVATE_KEY is missing. Run npm run wallet:create before continuing."
    );
  }

  if (!PRIVATE_KEY_PATTERN.test(value)) {
    throw new Error("PRIVATE_KEY must be a 0x-prefixed 32-byte testnet key.");
  }

  return value;
}

export function readPrivateKey(
  environmentPath = resolve(".env.local")
): string {
  if (!existsSync(environmentPath)) {
    throw new Error(
      "No test wallet found. Run npm run wallet:create before continuing."
    );
  }

  const values = parse(readFileSync(environmentPath, "utf8"));
  return validatePrivateKey(values.PRIVATE_KEY);
}

export function createTestWallet(environmentPath = resolve(".env.local")): {
  address: string;
} {
  if (existsSync(environmentPath)) {
    throw new Error(
      "A local wallet already exists. Keep it, or remove .env.local manually if you intentionally want a new test wallet."
    );
  }

  const wallet = Wallet.createRandom();
  mkdirSync(dirname(environmentPath), { recursive: true });
  writeFileSync(environmentPath, `PRIVATE_KEY=${wallet.privateKey}\n`, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600
  });

  return { address: wallet.address };
}
