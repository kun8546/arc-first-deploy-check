import { expect } from "chai";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Wallet } from "ethers";

import {
  buildWindowsWalletAclArguments,
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

  it("builds a Windows ACL that removes inheritance and grants one user", function () {
    expect(
      buildWindowsWalletAclArguments(
        "C:\\project\\.env.local",
        "DESKTOP\\student"
      )
    ).to.deep.equal([
      "C:\\project\\.env.local",
      "/inheritance:r",
      "/grant:r",
      "DESKTOP\\student:(F)"
    ]);
  });

  it("removes the wallet file if local permission protection fails", function () {
    expect(() =>
      createTestWallet(environmentPath, () => {
        throw new Error("simulated ACL failure");
      })
    ).to.throw("Could not secure the local wallet file");

    expect(existsSync(environmentPath)).to.equal(false);
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
