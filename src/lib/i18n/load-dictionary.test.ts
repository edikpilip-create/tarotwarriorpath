import test from "node:test";
import assert from "node:assert/strict";

import { loadDictionary } from "./load-dictionary.ts";

test("loadDictionary returns localized metadata and spread content", async () => {
  const en = await loadDictionary("en");
  const ru = await loadDictionary("ru");
  const uk = await loadDictionary("uk");

  assert.equal(en.locale.code, "en");
  assert.equal(ru.locale.code, "ru");
  assert.notEqual(en.meta.title, ru.meta.title);
  assert.equal(en.spread.cards.length, 21);
  assert.equal(ru.spread.cards.length, 21);
  assert.equal(en.buttons.spreadShuffle, "Shuffle cards");
  assert.equal(en.buttons.spreadReset, "New spread");
  assert.equal(ru.spread.slotPlaceholder, "Выберите карту ниже");
  assert.equal(ru.spread.selectionPrompt, "Выберите 3 карты Таро:");
  assert.equal(ru.spread.preparing, "Готовим для вас расклад");
  assert.equal(en.suitVideoCarousel.slides.length, 4);
  assert.equal(ru.suitVideoCarousel.slides.length, 4);
  assert.equal(uk.suitVideoCarousel.slides.length, 4);
  assert.equal(en.suitVideoCarousel.slides[0]?.id, "swords");
  assert.equal(en.suitVideoCarousel.slides[0]?.name, "Swords");
  assert.deepEqual(
    en.suitVideoCarousel.slides.map((slide) => slide.videoSrc),
    [
      "/media/suit-carousel/raven.mp4",
      "/media/suit-carousel/pantera.mp4",
      "/media/suit-carousel/buffalo.mp4",
      "/media/suit-carousel/dophine.mp4"
    ]
  );
  assert.equal(en.feedback.api.validation.length > 0, true);
});
