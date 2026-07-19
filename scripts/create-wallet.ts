import { createTestWallet } from "../src/local-env";
import { ARC_TESTNET } from "../src/arc";

function main(): void {
  const { address } = createTestWallet();

  console.log("Arc Testnet wallet created.");
  console.log(`Public address: ${address}`);
  console.log(`Official Faucet: ${ARC_TESTNET.faucetUrl}`);
  console.log("");
  console.log(
    "Use this wallet only on testnets. Never send real assets to it."
  );
  console.log("The private key was saved locally and was not printed.");
}

try {
  main();
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Wallet setup failed."
  );
  process.exitCode = 1;
}
