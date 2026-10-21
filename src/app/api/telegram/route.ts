import { formatTelegramMessage, getApiErrorMessage, validateLeadPayload } from "@/lib/telegram";
import { deliverTelegramLead } from "@/lib/telegram-delivery";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const validation = validateLeadPayload(payload);

  if (!validation.ok) {
    return Response.json(
      { ok: false, message: validation.message },
      { status: validation.status }
    );
  }

  const delivery = await deliverTelegramLead(formatTelegramMessage(validation.data), {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  });

  if (!delivery.ok) {
    // Never log request bodies, credentials, upstream URLs, or raw fetch errors.
    console.error("Telegram lead delivery failed", delivery);
    const misconfigured = delivery.reason === "configuration";

    return Response.json(
      {
        ok: false,
        code: misconfigured
          ? "TELEGRAM_NOT_CONFIGURED"
          : delivery.reason === "rejected"
            ? `TELEGRAM_REJECTED_${delivery.httpStatus}`
            : `TELEGRAM_${delivery.reason.toUpperCase()}`,
        message: getApiErrorMessage(
          validation.data.languageCode,
          misconfigured ? "serverMisconfigured" : "deliveryFailed",
        ),
      },
      { status: misconfigured ? 500 : 502 }
    );
  }

  return Response.json({ ok: true });
}
