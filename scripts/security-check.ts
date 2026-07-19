import { findUnsafeTrackedFiles } from "../src/security";

function main(): void {
  const unsafeFiles = findUnsafeTrackedFiles();

  if (unsafeFiles.length > 0) {
    console.error("Security check failed. Review these files:");
    for (const filePath of unsafeFiles) {
      console.error(`- ${filePath}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Security check passed. No tracked secrets found.");
}

try {
  main();
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Security check failed."
  );
  process.exitCode = 1;
}
