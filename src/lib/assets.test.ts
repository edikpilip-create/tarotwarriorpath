import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getLocalizedAssets } from "./assets.ts";

test("getLocalizedAssets returns shared fallback images and localized video embeds", () => {
  const assets = getLocalizedAssets("en");

  assert.equal(assets.hero.maskSrc, "/media/warrior-mask.png");
  assert.equal(assets.carouselCards.length, 6);
  assert.equal(
    assets.carouselCards.find((card) => card.id === "card-4")?.backSrc,
    "/media/carousel-sun-back.webp",
  );
  assert.equal(assets.spreadCardImages.mag, "/media/spread-card-01.webp");
  assert.match(assets.featuredVideos.primary.embedUrl, /1196251431/);
  assert.match(assets.featuredVideos.secondary.embedUrl, /1196251432/);
});

test("getLocalizedAssets prefers localized carousel and spread images when present", () => {
  const localizedCarouselDir = join(process.cwd(), "public", "media", "locales", "en", "carousel");
  const localizedSpreadDir = join(process.cwd(), "public", "media", "locales", "en", "spread");
  const localizedCarouselFile = join(localizedCarouselDir, "carousel-lovers.webp");
  const localizedSpreadFile = join(localizedSpreadDir, "spread-card-01.webp");

  mkdirSync(localizedCarouselDir, { recursive: true });
  mkdirSync(localizedSpreadDir, { recursive: true });
  writeFileSync(localizedCarouselFile, "localized carousel asset");
  writeFileSync(localizedSpreadFile, "localized spread asset");

  try {
    const assets = getLocalizedAssets("en");

    assert.equal(assets.carouselCards[0].frontSrc, "/media/locales/en/carousel/carousel-lovers.webp");
    assert.equal(assets.spreadCardImages.mag, "/media/locales/en/spread/spread-card-01.webp");
    assert.equal(assets.carouselCards[0].backSrc, "/media/carousel-lovers-back.webp");
  } finally {
    rmSync(localizedCarouselFile, { force: true });
    rmSync(localizedSpreadFile, { force: true });
  }
});
