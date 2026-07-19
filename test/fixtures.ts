import type { DeploymentRecord } from "../src/deployment";

export const validDeployment: DeploymentRecord = {
  network: "Arc Testnet",
  chainId: 5_042_002,
  deployer: "0x1111111111111111111111111111111111111111",
  contractAddress: "0x2222222222222222222222222222222222222222",
  transactionHash:
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  blockNumber: 12_345,
  deployedAt: "2026-07-19T10:00:00.000Z",
  initialMessage: "Learning Arc by testing a real deployment.",
  transactionUrl:
    "https://testnet.arcscan.app/tx/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  contractUrl:
    "https://testnet.arcscan.app/address/0x2222222222222222222222222222222222222222"
};
