import { expect } from "chai";

import { formatCliError } from "../src/errors";

describe("beginner CLI errors", function () {
  it("adds retry guidance to RPC connectivity failures", function () {
    const error = new Error("connect ETIMEDOUT 127.0.0.1");

    expect(formatCliError(error, "RPC check")).to.equal(
      "RPC check could not reach the Arc Testnet RPC. Check your internet connection and retry. Official network details: https://docs.arc.io/arc/references/rpc-endpoints"
    );
  });

  it("keeps actionable project errors unchanged", function () {
    expect(
      formatCliError(
        new Error("No test wallet found. Run npm run wallet:create first."),
        "Balance check"
      )
    ).to.equal("No test wallet found. Run npm run wallet:create first.");
  });
});
