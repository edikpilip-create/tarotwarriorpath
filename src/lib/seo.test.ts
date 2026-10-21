import test from "node:test";
import assert from "node:assert/strict";

import { loadDictionary } from "./i18n/load-dictionary.ts";
import {
  buildLocaleMetadata,
  buildRobotsPolicy,
  buildSitemapEntries,
  getSiteUrl,
  isIndexingEnabled,
} from "./seo.ts";

test("buildLocaleMetadata returns localized canonical and alternate language links", async () => {
  const dictionary = await loadDictionary("en");
  const metadata = buildLocaleMetadata("en", dictionary, "https://artofseeing.example");

  assert.equal(metadata.alternates?.canonical, "/en");
  assert.equal(metadata.alternates?.languages?.ru, "/ru");
  assert.equal(metadata.openGraph?.locale, "en_US");
});

test("buildSitemapEntries emits one entry per supported locale", () => {
  const entries = buildSitemapEntries("https://artofseeing.example");

  assert.deepEqual(
    entries.map((entry) => entry.url),
    [
      "https://artofseeing.example/en",
      "https://artofseeing.example/uk",
      "https://artofseeing.example/ru",
    ],
  );
});

test("getSiteUrl rejects a missing production URL", () => {
  assert.throws(
    () => getSiteUrl({ NODE_ENV: "production" }),
    /NEXT_PUBLIC_SITE_URL/,
  );
});

test("getSiteUrl normalizes a configured URL", () => {
  assert.equal(
    getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://artofseeing.test/" }),
    "https://artofseeing.test",
  );
});

test("getSiteUrl uses Vercel production hostname without a custom URL", () => {
  assert.equal(
    getSiteUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "tarotwarriorpath.vercel.app",
      VERCEL_URL: "tarotwarriorpath-build.vercel.app",
    }),
    "https://tarotwarriorpath.vercel.app",
  );
});

test("getSiteUrl uses the preview hostname instead of the production hostname", () => {
  assert.equal(
    getSiteUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "tarotwarriorpath.com",
      VERCEL_URL: "tarot-preview.vercel.app",
    }),
    "https://tarot-preview.vercel.app",
  );
});

test("getSiteUrl prefers an explicit canonical URL over Vercel hostnames", () => {
  assert.equal(
    getSiteUrl({
      NEXT_PUBLIC_SITE_URL: "https://tarotwarriorpath.com/",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "tarotwarriorpath.vercel.app",
    }),
    "https://tarotwarriorpath.com",
  );
});

test("getSiteUrl uses the deployment hostname for a custom Vercel environment", () => {
  assert.equal(
    getSiteUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      VERCEL_TARGET_ENV: "staging",
      VERCEL_PROJECT_PRODUCTION_URL: "tarotwarriorpath.com",
      VERCEL_URL: "tarot-staging.vercel.app",
    }),
    "https://tarot-staging.vercel.app",
  );
});

test("getSiteUrl falls back to the deployment hostname on a first production build", () => {
  assert.equal(
    getSiteUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      VERCEL_URL: "tarot-first-build.vercel.app",
    }),
    "https://tarot-first-build.vercel.app",
  );
});

test("getSiteUrl rejects a preview without its own URL", () => {
  assert.throws(
    () => getSiteUrl({
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "tarotwarriorpath.com",
    }),
    /NEXT_PUBLIC_SITE_URL/,
  );
});

test("only an explicit production deployment enables indexing", () => {
  assert.equal(isIndexingEnabled({ DEPLOYMENT_ENV: "production" }), true);
  assert.equal(isIndexingEnabled({ DEPLOYMENT_ENV: "preview" }), false);
  assert.equal(isIndexingEnabled({}), false);
});

test("Vercel production enables indexing unless explicitly disabled", () => {
  assert.equal(isIndexingEnabled({ VERCEL_ENV: "production" }), true);
  assert.equal(isIndexingEnabled({
    VERCEL_ENV: "production",
    DEPLOYMENT_ENV: "preview",
  }), false);
});

test("Vercel previews and custom environments cannot enable production indexing", () => {
  for (const vercelEnvironment of ["preview", "development"]) {
    const env = { VERCEL_ENV: vercelEnvironment, DEPLOYMENT_ENV: "production" };

    assert.equal(isIndexingEnabled(env), false);
    assert.deepEqual(buildRobotsPolicy(env, "https://tarot-preview.vercel.app").rules, {
      userAgent: "*",
      disallow: "/",
    });
  }

  assert.equal(isIndexingEnabled({
    VERCEL_ENV: "production",
    VERCEL_TARGET_ENV: "staging",
    DEPLOYMENT_ENV: "production",
  }), false);
});

test("preview metadata and robots policy prevent indexing", async () => {
  const dictionary = await loadDictionary("en");
  const metadata = buildLocaleMetadata(
    "en",
    dictionary,
    "https://preview.artofseeing.test",
    false,
  );
  const robots = buildRobotsPolicy(
    { DEPLOYMENT_ENV: "preview" },
    "https://preview.artofseeing.test",
  );

  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false,
  });
  assert.deepEqual(robots.rules, {
    userAgent: "*",
    disallow: "/",
  });
  assert.equal(robots.sitemap, undefined);
});

test("production metadata and robots policy allow indexing", async () => {
  const dictionary = await loadDictionary("en");
  const metadata = buildLocaleMetadata(
    "en",
    dictionary,
    "https://artofseeing.test",
    true,
  );
  const robots = buildRobotsPolicy(
    { DEPLOYMENT_ENV: "production" },
    "https://artofseeing.test",
  );

  assert.deepEqual(metadata.robots, {
    index: true,
    follow: true,
  });
  assert.deepEqual(robots.rules, {
    userAgent: "*",
    allow: "/",
  });
  assert.equal(robots.sitemap, "https://artofseeing.test/sitemap.xml");
});
