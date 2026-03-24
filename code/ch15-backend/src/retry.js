// src/retry.js -- Retry logic for contention errors (from book Chapter 15)
//
// Handles ABORTED errors from the Ledger API with exponential backoff.
// These occur when two commands exercise on the same contract simultaneously.

export async function submitWithRetry(
  submitFn, maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await submitFn();
    } catch (err) {
      const isAborted =
        err.message?.includes("ABORTED");
      const hasRetries =
        i < maxRetries - 1;
      if (isAborted && hasRetries) {
        const ms = 100 * (i + 1);
        await new Promise(
          (r) => setTimeout(r, ms)
        );
        continue;
      }
      throw err;
    }
  }
  throw new Error("Retries exhausted");
}
