import { assertArcChain } from "./arc";

export interface RpcSnapshot {
  chainId: bigint;
  blockNumber: number;
}

export function validateRpcSnapshot(snapshot: RpcSnapshot): RpcSnapshot {
  assertArcChain(snapshot.chainId);

  if (
    !Number.isSafeInteger(snapshot.blockNumber) ||
    snapshot.blockNumber <= 0
  ) {
    throw new Error("Arc RPC returned an invalid latest block number.");
  }

  return snapshot;
}
