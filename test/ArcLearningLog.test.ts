import { expect } from "chai";
import { artifacts, ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { ArcLearningLog__factory } from "../typechain-types";

import { validateRuntimeBytecode } from "../src/verification";

describe("ArcLearningLog", function () {
  const initialMessage = "Learning Arc by testing a real deployment.";

  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ArcLearningLog");
    const deployed = await factory.deploy(initialMessage);
    await deployed.waitForDeployment();
    const contract = ArcLearningLog__factory.connect(
      await deployed.getAddress(),
      owner
    );

    return { contract, owner, other };
  }

  it("records the deployer and initial learning message", async function () {
    const { contract, owner } = await deployFixture();

    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.message()).to.equal(initialMessage);
    expect(await contract.updatedAt()).to.be.greaterThan(0n);
  });

  it("deploys the exact runtime bytecode produced by this project", async function () {
    const { contract } = await deployFixture();
    const artifact = await artifacts.readArtifact("ArcLearningLog");
    const deployedCode = await ethers.provider.getCode(
      await contract.getAddress()
    );

    expect(() =>
      validateRuntimeBytecode(artifact.deployedBytecode, deployedCode)
    ).not.to.throw();
  });

  it("lets the owner update the message and emits evidence", async function () {
    const { contract } = await deployFixture();
    const newMessage = "Verified an Arc Testnet contract from TypeScript.";
    const nextTimestamp = (await time.latest()) + 1;
    await time.setNextBlockTimestamp(nextTimestamp);

    await expect(contract.updateMessage(newMessage))
      .to.emit(contract, "MessageUpdated")
      .withArgs(newMessage, nextTimestamp);

    expect(await contract.message()).to.equal(newMessage);
  });

  it("rejects updates from a different account", async function () {
    const { contract, other } = await deployFixture();

    await expect(contract.connect(other).updateMessage("not allowed"))
      .to.be.revertedWithCustomError(contract, "NotOwner")
      .withArgs(other.address);
  });

  it("moves the update timestamp forward", async function () {
    const { contract } = await deployFixture();
    const deployedAt = await contract.updatedAt();
    await time.increase(5);

    await contract.updateMessage("A later learning note.");

    expect(await contract.updatedAt()).to.be.greaterThan(deployedAt);
  });
});
