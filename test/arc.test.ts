import { expect } from "chai";

import { ARC_TESTNET, assertArcChain } from "../src/arc";

describe("Arc Testnet configuration", function () {
  it("uses the official Arc Testnet network values", function () {
    expect(ARC_TESTNET).to.deep.equal({
      name: "Arc Testnet",
      chainId: 5_042_002n,
      rpcUrl: "https://rpc.testnet.arc.network",
      explorerUrl: "https://testnet.arcscan.app",
      faucetUrl: "https://faucet.circle.com"
    });
  });

  it("accepts the Arc Testnet chain ID", function () {
    expect(() => assertArcChain(5_042_002n)).not.to.throw();
  });

  it("rejects a different chain before signing", function () {
    expect(() => assertArcChain(1n)).to.throw(
      "Wrong network: expected Arc Testnet chain ID 5042002, received 1."
    );
  });
});
