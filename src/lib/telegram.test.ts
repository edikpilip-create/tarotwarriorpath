import test from "node:test";
import assert from "node:assert/strict";

import { formatTelegramMessage, validateLeadPayload } from "./telegram.ts";

test("validateLeadPayload rejects incomplete submissions with a localized message", () => {
  const result = validateLeadPayload({
    name: " ",
    contact: "",
    languageCode: "en",
  });

  assert.deepEqual(result, {
    ok: false,
    status: 400,
    message: "Please provide a name and contact.",
  });
});

test("validateLeadPayload normalizes a valid multilingual lead payload", () => {
  const result = validateLeadPayload({
    name: " Mira ",
    contact: " @mira ",
    message: " Looking for guidance ",
    languageCode: "ru",
    languageName: "Русский",
    sourceUrl: "/ru#spread",
    sourceScreen: "spread",
    sourceForm: "lead-form",
    sourceButton: "submit-lead-form",
    timestamp: "2026-01-01T12:00:00.000Z",
  });

  assert.equal(result.ok, true);

  if (!result.ok) {
    return;
  }

  assert.equal(result.data.name, "Mira");
  assert.equal(result.data.contact, "@mira");
  assert.equal(result.data.message, "Looking for guidance");
  assert.equal(result.data.sourceScreen, "spread");
});

test("validateLeadPayload rejects oversized lead payload fields", () => {
  const result = validateLeadPayload({
    name: "M".repeat(121),
    contact: "@mira",
    languageCode: "en",
    sourceUrl: "/en#contact",
    sourceScreen: "contact",
    sourceForm: "lead-form",
    sourceButton: "submit-lead-form",
    timestamp: "2026-01-01T12:00:00.000Z",
  });

  assert.deepEqual(result, {
    ok: false,
    status: 400,
    message: "Please provide a name and contact.",
  });
});

test("formatTelegramMessage escapes html and includes request source context", () => {
  const text = formatTelegramMessage({
    name: "<Mira>",
    contact: "@mira",
    message: "Advice & guidance",
    languageCode: "en",
    languageName: "English",
    sourceUrl: "/en#spread",
    sourceScreen: "spread",
    sourceForm: "lead-form",
    sourceButton: "submit-lead-form",
    timestamp: "2026-01-01T12:00:00.000Z",
  });

  assert.match(text, /&lt;Mira&gt;/);
  assert.match(text, /<b>Язык:<\/b> English \(en\)/);
  assert.match(text, /<b>Источник:<\/b> \/en#spread/);
  assert.match(text, /Advice &amp; guidance/);
});
