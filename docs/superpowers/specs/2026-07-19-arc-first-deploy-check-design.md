# Arc First Deploy Check - Design

## Purpose

Create a small, reproducible Arc Testnet project that demonstrates a real
deployment and beginner-focused documentation feedback. The repository should
support a Discord reapplication with evidence that is concrete, public, and
easy for the owner to reproduce.

The project is intentionally small. It is not presented as a production
application or an advanced protocol.

## Success Criteria

- A public GitHub repository contains a tested Solidity contract and
  TypeScript tooling.
- A fresh testnet-only wallet deploys the contract to Arc Testnet.
- The deployment has a public Arcscan transaction and contract address.
- A verification command checks the deployment through Arc's public RPC and
  generates a Markdown report.
- A beginner notes document records genuine friction and useful documentation
  feedback.
- No private key, seed phrase, or environment file is committed.
- The owner can complete the external steps from a detailed Windows runbook.

## Audience

The primary user is a Chung-Ang University student who is new to blockchain
development, uses TypeScript/JavaScript and C++, and is studying ZK and
blockchain concepts.

## Technical Approach

Use a Node.js and TypeScript toolchain to avoid requiring WSL or a separate
Foundry installation on Windows.

- Hardhat compiles, tests, and deploys the Solidity contract.
- TypeScript scripts create a testnet-only wallet, query its balance, deploy
  the contract, verify onchain state, and generate the report.
- Arc Testnet is configured with chain ID `5042002`, RPC
  `https://rpc.testnet.arc.network`, USDC as the native gas asset, and
  `https://testnet.arcscan.app` as the explorer.

## Contract

`ArcLearningLog.sol` stores:

- the deployer's address as the owner;
- a short learning message;
- the most recent update timestamp.

Only the owner can update the message. An event records each update.

The contract is deliberately simple enough for a beginner to understand while
still supporting tests for deployment, reads, writes, events, and access
control.

## Commands

The repository exposes these commands:

- `npm test`: run contract and TypeScript tests.
- `npm run wallet:create`: create a fresh testnet-only key, store it in an
  ignored local environment file, and print only the public address.
- `npm run wallet:balance`: query the native Arc Testnet USDC balance.
- `npm run deploy`: deploy `ArcLearningLog` and write non-secret deployment
  metadata to `deployment.json`.
- `npm run verify`: verify chain ID, transaction receipt, bytecode, owner, and
  message, then generate `deployment-report.md`.
- `npm run security:check`: fail if environment files are tracked or a likely
  private key appears in tracked project files.
- `npm run check`: run formatting, linting, type checking, tests, and the
  security check.

## User Workflow

1. Open PowerShell in the repository path supplied in the final handoff.
2. Install dependencies and run tests.
3. Run the wallet creation command.
4. Copy only the printed public address.
5. Open the official Circle Faucet, select Arc Testnet and USDC, and request
   funds for that address.
6. Run the balance command and confirm the balance is greater than zero.
7. Run the deployment command.
8. Open the generated Arcscan URL and confirm the transaction succeeded.
9. Run the verification command.
10. Answer a short set of prompts about confusing steps and new learning.
11. Incorporate those answers into `beginner-notes.md`.
12. Run the full check before publishing the repository.

The user must never paste a private key or seed phrase into a website, chat, or
issue. The generated wallet must never receive real assets.

## Generated Evidence

`deployment.json` contains:

- network name and chain ID;
- deployer address;
- contract address;
- deployment transaction hash;
- deployment block number and timestamp;
- explorer URLs.

`deployment-report.md` contains the same public identifiers plus verification
results and the contract's returned values. It is safe to commit.

`beginner-notes.md` contains:

- environment and prerequisites;
- steps that were clear;
- steps that caused friction;
- reproducible errors, if any;
- concise suggestions for documentation improvements;
- what the user learned.

## Security

- `.env.local` and other environment variants are ignored.
- `.env.example` contains names only, never credentials.
- Wallet creation does not print the private key.
- Scripts reject non-Arc chain IDs.
- Deployment requires an explicit confirmation flag or interactive
  confirmation.
- The security checker inspects only tracked and candidate project files and
  avoids printing any detected secret value.
- The README prominently states that the wallet is testnet-only.

## Error Handling

- RPC timeout: print a short diagnostic and suggest retrying or checking the
  official Arc status/resources.
- Incorrect chain ID: stop before signing.
- Zero balance: stop and direct the user to the official faucet.
- Faucet delay: allow balance checks to be retried without recreating a wallet.
- Failed deployment: preserve the error summary without writing a successful
  deployment record.
- Missing deployment metadata: verification exits with the exact missing
  prerequisite.
- Report mismatch: verification fails instead of generating a misleading
  success report.

## Testing

- Contract tests cover initial state, owner update, non-owner rejection,
  timestamp changes, and emitted events.
- TypeScript unit tests cover configuration, deployment metadata validation,
  report formatting, and secret detection.
- Integration checks use Arc's public read-only RPC and do not require a
  funded wallet.
- Live deployment remains a deliberate user step because it requires the
  locally stored testnet key and Faucet funding.

## Publication and Reapplication

After live verification:

1. Create or connect the public GitHub repository.
2. Run the full check and review tracked files.
3. Commit and push the verified project.
4. Confirm that README, deployment report, Arcscan links, and beginner notes
   render publicly.
5. Reapply to the Arc Discord as a contributor or learner who tested the Arc
   developer flow, including the repository URL as evidence.

The application must describe the project accurately and avoid claims of
advanced expertise, official affiliation, guaranteed rewards, or production
readiness.
