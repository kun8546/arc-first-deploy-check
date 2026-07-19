# Arc First Deploy Check

This is a small beginner project for testing the Arc Testnet deployment flow.
I made it while learning about Arc, USDC, and blockchain development with
TypeScript.

The project deploys a simple Solidity contract and then checks the result
through Arc's public RPC. It creates a Markdown report with the public
transaction and contract links.

## What It Tests

- Compile and test a small Solidity contract.
- Create a separate testnet-only wallet.
- Check the wallet's native testnet USDC balance.
- Deploy the contract to Arc Testnet.
- Verify the receipt, bytecode, owner, message, and timestamp.
- Generate public deployment evidence.
- Check that private keys are not included in Git files.

## Contract

`ArcLearningLog` stores:

- the deployer's address;
- a short learning message;
- the last update timestamp.

Only the deployer can update the message. This keeps the contract small enough
to understand while still testing reads, writes, events, and access control.

## Current Status

The local contract and tooling are complete and tested. The live
`deployment.json` and `deployment-report.md` files are created only after a
real Arc Testnet deployment is verified.

## Run It

Follow [USER_RUNBOOK.md](USER_RUNBOOK.md). It starts from opening PowerShell
in the correct folder and includes wallet creation, the official Faucet,
deployment, verification, and GitHub safety checks.

Main commands:

```powershell
npm install
npm test
npm run wallet:create
npm run wallet:balance
npm run deploy
npm run verify
npm run security:check
```

## Project Structure

```text
contracts/             Solidity contract
scripts/               Wallet, deployment, and verification commands
src/                   Reusable TypeScript validation and reporting code
test/                  Contract and TypeScript tests
beginner-notes.md      Notes to complete after the live run
deployment.example.json
USER_RUNBOOK.md
```

## Arc Testnet

- Chain ID: `5042002`
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`
- Faucet: `https://faucet.circle.com`
- Native gas asset: testnet USDC

Official references:

- [Deploy on Arc](https://docs.arc.io/arc/tutorials/deploy-on-arc)
- [Arc RPC endpoints](https://docs.arc.io/arc/references/rpc-endpoints)
- [Connect to Arc](https://docs.arc.io/arc/references/connect-to-arc)

## Security

The wallet created by this project is only for Arc Testnet.

- Do not send real assets to it.
- Do not paste its private key into a website, chat, issue, or README.
- The private key stays in `.env.local`, which Git ignores.
- Run `npm run security:check` before every push.

## License

MIT
