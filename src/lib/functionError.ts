export async function messageFromFunctionError(
  error: unknown,
  fallback: string
): Promise<string> {
  const context = (error as { context?: { json?: () => Promise<unknown> } })
    ?.context;

  if (context && typeof context.json === "function") {
    try {
      const body = (await context.json()) as { error?: unknown };
      if (typeof body?.error === "string" && body.error.length > 0 && body.error.length < 300) {
        return body.error;
      }
    } catch {
      // The function body was not JSON.
    }
  }

  if (error instanceof Error) {
    const message = error.message || "";
    if (message && !message.toLowerCase().includes("non-2xx")) {
      return message;
    }
  }

  return fallback;
}
