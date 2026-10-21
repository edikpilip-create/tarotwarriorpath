import test from "node:test";
import assert from "node:assert/strict";

import { getInitialSpreadState, getSpreadResultsScrollTop } from "./spread-view.ts";

test("getInitialSpreadState starts screen 10 with no visible cards", () => {
  assert.deepEqual(getInitialSpreadState(), []);
});

test("getSpreadResultsScrollTop aligns the results block below the fixed header", () => {
  const scrollTop = getSpreadResultsScrollTop({
    elementTop: 1200,
    offset: 96,
  });

  assert.equal(scrollTop, 1104);
});

test("getSpreadResultsScrollTop never returns a negative scroll position", () => {
  const scrollTop = getSpreadResultsScrollTop({
    elementTop: 120,
    offset: 160,
  });

  assert.equal(scrollTop, 0);
});
