# Arc First Deploy Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beginner-friendly Arc Testnet contract project that creates a test-only wallet, deploys a small contract, verifies it onchain, and publishes reproducible evidence without exposing secrets.

**Architecture:** Hardhat 2 compiles, tests, and deploys `ArcLearningLog`; focused TypeScript modules own Arc configuration, deployment metadata, report rendering, and secret scanning. Thin scripts call those modules for wallet creation, balance checks, deployment, verification, and security checks.

**Tech Stack:** Node.js 20, TypeScript 5.9, Hardhat 2.28, Solidity 0.8.28, Ethers 6, Mocha/Chai, ESLint, Prettier.

## Global Constraints

- Run on Windows PowerShell without WSL.
- Use Arc Testnet chain ID `5042002`.
- Use RPC `https://rpc.testnet.arc.network`.
- Use explorer `https://testnet.arcscan.app`.
- Treat native gas as testnet USDC with 18-decimal RPC representation.
- Never print or commit the private key.
- Never use the generated wallet for real assets.
- Stop before deployment when the chain ID is wrong or the wallet balance is zero.
- Generate evidence only after all live verification checks pass.

---

### Task 1: Project Toolchain and Contract

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `hardhat.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `contracts/ArcLearningLog.sol`
- Create: `test/ArcLearningLog.test.ts`

**Interfaces:**
- Produces: Solidity contract methods `owner()`, `message()`, `updatedAt()`, and `updateMessage(string)`.
- Produces: event `MessageUpdated(string message, uint256 updatedAt)`.

- [ ] **Step 1: Add the project configuration and dependencies**

Pin Hardhat 2.28.6, toolbox 7.0.0, TypeScript 5.9.3, Ethers 6.17.0,
dotenv 17.4.2, ESLint 10.7.0, typescript-eslint 8.64.0, Prettier 3.9.5,
and tsx 4.23.1. Add scripts for compile, test, typecheck, lint, format,
wallet operations, deploy, verify, security, and the full check.

- [ ] **Step 2: Write the failing contract tests**

Test that deployment records the owner, stores the initial message, permits an
owner update with an event and later timestamp, and rejects a non-owner update
with the custom error `NotOwner(address caller)`.

- [ ] **Step 3: Run the tests and verify the contract is absent**

Run: `npm test`

Expected: FAIL because `contracts/ArcLearningLog.sol` does not exist.

- [ ] **Step 4: Implement the minimal contract**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ArcLearningLog {
    error NotOwner(address caller);

    address public immutable owner;
    string public message;
    uint256 public updatedAt;

    event MessageUpdated(string message, uint256 updatedAt);

    constructor(string memory initialMessage) {
        owner = msg.sender;
        _setMessage(initialMessage);
    }

    function updateMessage(string calldata newMessage) external {
        if (msg.sender != owner) revert NotOwner(msg.sender);
        _setMessage(newMessage);
    }

    function _setMessage(string memory newMessage) private {
        message = newMessage;
        updatedAt = block.timestamp;
        emit MessageUpdated(newMessage, block.timestamp);
    }
}
```

- [ ] **Step 5: Run contract checks**

Run: `npm test`

