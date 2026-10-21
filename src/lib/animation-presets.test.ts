import test from "node:test";
import assert from "node:assert/strict";

import {
  animationDurations,
  animationEasings,
  animationStagger,
  animationVariants,
  getMotionTier,
  reducedMotionSettings,
} from "./animation-presets.ts";

test("animation presets expose the shared motion vocabulary", () => {
  assert.equal(animationDurations.base, 520);
  assert.equal(animationEasings.entrance, "cubic-bezier(0.23, 1, 0.32, 1)");
  assert.deepEqual(Object.keys(animationVariants).sort(), [
    "fadeIn",
    "fadeUp",
    "scaleIn",
    "slideLeft",
    "slideRight",
    "slowFloat",
    "softPulse",
    "staggerChildren",
  ]);
  assert.equal(animationVariants.fadeUp.from.transform, "translate3d(0, 18px, 0)");
  assert.equal(animationVariants.scaleIn.from.transform, "scale(0.96)");
  assert.equal(animationStagger.itemDelay, 64);
});

test("motion tiers simplify animation by viewport and reduced-motion preference", () => {
  assert.equal(getMotionTier({ width: 1280, prefersReducedMotion: false }), "full");
  assert.equal(getMotionTier({ width: 900, prefersReducedMotion: false }), "simplified");
  assert.equal(getMotionTier({ width: 390, prefersReducedMotion: false }), "minimal");
  assert.equal(getMotionTier({ width: 1280, prefersReducedMotion: true }), "reduced");
  assert.equal(reducedMotionSettings.disableTransforms, true);
  assert.equal(reducedMotionSettings.disableLoopingMotion, true);
});
