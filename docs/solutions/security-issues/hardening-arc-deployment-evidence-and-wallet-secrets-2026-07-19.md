---
title: Hardening Arc deployment evidence and wallet secrets
date: 2026-07-19
category: security-issues
module: Arc Testnet deployment evidence
problem_type: security_issue
component: tooling
symptoms:
  - Deployment evidence did not prove that the receipt, metadata, and contract were the same deployment
  - Exact bytecode comparison failed when an immutable owner changed deployed runtime code
  - Local secret detection missed several Ethereum private-key patterns and full Git history
  - A Windows ACL failure could leave the newly written wallet file on disk
root_cause: logic_error
resolution_type: code_fix
severity: medium
related_components:
  - testing_framework
  - development_workflow
tags:
  - arc-testnet
  - deployment-evidence
  - runtime-bytecode
  - secret-scanning
  - github-actions
  - windows-acl
  - private-key
---

# Hardening Arc Deployment Evidence and Wallet Secrets

## Problem

The first verifier could show that a transaction succeeded and that an address
contained code, but it did not prove that every public artifact referred to the
same `ArcLearningLog` deployment. Wallet protection also had blind spots in
local scanning, Git history scanning, and Windows file-permission failures.

No live Arc Testnet deployment was performed during this fix.

## Symptoms

- Receipt success was not bound to the recorded transaction, sender, contract,
  and block.
- Non-empty bytecode could belong to an unrelated contract.
- Direct bytecode equality rejected a correct contract while `owner` was
  `immutable`, because Solidity inserted the owner address into runtime code.
- Secret checks missed generic `key` variables, `SigningKey` constructors, and
  keys near the end of large files.
- A failed `icacls` call happened after `.env.local` had already been written.

## What Didn't Work

Receipt success and non-empty bytecode were necessary but not sufficient:

```ts
const receiptSucceeded = receipt.status === 1;
const bytecodePresent = code !== "0x";
```

Exact comparison was also incorrect with constructor-specific immutable data:

```solidity
address public immutable owner;
```

The artifact contains immutable placeholders while the deployed runtime
contains the actual address. A unit test that compared two arbitrary equal
strings did not expose this deployment-specific difference.

## Solution

### Bind Every Public Identifier

`validateDeploymentReceipt` now rejects mismatches in receipt status,
transaction hash, contract address, sender, and block number before a PASS
report can be generated.

### Verify the Compiled Contract

The verifier reads the Hardhat artifact and compares its runtime bytecode with
`provider.getCode(contractAddress)`. The owner remains unchangeable in practice
because there is no setter, but it is stored normally so runtime code is
deterministic:

```solidity
address public owner;
```

A Hardhat integration test deploys the real contract locally and compares the
provider result with `artifact.deployedBytecode`.

### Layer Secret Protection

The local scanner checks tracked and staged files for common Ethereum key
assignments and `Wallet` or `SigningKey` constructors. CI checks full Git
history with Gitleaks, extends its defaults with an Ethereum private-key rule,
and pins Node 24-based GitHub Actions to full commit SHAs.

Runtime and development audits remain separate:

```powershell
npm audit --omit=dev --audit-level=high
```

This returned zero runtime vulnerabilities. Hardhat 2 still has development-only
transitive advisories, so the project does not claim that the full toolchain is
warning-free.

### Make Wallet Creation Transactional

On Windows, the wallet file has inherited permissions removed and access
granted to the current user with `icacls`. If that step fails, the newly
created file is removed before an actionable error is returned:

```ts
try {
  protectFile(environmentPath);
} catch (error) {
  rmSync(environmentPath, { force: true });
  throw new Error(
    "Could not secure the local wallet file, so it was removed.",
    {
      cause: error
    }
  );
}
```

## Why This Works

Receipt binding prevents an unrelated successful transaction from being used
as evidence. Runtime-bytecode equality proves that the recorded address
contains the contract compiled by this repository. Local scanning catches
mistakes before commit, while Gitleaks covers earlier commits and pushed
history. Wallet cleanup ensures permission protection either completes or
leaves no key file behind.

## Prevention

- Keep the receipt-binding and local deployment bytecode tests.
- Revisit bytecode comparison before adding immutables, linked libraries,
  proxies, or different compiler settings.
- Run both the local secret scanner and full-history Gitleaks.
- Keep GitHub Actions SHA-pinned and let Dependabot propose updates.
- Treat secret-file creation as an all-or-nothing operation.
- Report runtime and development audits separately.
- Never describe tested deployment tooling as a live Arc deployment without a
  real transaction, address, and RPC-generated PASS report.

## Related Issues

- Commit `34d92cc`: receipt binding, CLI errors, and initial CI hardening.
- Commit `f233357`: runtime proof, Gitleaks, pinned actions, and Windows ACLs.
- Commit `98291f2`: deployable bytecode comparison and ACL failure cleanup.
- `README.md` and `USER_RUNBOOK.md` describe the supported user workflow.
