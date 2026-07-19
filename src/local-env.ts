import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { userInfo } from "node:os";
import { dirname, resolve } from "node:path";

import { parse } from "dotenv";
import { Wallet } from "ethers";

const PRIVATE_KEY_PATTERN = /^0x[0-9a-fA-F]{64}$/;

export function buildWindowsWalletAclArguments(
  filePath: string,
  identity: string
): string[] {
  return [filePath, "/inheritance:r", "/grant:r", `${identity}:(F)`];
}

function protectWalletFile(filePath: string): void {
  if (process.platform !== "win32") {
    return;
  }

  const username = process.env.USERNAME ?? userInfo().username;
  const identity = process.env.USERDOMAIN
    ? `${process.env.USERDOMAIN}\\${username}`
    : username;

  execFileSync("icacls", buildWindowsWalletAclArguments(filePath, identity), {
    stdio: "ignore"
  });
}

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

export function createTestWallet(
  environmentPath = resolve(".env.local"),
  protectFile: (filePath: string) => void = protectWalletFile
): {
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
  try {
    protectFile(environmentPath);
  } catch (error: unknown) {
    rmSync(environmentPath, { force: true });
    throw new Error(
      "Could not secure the local wallet file, so it was removed. Check Windows file permissions and run npm run wallet:create again.",
      { cause: error }
    );
  }

  return { address: wallet.address };
}
