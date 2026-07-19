import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";

import { config as loadEnvironment } from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";

loadEnvironment({ path: ".env.local", quiet: true });

const privateKey = process.env.PRIVATE_KEY;
const accounts =
  privateKey !== undefined && /^0x[0-9a-fA-F]{64}$/.test(privateKey)
    ? [privateKey]
    : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      chainId: 5_042_002,
      accounts
    }
  },
  mocha: {
    timeout: 20_000
  }
};

export default config;
