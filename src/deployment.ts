import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { isAddress, isHexString } from "ethers";

import { ARC_TESTNET } from "./arc";

export const INITIAL_MESSAGE =
  "Learning Arc by testing a real deployment.";

export interface DeploymentRecord {
  network: "Arc Testnet";
  chainId: 5042002;
  deployer: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  deployedAt: string;
  initialMessage: string;
  transactionUrl: string;
  contractUrl: string;
}

function requireObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Deployment metadata must be a JSON object.");
  }

  return value as Record<string, unknown>;
}

function requireString(
  record: Record<string, unknown>,
  field: string
): string {
  const value = record[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${field} must be a non-empty string.`);
  }

  return value;
}

export function validateDeploymentRecord(value: unknown): DeploymentRecord {
  const record = requireObject(value);

  if (record.network !== ARC_TESTNET.name) {
    throw new Error(`network must be "${ARC_TESTNET.name}".`);
  }

  if (record.chainId !== Number(ARC_TESTNET.chainId)) {
    throw new Error(`chainId must be ${ARC_TESTNET.chainId}.`);
  }

  const deployer = requireString(record, "deployer");
  if (!isAddress(deployer)) {
    throw new Error("deployer must be a valid EVM address.");
  }

  const contractAddress = requireString(record, "contractAddress");
  if (!isAddress(contractAddress)) {
    throw new Error("contractAddress must be a valid EVM address.");
  }

  const transactionHash = requireString(record, "transactionHash");
  if (!isHexString(transactionHash, 32)) {
    throw new Error("transactionHash must be a 32-byte hash.");
  }

  const blockNumber = record.blockNumber;
  if (!Number.isInteger(blockNumber) || Number(blockNumber) <= 0) {
    throw new Error("blockNumber must be a positive integer.");
  }

  const deployedAt = requireString(record, "deployedAt");
  const parsedDate = new Date(deployedAt);
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString() !== deployedAt
  ) {
    throw new Error("deployedAt must be an ISO timestamp.");
  }

  const initialMessage = requireString(record, "initialMessage");
  const transactionUrl = requireString(record, "transactionUrl");
  const contractUrl = requireString(record, "contractUrl");

  const expectedTransactionUrl = `${ARC_TESTNET.explorerUrl}/tx/${transactionHash}`;
  if (transactionUrl !== expectedTransactionUrl) {
    throw new Error(
      `transactionUrl must be ${expectedTransactionUrl}.`
    );
  }

  const expectedContractUrl = `${ARC_TESTNET.explorerUrl}/address/${contractAddress}`;
  if (contractUrl !== expectedContractUrl) {
    throw new Error(`contractUrl must be ${expectedContractUrl}.`);
  }

  return {
    network: ARC_TESTNET.name,
    chainId: 5_042_002,
    deployer,
    contractAddress,
    transactionHash,
    blockNumber: Number(blockNumber),
    deployedAt,
    initialMessage,
    transactionUrl,
    contractUrl
  };
}

export function readDeploymentRecord(
  inputPath = resolve("deployment.json")
): DeploymentRecord {
  const parsed: unknown = JSON.parse(readFileSync(inputPath, "utf8"));
  return validateDeploymentRecord(parsed);
}

export function writeDeploymentRecord(
  record: DeploymentRecord,
  outputPath = resolve("deployment.json")
): void {
  const validated = validateDeploymentRecord(record);
  writeFileSync(outputPath, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
}
