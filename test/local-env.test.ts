import { expect } from "chai";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Wallet } from "ethers";

import {
  createTestWallet,
  readPrivateKey,
  validatePrivateKey
} from "../src/local-env";

describe("local test wallet storage", function () {
  let temporaryDirectory: string;
  let environmentPath: string;

  beforeEach(function () {
    temporaryDirectory = mkdtempSync(join(tmpdir(), "arc-wallet-test-"));
    environmentPath = join(temporaryDirectory, ".env.local");
  });

  afterEach(function () {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it("creates a wallet file and returns only its public address", function () {
    const result = createTestWallet(environmentPath);
    const content = readFileSync(environmentPath, "utf8");
    const privateKey = content.trim().replace("PRIVATE_KEY=", "");

    expect(result).to.deep.equal({
      address: new Wallet(privateKey).address
    });
    expect(content).to.match(/^PRIVATE_KEY=0x[0-9a-fA-F]{64}\r?\n$/);
  });

  it("does not overwrite an existing local wallet", function () {
    writeFileSync(environmentPath, "PRIVATE_KEY=keep-this-file\n", "utf8");

    expect(() => createTestWallet(environmentPath)).to.throw(
      "A local wallet already exists"
    );
    expect(readFileSync(environmentPath, "utf8")).to.equal(
      "PRIVATE_KEY=keep-this-file\n"
    );
  });

  it("reads a valid private key from the local environment file", function () {
    const wallet = Wallet.createRandom();
    writeFileSync(
      environmentPath,
      `PRIVATE_KEY=${wallet.privateKey}\n`,
      "utf8"
    );

    expect(readPrivateKey(environmentPath)).to.equal(wallet.privateKey);
  });

  it("rejects missing or malformed private keys", function () {
    expect(() => validatePrivateKey(undefined)).to.throw(
      "PRIVATE_KEY is missing"
    );
    expect(() => validatePrivateKey("0x1234")).to.throw(
      "PRIVATE_KEY must be a 0x-prefixed 32-byte testnet key"
    );
  });
});