Expected: four passing tests.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json tsconfig.json hardhat.config.ts .gitignore .env.example contracts test
git commit -m "feat: add Arc learning log contract"
```

### Task 2: Arc Configuration and Test Wallet

**Files:**
- Create: `src/arc.ts`
- Create: `src/local-env.ts`
- Create: `scripts/create-wallet.ts`
- Create: `scripts/check-balance.ts`
- Create: `test/arc.test.ts`
- Create: `test/local-env.test.ts`

**Interfaces:**
- Produces: `ARC_TESTNET` constants.
- Produces: `assertArcChain(actualChainId: bigint): void`.
- Produces: `readPrivateKey(envPath?: string): string`.
- Produces: `createTestWallet(envPath?: string): Promise<{ address: string }>`.

- [ ] **Step 1: Write failing configuration and wallet tests**

Cover the exact chain constants, rejection of a non-Arc chain ID, creation of
an ignored local environment file without printing a private key, refusal to
overwrite an existing wallet, and validation of a `0x`-prefixed 32-byte key.

- [ ] **Step 2: Run focused tests**

Run: `npx hardhat test test/arc.test.ts test/local-env.test.ts`

Expected: FAIL because `src/arc.ts` and `src/local-env.ts` do not exist.

- [ ] **Step 3: Implement Arc configuration**

Export:

```typescript
export const ARC_TESTNET = {
  name: "Arc Testnet",
  chainId: 5_042_002n,
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",
  faucetUrl: "https://faucet.circle.com",
} as const;
```

`assertArcChain` throws an error that includes expected and actual chain IDs.

- [ ] **Step 4: Implement local wallet storage**

Use `Wallet.createRandom()` and write `PRIVATE_KEY=<value>` to `.env.local`
without logging the key. Refuse to overwrite any non-empty existing file.
Return and print only the public address.

- [ ] **Step 5: Implement wallet scripts**

`create-wallet.ts` prints the address, Faucet URL, and testnet-only warning.
`check-balance.ts` loads the key, confirms chain ID, and prints the address and
native USDC balance using `formatEther`.

- [ ] **Step 6: Run tests and type checking**

Run: `npx hardhat test test/arc.test.ts test/local-env.test.ts`

Expected: all focused tests pass.

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 7: Commit**

```powershell
git add src scripts test hardhat.config.ts package.json package-lock.json
git commit -m "feat: add Arc test wallet workflow"
```

### Task 3: Deployment Metadata and Onchain Verification

**Files:**
- Create: `src/deployment.ts`
- Create: `src/report.ts`
- Create: `scripts/deploy.ts`
- Create: `scripts/verify.ts`
- Create: `test/deployment.test.ts`
- Create: `test/report.test.ts`
- Create: `deployment.example.json`

**Interfaces:**
- Produces: `DeploymentRecord`.
- Produces: `validateDeploymentRecord(value: unknown): DeploymentRecord`.
- Produces: `writeDeploymentRecord(record, path?): void`.
- Produces: `renderDeploymentReport(input: VerificationResult): string`.

- [ ] **Step 1: Write failing metadata tests**

Validate exact chain ID, addresses, transaction hash, positive block number,
ISO timestamp, and explorer URLs. Reject malformed or incomplete input.

- [ ] **Step 2: Write failing report tests**

Verify the Markdown contains network, deployer, contract, transaction,
Arcscan links, bytecode status, owner match, message match, and a clear
overall PASS result.

- [ ] **Step 3: Run focused tests**

Run: `npx hardhat test test/deployment.test.ts test/report.test.ts`

Expected: FAIL because deployment and report modules do not exist.

- [ ] **Step 4: Implement deployment metadata**

Use manual type guards with exact field names:

```typescript
export interface DeploymentRecord {
  network: "Arc Testnet";
  chainId: 5042002;
  deployer: string;
  contractAddress: string;
  transactionHash: string;
  blockNumber: number;
  deployedAt: string;
  initialMessage: string;
  transactionUrl: string;
  contractUrl: string;
}
```

- [ ] **Step 5: Implement live deployment**

Load `.env.local`, confirm chain ID and non-zero balance, require
`CONFIRM_ARC_TESTNET_DEPLOY=yes`, deploy with the initial message
`Learning Arc by testing a real deployment.`, wait one confirmation, and
write `deployment.json` only after a successful receipt.

- [ ] **Step 6: Implement live verification and report generation**

Read `deployment.json`; query receipt, code, `owner`, `message`, and
`updatedAt`; compare owner and message to metadata; fail on any mismatch; then
write `deployment-report.md`.

- [ ] **Step 7: Run tests**

Run: `npm test`

Expected: all contract and TypeScript tests pass.

- [ ] **Step 8: Commit**

```powershell
git add src scripts test deployment.example.json package.json package-lock.json
git commit -m "feat: verify Arc deployments and generate evidence"
```

### Task 4: Secret Scanner and Beginner Documentation

**Files:**
- Create: `src/security.ts`
- Create: `scripts/security-check.ts`
- Create: `test/security.test.ts`
- Create: `README.md`
- Create: `USER_RUNBOOK.md`
- Create: `beginner-notes.md`
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`

