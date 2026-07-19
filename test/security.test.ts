import { expect } from "chai";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

import {
  containsLikelyPrivateKey,
  findUnsafeTrackedFiles
} from "../src/security";

describe("repository secret checks", function () {
  it("detects a private key assignment", function () {
    const secret = `PRIVATE_KEY=0x${"a".repeat(64)}`;

    expect(containsLikelyPrivateKey(secret)).to.equal(true);
  });

  it("does not confuse public addresses or transaction hashes for keys", function () {
    const publicEvidence = [
      "contract=0x1111111111111111111111111111111111111111",
      `transactionHash=0x${"b".repeat(64)}`
    ].join("\n");

    expect(containsLikelyPrivateKey(publicEvidence)).to.equal(false);
  });

  it("reports unsafe file names without returning their contents", function () {
    const directory = mkdtempSync(join(tmpdir(), "arc-security-test-"));
    const sourceDirectory = join(directory, "src");
    const secret = `PRIVATE_KEY=0x${"c".repeat(64)}`;

    try {
      execFileSync("git", ["init"], { cwd: directory, stdio: "ignore" });
      mkdirSync(sourceDirectory);
      writeFileSync(join(directory, ".env.local"), `${secret}\n`, "utf8");
      writeFileSync(
        join(sourceDirectory, "unsafe.ts"),
        `const value = "${secret}";\n`,
        "utf8"
      );
      writeFileSync(
        join(sourceDirectory, "safe.ts"),
        `const address = "0x${"d".repeat(40)}";\n`,
        "utf8"
      );
      execFileSync(
        "git",
        ["add", "-f", ".env.local", "src/unsafe.ts", "src/safe.ts"],
        { cwd: directory, stdio: "ignore" }
      );

      const unsafeFiles = findUnsafeTrackedFiles(directory);

      expect(unsafeFiles).to.have.members([".env.local", "src/unsafe.ts"]);
      expect(unsafeFiles.join("\n")).not.to.include(secret);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
