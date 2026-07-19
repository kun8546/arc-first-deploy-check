import type { DeploymentRecord } from "./deployment";

export interface DeploymentReceiptEvidence {
  status: number | null;
  hash: string;
  from: string;
  contractAddress: string | null;
  blockNumber: number;
}

export function validateDeploymentReceipt<T extends DeploymentReceiptEvidence>(
  deployment: DeploymentRecord,
  receipt: T
): T {
  if (receipt.status !== 1) {
    throw new Error("The deployment transaction receipt was not successful.");
  }

  if (receipt.hash.toLowerCase() !== deployment.transactionHash.toLowerCase()) {
    throw new Error(
      "The receipt transaction hash does not match deployment.json."
    );
  }

  if (
    receipt.contractAddress === null ||
    receipt.contractAddress.toLowerCase() !==
      deployment.contractAddress.toLowerCase()
  ) {
    throw new Error(
      "The receipt contract address does not match deployment.json."
    );
  }

  if (receipt.from.toLowerCase() !== deployment.deployer.toLowerCase()) {
    throw new Error("The receipt sender does not match deployment.json.");
  }

  if (receipt.blockNumber !== deployment.blockNumber) {
    throw new Error("The receipt block number does not match deployment.json.");
  }

  return receipt;
}

export function validateRuntimeBytecode(
  compiledBytecode: string,
  deployedBytecode: string
): void {
  if (compiledBytecode === "0x" || compiledBytecode.length <= 2) {
    throw new Error(
      "Compiled runtime bytecode is missing. Run npm run compile first."
    );
  }

  if (compiledBytecode.toLowerCase() !== deployedBytecode.toLowerCase()) {
    throw new Error(
      "The deployed runtime bytecode does not match the compiled ArcLearningLog contract."
    );
  }
}
