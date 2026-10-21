import test from "node:test";
import assert from "node:assert/strict";

import { deliverTelegramLead } from "./telegram-delivery.ts";

const credentials = { token: "test-token", chatId: "test-chat" };

test("Telegram delivery rejects missing or blank credentials without making a request", async () => {
  for (const config of [{}, { token: " " }, { token: "test-token", chatId: "\n" }]) {
    const result = await deliverTelegramLead("test", config, async () => {
      assert.fail("A request must not be made without credentials");
    });

    assert.deepEqual(result, { ok: false, reason: "configuration" });
  }
});

test("Telegram delivery trims copied credentials and verifies Telegram acknowledgement", async () => {
  const result = await deliverTelegramLead("<b>Test lead</b>", {
    token: " test-token\r\n",
    chatId: " test-chat\n",
  }, async (url, options) => {
    assert.equal(url, "https://api.telegram.org/bottest-token/sendMessage");
    const body = JSON.parse(String(options?.body));
    assert.equal(body.chat_id, "test-chat");
    assert.equal(body.text, "<b>Test lead</b>");
    assert.equal(body.parse_mode, "HTML");
    assert.ok(options?.signal instanceof AbortSignal);

    return Response.json({ ok: true, result: { message_id: 1 } });
  });

  assert.deepEqual(result, { ok: true });
});

test("Telegram delivery exposes only safe status codes for upstream rejection", async () => {
  const result = await deliverTelegramLead("private lead text", credentials, async () => (
    Response.json({ ok: false, error_code: 401, description: "test-token private detail" }, { status: 401 })
  ));

  assert.deepEqual(result, { ok: false, reason: "rejected", httpStatus: 401, errorCode: 401 });
  assert.ok(!JSON.stringify(result).includes("test-token"));
  assert.ok(!JSON.stringify(result).includes("private"));
});

test("Telegram delivery does not accept a failed JSON result with HTTP 200", async () => {
  const result = await deliverTelegramLead("test", credentials, async () => (
    Response.json({ ok: false, error_code: 400 })
  ));

  assert.equal(result.ok, false);
});

test("Telegram delivery does not accept a non-JSON upstream response", async () => {
  const result = await deliverTelegramLead("test", credentials, async () => new Response("invalid"));

  assert.equal(result.ok, false);
});

test("Telegram delivery reports timeouts without exposing raw fetch errors", async () => {
  const result = await deliverTelegramLead("test", credentials, async () => {
    throw new DOMException("sensitive upstream URL", "TimeoutError");
  });

  assert.deepEqual(result, { ok: false, reason: "timeout" });
});

test("Telegram delivery reports network failures without exposing credentials", async () => {
  const result = await deliverTelegramLead("test", credentials, async () => {
    throw new Error("https://api.telegram.org/bottest-token/sendMessage");
  });

  assert.deepEqual(result, { ok: false, reason: "network" });
});
