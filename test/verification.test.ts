import { expect } from "chai";

import { validateDeploymentReceipt } from "../src/verification";
import { validDeployment } from "./fixtures";

const validReceipt = {
  status: 1,
  hash: validDeployment.transactionHash,
  from: validDeployment.deployer,
  contractAddress: validDeployment.contractAddress,
  blockNumber: validDeployment.blockNumber
};

describe("deployment receipt binding", function () {
  it("accepts a receipt that created the recorded contract", function () {
    expect(
      validateDeploymentReceipt(validDeployment, validReceipt)
    ).to.deep.equal(validReceipt);
  });

  it("rejects an unrelated contract creation transaction", function () {
    expect(() =>
      validateDeploymentReceipt(validDeployment, {
        ...validReceipt,
        contractAddress: "0x3333333333333333333333333333333333333333"
      })
    ).to.throw("receipt contract address does not match deployment.json");
  });

  it("rejects a receipt sent by a different deployer", function () {
    expect(() =>
      validateDeploymentReceipt(validDeployment, {
        ...validReceipt,
        from: "0x4444444444444444444444444444444444444444"
      })
    ).to.throw("receipt sender does not match deployment.json");
  });

  it("rejects mismatched transaction and block metadata", function () {
    expect(() =>
      validateDeploymentReceipt(validDeployment, {
        ...validReceipt,
        hash: `0x${"f".repeat(64)}`
      })
    ).to.throw("receipt transaction hash does not match deployment.json");

    expect(() =>
      validateDeploymentReceipt(validDeployment, {
        ...validReceipt,
        blockNumber: validDeployment.blockNumber + 1
      })
    ).to.throw("receipt block number does not match deployment.json");
  });
});
