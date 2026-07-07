import { formatTelegramMessage, getApiErrorMessage, validateLeadPayload } from "@/lib/telegram";

const telegramRequestTimeoutMs = 10_000;

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validation = validateLeadPayload(payload);

  if (!validation.ok) {
    return Response.json(
      { ok: false, message: validation.message },
      { status: validation.status }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return Response.json(
      { ok: false, message: getApiErrorMessage(validation.data.languageCode, "serverMisconfigured") },
      { status: 500 }
    );
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(telegramRequestTimeoutMs),
    body: JSON.stringify({
      chat_id: chatId,
      text: formatTelegramMessage(validation.data),
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  }).catch(() => null);

  if (!response?.ok) {
    return Response.json(
      { ok: false, message: getApiErrorMessage(validation.data.languageCode, "deliveryFailed") },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