**Interfaces:**
- Produces: `containsLikelyPrivateKey(content: string): boolean`.
- Produces: `findUnsafeTrackedFiles(root?: string): string[]`.

- [ ] **Step 1: Write failing secret scanner tests**

Cover a private key assigned to `PRIVATE_KEY`, an environment file returned by
Git, ordinary addresses and transaction hashes that must not trigger, and an
error message that names files but never prints secret contents.

- [ ] **Step 2: Run the focused test**

Run: `npx hardhat test test/security.test.ts`

Expected: FAIL because `src/security.ts` does not exist.

- [ ] **Step 3: Implement the scanner**

Use `git ls-files -co --exclude-standard` to select candidate files, reject
tracked `.env` variants except `.env.example`, and scan text files for an
assignment-shaped 64-hex private key. Return file paths only.

- [ ] **Step 4: Write user documentation**

README explains purpose, evidence, architecture, commands, and testnet-only
security. USER_RUNBOOK gives exact PowerShell commands from `cd` through
Faucet, balance, deployment, verification, security check, and GitHub
publication. Beginner notes contain honest prompts, not invented findings.

- [ ] **Step 5: Add linting and formatting**

Configure TypeScript ESLint recommended rules and Prettier. Ensure generated
deployment evidence is formatted but `.env.local`, artifacts, cache,
coverage, and `node_modules` are ignored.

- [ ] **Step 6: Run full local checks**

Run: `npm run check`

Expected: formatting, lint, type checking, compile, tests, and security scan
all exit 0.

- [ ] **Step 7: Commit**

```powershell
git add src scripts test README.md USER_RUNBOOK.md beginner-notes.md eslint.config.mjs .prettierrc.json .gitignore package.json package-lock.json
git commit -m "docs: add secure beginner deployment runbook"
```

### Task 5: Read-only Arc Integration and Final Handoff

**Files:**
- Modify: `README.md`
- Modify: `USER_RUNBOOK.md`

**Interfaces:**
- Consumes: public Arc RPC configuration and all project commands.
- Produces: verified local project ready for the user's Faucet and deployment steps.

- [ ] **Step 1: Run read-only RPC checks**

Run: `npm run wallet:balance`

Expected before wallet creation: a clear error naming `npm run wallet:create`;
the command must not print a stack trace for this expected condition.

Run a read-only integration script or test against the Arc RPC.

Expected: chain ID `5042002` and a positive latest block number.

- [ ] **Step 2: Test the wallet creation flow in an isolated temporary path**

Run the wallet module tests against a temporary directory rather than the
repository's real `.env.local`.

Expected: wallet creation, overwrite prevention, and key validation pass
without leaving a secret in the repository.

- [ ] **Step 3: Verify repository safety**

Run: `npm run security:check`

Expected: `Security check passed. No tracked secrets found.`

Run: `git status --short`

Expected: only intended project files are tracked or pending; no `.env.local`.

- [ ] **Step 4: Run final verification**

Run: `npm run check`

Expected: every check passes from a clean dependency install.

- [ ] **Step 5: Commit final corrections**

```powershell
git add README.md USER_RUNBOOK.md
git commit -m "chore: finalize Arc deployment handoff"
```

- [ ] **Step 6: Stop before live deployment**

Do not create the user's real test wallet, request Faucet funds, deploy, push
to GitHub, or submit the Discord application. Hand off the exact user commands
and wait for the user-owned external steps.
