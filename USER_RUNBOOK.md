# Windows Runbook: First Arc Testnet Deployment

Follow the steps in order. Do not start from `C:\Windows\System32`.

## 1. Open the Correct Project Folder

Open PowerShell and run:

```powershell
Set-Location -LiteralPath "C:\Users\kun85\source\repos\arc-first-deploy-check"
```

Confirm that PowerShell can see the project:

```powershell
Get-Location
Get-Item -LiteralPath ".\package.json"
```

The first command must show:

```text
C:\Users\kun85\source\repos\arc-first-deploy-check
```

The second command must show a `package.json` file. Do not continue if it says
the file does not exist.

## 2. Install and Test the Project

```powershell
npm install
npm test
npm run typecheck
```

Expected result:

- installation completes;
- all tests pass;
- type checking exits without an error.

Warnings about packages are not the same as a failed test. Stop only if a
command ends with `npm error`, `failing`, or a non-zero exit.

## 3. Create a Testnet-Only Wallet

Run:

```powershell
npm run wallet:create
```

The command prints a public address similar to:

```text
Public address: 0x1234...
```

Copy only the public `0x...` address.

The command also creates `.env.local`. That file contains the private key and
must stay on this computer. Do not:

- paste `.env.local` into chat;
- upload it to GitHub;
- send real tokens to this wallet;
- import this key into a wallet that holds real assets.

If the command says a local wallet already exists, do not delete it. Continue
with the existing wallet unless you intentionally want to restart the entire
test.

## 4. Request Testnet USDC

1. Open the official Circle Faucet:
   <https://faucet.circle.com/>
2. Select `Arc Testnet` as the network.
3. Select `USDC` as the token if the Faucet asks for a token.
4. Paste the public address printed in Step 3.
5. Complete any verification shown by the official Faucet.
6. Submit the request.

The Faucet only needs a public address. If any page asks for a private key or
seed phrase, close it because it is not the correct flow.

## 5. Confirm the Balance

Return to PowerShell:

```powershell
npm run wallet:balance
```

Expected output includes:

```text
Network: Arc Testnet
Native testnet USDC balance: ...
```

If the balance is `0.0`, wait a few minutes and run the same command again. Do
not create another wallet just because the Faucet is delayed.

## 6. Deploy the Contract

Set the one-time deployment confirmation:

```powershell
$env:CONFIRM_ARC_TESTNET_DEPLOY = "yes"
```

Deploy:

```powershell
npm run deploy
```

Remove the confirmation variable after the command finishes:

```powershell
Remove-Item Env:CONFIRM_ARC_TESTNET_DEPLOY -ErrorAction SilentlyContinue
```

A successful deployment prints:

- deployer address;
- balance;
- transaction hash;
- contract address;
- Arcscan transaction link.

It also creates `deployment.json`, which contains public information only.

If deployment fails, do not edit `deployment.json` manually. Read the final
error line, fix the named prerequisite, and run the deployment again.

## 7. Check Arcscan

Open the `Explorer:` link printed by the deployment command.

Confirm:

- transaction status is successful;
- network is Arc Testnet;
- the sender matches the test wallet address;
- a contract address is shown.

Do not use an advertisement or unrelated explorer link from a search result.
The expected domain is `testnet.arcscan.app`.

## 8. Generate the Verification Report

```powershell
npm run verify
```

Expected output:

```text
Onchain verification passed.
Public report saved to deployment-report.md.
```

Open the report:

```powershell
notepad .\deployment-report.md
```

The report must say `Overall result: PASS` and contain working Arcscan links.

## 9. Complete the Beginner Notes

Open:

```powershell
notepad .\beginner-notes.md
```

Answer the prompts based on the steps you actually performed. Short, specific
answers are better than general praise. Include an exact error message if one
occurred, but remove addresses or information you do not want to publish.

## 10. Run Every Safety Check

```powershell
npm run check
npm run security:check
npm audit --omit=dev --audit-level=high
git status --short
```

Required result:

- all tests pass;
- formatting, linting, compilation, and type checking pass;
- security check says no tracked secrets were found;
- the runtime dependency audit reports `found 0 vulnerabilities`;
- `.env.local` does not appear in `git status`.

Stop if `.env.local` appears. Do not use `git add -f` on any environment file.

## 11. Publish to GitHub

On GitHub:

1. Select `New repository`.
2. Name it `arc-first-deploy-check`.
3. Select `Public`.
4. Do not create another README, `.gitignore`, or license.
5. Create the repository.

Back in PowerShell, replace `YOUR_GITHUB_NAME` with the real account name:

```powershell
git add .
npm run security:check
git commit -m "docs: add verified Arc Testnet deployment"
git remote add origin "https://github.com/YOUR_GITHUB_NAME/arc-first-deploy-check.git"
git push -u origin main
```

Before using the repository in an application, open it while signed out or in
an incognito window. Confirm that these files and links are public:

- `README.md`
- `deployment-report.md`
- `beginner-notes.md`
- the Arcscan transaction link
- the Arcscan contract link

## 12. Information Safe to Share

Safe:

- GitHub repository URL;
- public wallet address;
- contract address;
- transaction hash;
- Arcscan URLs;
- reproducible error messages without secrets.

Never share:

- `.env.local`;
- a private key;
- seed or recovery words;
- passwords or API keys.
