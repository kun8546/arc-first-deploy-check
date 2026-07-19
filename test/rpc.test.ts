import { expect } from "chai";

import { validateRpcSnapshot } from "../src/rpc";

describe("Arc RPC snapshot", function () {
  it("accepts the Arc chain ID and a positive block number", function () {
    expect(
      validateRpcSnapshot({
        chainId: 5_042_002n,
        blockNumber: 12_345
      })
    ).to.deep.equal({
      chainId: 5_042_002n,
      blockNumber: 12_345
    });
  });

  it("rejects an invalid chain or block number", function () {
    expect(() =>
      validateRpcSnapshot({ chainId: 1n, blockNumber: 12_345 })
    ).to.throw("Wrong network");

    expect(() =>
      validateRpcSnapshot({ chainId: 5_042_002n, blockNumber: 0 })
    ).to.throw("Arc RPC returned an invalid latest block number");
  });
});
