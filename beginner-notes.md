# Beginner Notes: First Arc Testnet Deployment

## Context

I am a Chung-Ang University student and I am studying ZK and blockchain. I
mostly use TypeScript/JavaScript and C++. This was my first time deploying a
contract on Arc Testnet.

## What I Tested

- [x] Created a separate testnet-only wallet
- [x] Requested Arc Testnet USDC from the official Faucet
- [x] Ran the Solidity tests locally
- [x] Deployed `ArcLearningLog` to Arc Testnet
- [x] Checked the transaction in Arcscan
- [x] Verified the contract again through the public RPC

## What Was Clear?

The network information was clear. I could find the chain ID, RPC, Faucet and
explorer in one place. The Faucet and deployment steps were also simple after I
opened the correct project folder.

## What Was Confusing?

At first I did not know that npm commands must be run inside the project folder.
I ran them from `C:\Windows\System32`, so npm could not find `package.json`.

The public RPC also returned `request limit reached` when I verified again. I
used another RPC listed in the Arc documentation and made the requests more
slowly.

## Did an Error Occur?

The first error was:

```text
npm error enoent Could not read package.json
```

Later I got:

```text
request limit reached
```

After changing the folder and retrying verification with another official RPC,
the verification passed.

## What Could Improve?

I think the beginner guide can show the `cd` command before every npm command.
It can also mention the other RPC endpoints when the main public RPC has a rate
limit.

## What Did I Learn?

I learned that Arc uses USDC for gas, so I needed testnet USDC before
deployment. I also learned that only seeing a contract address is not enough.
The transaction receipt, bytecode, owner and message can be checked again from
the RPC.
