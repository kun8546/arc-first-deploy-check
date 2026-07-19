import { formatUnits } from "ethers";
import { ethers } from "hardhat";

import { ARC_TESTNET, assertArcChain } from "../src/arc";
import {
  INITIAL_MESSAGE,
  type DeploymentRecord,
  writeDeploymentRecord
} from "../src/deployment";
import { formatCliError } from "../src/errors";

async function main(): Promise<void> {
  if (process.env.CONFIRM_ARC_TESTNET_DEPLOY !== "yes") {
    throw new Error(
      'Deployment is locked. In PowerShell, set $env:CONFIRM_ARC_TESTNET_DEPLOY="yes" and run npm run deploy again.'
    );
  }

  const network = await ethers.provider.getNetwork();
  assertArcChain(network.chainId);

  const [deployer] = await ethers.getSigners();
  if (deployer === undefined) {
    throw new Error(
      "No test wallet is configured. Run npm run wallet:create first."
    );
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  if (balance === 0n) {
    throw new Error(
      `The test wallet has no Arc Testnet USDC. Request funds at ${ARC_TESTNET.faucetUrl}.`
    );
  }

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${formatUnits(balance, 18)} testnet USDC`);

  const factory = await ethers.getContractFactory("ArcLearningLog", deployer);
  const contract = await factory.deploy(INITIAL_MESSAGE);
  const transaction = contract.deploymentTransaction();

  if (transaction === null) {
    throw new Error("Hardhat did not return a deployment transaction.");
  }

  console.log(`Transaction submitted: ${transaction.hash}`);
  const receipt = await transaction.wait(1);
  if (receipt === null || receipt.status !== 1) {
    throw new Error("The deployment transaction did not succeed.");
  }

  const contractAddress = await contract.getAddress();
  const block = await ethers.provider.getBlock(receipt.blockNumber);
  if (block === null) {
    throw new Error("The deployment block could not be loaded.");
  }

  const record: DeploymentRecord = {
    network: ARC_TESTNET.name,
    chainId: 5_042_002,
    deployer: deployer.address,
    contractAddress,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    deployedAt: new Date(block.timestamp * 1_000).toISOString(),
    initialMessage: INITIAL_MESSAGE,
    transactionUrl: `${ARC_TESTNET.explorerUrl}/tx/${receipt.hash}`,
    contractUrl: `${ARC_TESTNET.explorerUrl}/address/${contractAddress}`
  };

  writeDeploymentRecord(record);

  console.log(`Contract deployed: ${contractAddress}`);
  console.log(`Explorer: ${record.transactionUrl}`);
  console.log("Public metadata saved to deployment.json.");
}

main().catch((error: unknown) => {
  console.error(formatCliError(error, "Deployment"));
  process.exitCode = 1;
});
