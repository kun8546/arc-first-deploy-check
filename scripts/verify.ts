import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { Contract, JsonRpcProvider } from "ethers";

import { ARC_TESTNET, assertArcChain } from "../src/arc";
import { readDeploymentRecord } from "../src/deployment";
import { formatCliError } from "../src/errors";
import { renderDeploymentReport } from "../src/report";
import {
  validateDeploymentReceipt,
  validateRuntimeBytecode
} from "../src/verification";

const ARC_LEARNING_LOG_ABI = [
  "function owner() view returns (address)",
  "function message() view returns (string)",
  "function updatedAt() view returns (uint256)"
] as const;
const ARTIFACT_PATH = resolve(
  "artifacts/contracts/ArcLearningLog.sol/ArcLearningLog.json"
);

function readCompiledRuntimeBytecode(): string {
  const artifact: unknown = JSON.parse(readFileSync(ARTIFACT_PATH, "utf8"));
  if (
    typeof artifact !== "object" ||
    artifact === null ||
    !("deployedBytecode" in artifact) ||
    typeof artifact.deployedBytecode !== "string"
  ) {
    throw new Error(
      "ArcLearningLog artifact is invalid. Run npm run compile first."
    );
  }

  return artifact.deployedBytecode;
}

async function main(): Promise<void> {
  const deployment = readDeploymentRecord();
  const provider = new JsonRpcProvider(ARC_TESTNET.rpcUrl);
  const network = await provider.getNetwork();
  assertArcChain(network.chainId);

  const receipt = await provider.getTransactionReceipt(
    deployment.transactionHash
  );
  if (receipt === null) {
    throw new Error("The deployment transaction receipt was not found.");
  }
  validateDeploymentReceipt(deployment, receipt);

  const code = await provider.getCode(deployment.contractAddress);
  validateRuntimeBytecode(readCompiledRuntimeBytecode(), code);
  const contract = new Contract(
    deployment.contractAddress,
    ARC_LEARNING_LOG_ABI,
    provider
  );

  const [owner, message, updatedAt] = (await Promise.all([
    contract.owner(),
    contract.message(),
    contract.updatedAt()
  ])) as [string, string, bigint];

  const result = {
    deployment,
    receiptSucceeded: receipt.status === 1,
    receiptMatchesTransaction:
      receipt.hash.toLowerCase() === deployment.transactionHash.toLowerCase(),
    receiptCreatedContract:
      receipt.contractAddress?.toLowerCase() ===
      deployment.contractAddress.toLowerCase(),
    receiptSentByDeployer:
      receipt.from.toLowerCase() === deployment.deployer.toLowerCase(),
    receiptMatchesBlock: receipt.blockNumber === deployment.blockNumber,
    runtimeBytecodeMatches: true,
    bytecodePresent: code !== "0x",
    owner,
    ownerMatches: owner.toLowerCase() === deployment.deployer.toLowerCase(),
    message,
    messageMatches: message === deployment.initialMessage,
    updatedAt
  };

  const failedChecks = [
    ["transaction receipt", result.receiptSucceeded],
    ["contract bytecode", result.bytecodePresent],
    ["contract owner", result.ownerMatches],
    ["contract message", result.messageMatches],
    ["update timestamp", result.updatedAt > 0n]
  ]
    .filter(([, passed]) => !passed)
    .map(([name]) => name);

  if (failedChecks.length > 0) {
    throw new Error(`Onchain verification failed: ${failedChecks.join(", ")}.`);
  }

  const report = renderDeploymentReport(result);
  writeFileSync(resolve("deployment-report.md"), report, "utf8");

  console.log("Onchain verification passed.");
  console.log("Public report saved to deployment-report.md.");
}

main().catch((error: unknown) => {
  console.error(formatCliError(error, "Verification"));
  process.exitCode = 1;
});
