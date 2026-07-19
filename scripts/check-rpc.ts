import { JsonRpcProvider } from "ethers";

import { ARC_TESTNET } from "../src/arc";
import { formatCliError } from "../src/errors";
import { validateRpcSnapshot } from "../src/rpc";

async function main(): Promise<void> {
  const provider = new JsonRpcProvider(ARC_TESTNET.rpcUrl);
  const [network, blockNumber] = await Promise.all([
    provider.getNetwork(),
    provider.getBlockNumber()
  ]);
  const snapshot = validateRpcSnapshot({
    chainId: network.chainId,
    blockNumber
  });

  console.log(`Arc RPC connected: ${ARC_TESTNET.rpcUrl}`);
  console.log(`Chain ID: ${snapshot.chainId}`);
  console.log(`Latest block: ${snapshot.blockNumber}`);
}

main().catch((error: unknown) => {
  console.error(formatCliError(error, "RPC check"));
  process.exitCode = 1;
});
