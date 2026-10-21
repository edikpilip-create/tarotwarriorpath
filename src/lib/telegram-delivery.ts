type TelegramCredentials = {
  token?: string;
  chatId?: string;
};

export type TelegramDeliveryResult =
  | { ok: true }
  | {
    ok: false;
    reason: "configuration" | "network" | "timeout" | "rejected";
    httpStatus?: number;
    errorCode?: number;
  };

export async function deliverTelegramLead(
  message: string,
  credentials: TelegramCredentials,
  request: typeof fetch = fetch,
): Promise<TelegramDeliveryResult> {
  const token = credentials.token?.trim();
  const chatId = credentials.chatId?.trim();

  if (!token || !chatId) {
    return { ok: false, reason: "configuration" };
  }

  try {
    const response = await request(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const result: unknown = await response.json().catch(() => null);

    if (response.ok && isRecord(result) && result.ok === true) {
      return { ok: true };
    }

    return {
      ok: false,
      reason: "rejected",
      httpStatus: response.status,
      errorCode: isRecord(result) && typeof result.error_code === "number"
        ? result.error_code
        : undefined,
    };
  } catch (error) {
    const timedOut = error instanceof Error
      && (error.name === "TimeoutError" || error.name === "AbortError");

    return { ok: false, reason: timedOut ? "timeout" : "network" };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
