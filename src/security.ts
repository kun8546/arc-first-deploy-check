import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const PRIVATE_KEY_ASSIGNMENT =
  /(?:PRIVATE_KEY|privateKey)\s*(?:=|:)\s*["']?0x[0-9a-fA-F]{64}\b/;
const MAX_TEXT_FILE_SIZE = 1_000_000;

function listGitFiles(root: string, args: string[]): string[] {
  const output = execFileSync("git", [...args, "-z"], {
    cwd: root,
    encoding: "utf8"
  });

  return output
    .split("\0")
    .filter((entry) => entry !== "")
    .map((entry) => entry.replaceAll("\\", "/"));
}

function isForbiddenTrackedEnvironmentFile(filePath: string): boolean {
  const fileName = filePath.split("/").at(-1) ?? "";
  return fileName.startsWith(".env") && fileName !== ".env.example";
}

export function containsLikelyPrivateKey(content: string): boolean {
  return PRIVATE_KEY_ASSIGNMENT.test(content);
}

export function findUnsafeTrackedFiles(root = process.cwd()): string[] {
  const repositoryRoot = resolve(root);
  const candidates = listGitFiles(repositoryRoot, [
    "ls-files",
    "-c",
    "-o",
    "--exclude-standard"
  ]);
  const tracked = new Set(listGitFiles(repositoryRoot, ["ls-files", "-c"]));
  const unsafe = new Set<string>();

  for (const relativePath of candidates) {
    if (
      tracked.has(relativePath) &&
      isForbiddenTrackedEnvironmentFile(relativePath)
    ) {
      unsafe.add(relativePath);
      continue;
    }

    const absolutePath = resolve(repositoryRoot, relativePath);
    if (statSync(absolutePath).size > MAX_TEXT_FILE_SIZE) {
      continue;
    }

    const content = readFileSync(absolutePath, "utf8");
    if (!content.includes("\0") && containsLikelyPrivateKey(content)) {
      unsafe.add(relativePath);
    }
  }

  return [...unsafe].sort();
}
