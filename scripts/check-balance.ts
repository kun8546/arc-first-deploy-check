import { formatUnits, JsonRpcProvider, Wallet } from "ethers";

import { ARC_TESTNET, assertArcChain } from "../src/arc";
import { formatCliError } from "../src/errors";
import { readPrivateKey } from "../src/local-env";

async function main(): Promise<void> {
  const provider = new JsonRpcProvider(ARC_TESTNET.rpcUrl);
  const network = await provider.getNetwork();
  assertArcChain(network.chainId);

  const wallet = new Wallet(readPrivateKey(), provider);
  const balance = await provider.getBalance(wallet.address);

  console.log(`Network: ${ARC_TESTNET.name}`);
  console.log(`Address: ${wallet.address}`);
  console.log(`Native testnet USDC balance: ${formatUnits(balance, 18)}`);

  if (balance === 0n) {
    console.log(`Request testnet USDC at ${ARC_TESTNET.faucetUrl}`);
  }
}

main().catch((error: unknown) => {
  console.error(formatCliError(error, "Balance check"));
  process.exitCode = 1;
});
