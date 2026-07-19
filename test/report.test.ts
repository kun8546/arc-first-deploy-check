import { expect } from "chai";

import { renderDeploymentReport } from "../src/report";
import { validDeployment } from "./fixtures";


describe("deployment verification report", function () {
  it("renders public evidence and every successful check", function () {
    const report = renderDeploymentReport({
      deployment: validDeployment,
      receiptSucceeded: true,
      bytecodePresent: true,
      owner: validDeployment.deployer,
      ownerMatches: true,
      message: validDeployment.initialMessage,
      messageMatches: true,
      updatedAt: 1_721_386_800n
    });

    expect(report).to.include("# Arc Testnet Deployment Verification");
    expect(report).to.include("**Overall result:** PASS");
    expect(report).to.include(validDeployment.transactionUrl);
    expect(report).to.include(validDeployment.contractUrl);
    expect(report).to.include("- [x] Transaction receipt succeeded");
    expect(report).to.include("- [x] Contract bytecode exists");
    expect(report).to.include("- [x] Onchain owner matches the deployer");
    expect(report).to.include("- [x] Onchain message matches the deployment");
    expect(report).to.include(validDeployment.initialMessage);
  });

  it("refuses to render a passing report when a check failed", function () {
    expect(() =>
      renderDeploymentReport({
        deployment: validDeployment,
        receiptSucceeded: true,
        bytecodePresent: false,
        owner: validDeployment.deployer,
        ownerMatches: true,
        message: validDeployment.initialMessage,
        messageMatches: true,
        updatedAt: 1_721_386_800n
      })
    ).to.throw("Cannot generate a PASS report");
  });
});
