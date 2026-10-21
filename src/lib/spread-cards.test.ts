import test from "node:test";
import assert from "node:assert/strict";

import { createSpreadCards, drawSpreadCards, shuffleSpreadCards, spreadCardIds } from "./spread-cards.ts";

test("spreadCardIds preserves the canonical 21-card order", () => {
  assert.equal(spreadCardIds.length, 21);
  assert.equal(spreadCardIds[0], "mag");
  assert.equal(spreadCardIds[20], "world");
});

test("createSpreadCards combines localized copy with ordered image fallbacks", () => {
  const cards = createSpreadCards([
    {
      id: "mag",
      title: "The Magician",
      description: "Focus your attention.",
      imageAlt: "The Magician card art",
    },
    {
      id: "high-priestess",
      title: "The High Priestess",
      description: "Trust silent knowledge.",
      imageAlt: "The High Priestess card art",
      imageSrc: "/media/locales/en/spread-card-02.webp",
    },
  ]);

  assert.deepEqual(cards, [
    {
      id: "mag",
      title: "The Magician",
      description: "Focus your attention.",
      imageSrc: "/media/tarot-magician.jpg",
      imageAlt: "The Magician card art",
    },
    {
      id: "high-priestess",
      title: "The High Priestess",
      description: "Trust silent knowledge.",
      imageSrc: "/media/locales/en/spread-card-02.webp",
      imageAlt: "The High Priestess card art",
    },
  ]);
});

test("drawSpreadCards returns three unique cards without mutating the source deck", () => {
  const sourceCards = createSpreadCards(
    spreadCardIds.map((id, index) => ({
      id,
      title: `Card ${index + 1}`,
      description: `Description ${index + 1}`,
      imageAlt: `Alt ${index + 1}`,
    })),
  );

  const originalIds = sourceCards.map((card) => card.id);
  const drawnCards = drawSpreadCards(sourceCards, 3, () => 0.5);

  assert.equal(drawnCards.length, 3);
  assert.equal(new Set(drawnCards.map((card) => card.id)).size, 3);
  assert.deepEqual(sourceCards.map((card) => card.id), originalIds);
});

test("shuffleSpreadCards returns a deterministic full unique deck without mutating the source deck", () => {
  const sourceCards = createSpreadCards(
    spreadCardIds.map((id, index) => ({
      id,
      title: `Card ${index + 1}`,
      description: `Description ${index + 1}`,
      imageAlt: `Alt ${index + 1}`,
    })),
  );

  const originalIds = sourceCards.map((card) => card.id);
  const randomValues = [0.1, 0.7, 0.25, 0.9];
  let randomIndex = 0;
  const shuffledCards = shuffleSpreadCards(sourceCards, () => {
    const value = randomValues[randomIndex % randomValues.length] ?? 0;
    randomIndex += 1;
    return value;
  });

  assert.equal(shuffledCards.length, 21);
  assert.equal(new Set(shuffledCards.map((card) => card.id)).size, 21);
  assert.notDeepEqual(shuffledCards.map((card) => card.id), originalIds);
  assert.deepEqual(sourceCards.map((card) => card.id), originalIds);
});
