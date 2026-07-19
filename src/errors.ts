const ARC_RPC_DOCS = "https://docs.arc.io/arc/references/rpc-endpoints";
const CONNECTIVITY_ERROR =
  /timeout|etimedout|econnrefused|enotfound|network error|failed to detect network|socket hang up|fetch failed|could not connect/i;

export function formatCliError(error: unknown, action: string): string {
  const message =
    error instanceof Error ? error.message : `${action} failed unexpectedly.`;

  if (CONNECTIVITY_ERROR.test(message)) {
    return `${action} could not reach the Arc Testnet RPC. Check your internet connection and retry. Official network details: ${ARC_RPC_DOCS}`;
  }

  return message;
}
