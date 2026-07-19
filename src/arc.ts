export const ARC_TESTNET = {
  name: "Arc Testnet",
  chainId: 5_042_002n,
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",
  faucetUrl: "https://faucet.circle.com"
} as const;

export function assertArcChain(actualChainId: bigint): void {
  if (actualChainId !== ARC_TESTNET.chainId) {
    throw new Error(
      `Wrong network: expected Arc Testnet chain ID ${ARC_TESTNET.chainId}, received ${actualChainId}.`
    );
  }
}
