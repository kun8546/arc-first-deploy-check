import { expect } from "chai";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  readDeploymentRecord,
  validateDeploymentRecord,
  writeDeploymentRecord
} from "../src/deployment";
import { validDeployment } from "./fixtures";

describe("deployment metadata", function () {
  it("accepts a complete Arc Testnet deployment record", function () {
    expect(validateDeploymentRecord(validDeployment)).to.deep.equal(
      validDeployment
    );
  });

  it("rejects a record for a different chain", function () {
    expect(() =>
      validateDeploymentRecord({ ...validDeployment, chainId: 1 })
    ).to.throw("chainId must be 5042002");
  });

  it("rejects malformed public identifiers", function () {
    expect(() =>
      validateDeploymentRecord({ ...validDeployment, deployer: "not-address" })
    ).to.throw("deployer must be a valid EVM address");

    expect(() =>
      validateDeploymentRecord({
        ...validDeployment,
        transactionHash: "0x1234"
      })
    ).to.throw("transactionHash must be a 32-byte hash");
  });

  it("rejects invalid block and timestamp values", function () {
    expect(() =>
      validateDeploymentRecord({ ...validDeployment, blockNumber: 0 })
    ).to.throw("blockNumber must be a positive integer");

    expect(() =>
      validateDeploymentRecord({
        ...validDeployment,
        deployedAt: "yesterday"
      })
    ).to.throw("deployedAt must be an ISO timestamp");
  });

  it("writes validated public metadata as formatted JSON", function () {
    const directory = mkdtempSync(join(tmpdir(), "arc-deployment-test-"));
    const outputPath = join(directory, "deployment.json");

    try {
      writeDeploymentRecord(validDeployment, outputPath);
      expect(readFileSync(outputPath, "utf8")).to.equal(
        `${JSON.stringify(validDeployment, null, 2)}\n`
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("explains that deployment must happen before verification", function () {
    const directory = mkdtempSync(join(tmpdir(), "arc-deployment-test-"));
    const missingPath = join(directory, "deployment.json");

    try {
      expect(() => readDeploymentRecord(missingPath)).to.throw(
        "No deployment metadata found. Run npm run deploy first."
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});
