# Prepare the Tarot website for Vercel

This ExecPlan follows `PLANS.md` and must be maintained as implementation proceeds.

## Purpose / Big Picture

Importing `edikpilip-create/tarotwarriorpath`, branch `main`, into Vercel should build the Next.js application without requiring a custom domain first. The three language pages, media, metadata, and existing Telegram server route must remain available. Preview deployments must not become indexable even if production settings are copied into them. Deployment itself and secret transfer are outside this preparation task.

## Progress

- [x] (2026-10-21) Inspect the repository, runtime contract, SEO functions, Docker build, tests, and official Vercel documentation.
- [x] (2026-10-21) Add Vercel configuration, compatible Node.js engines, URL resolution, and indexing safeguards.
- [x] (2026-10-21) Document import settings, server secrets, domain configuration, and the separate Docker option.
- [x] (2026-10-21) Run 41 tests and lint on Node.js 22.22.3, then a successful Vercel-mode preview build and HTTP checks for pages, metadata, robots, sitemap, CSS, fonts, video ranges, redirects, and API validation.
- [x] (2026-10-21) Finalize prepared files, verify secret exclusions, and confirm the single approved Tarot publishing destination. Publication is verified against `origin/main` after the final commit.

## Surprises & Discoveries

Production builds currently require `NEXT_PUBLIC_SITE_URL`. A first Vercel import instead provides the system values `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, and the deployment environment at build time and runtime.

The integration test `src/app/html-lang.test.ts` deletes `.next` and builds a standalone server. Run it before, never concurrently with, the final Vercel-mode build. Docker also depends on standalone output, which must remain enabled outside Vercel.

The system Node.js is 24.x. Validation uses an isolated Node.js 22.22.3 / npm 10.9.8 toolchain through `npm exec --yes --package=node@22.22.3 --package=npm@10.9.8`, without changing the system runtime. All 41 tests passed on this toolchain, including the standalone integration build, and ESLint passed.

## Decision Log

- Decision: Use Vercel's Next.js integration when `VERCEL=1`, retaining standalone output otherwise.
  Rationale: Existing self-hosted builds and integration tests must remain usable.
  Date/Author: 2026-10-21 / Codex.
- Decision: An explicit site URL wins. Otherwise production uses Vercel's project production hostname and previews use their deployment hostname. Non-Vercel production builds still require an explicit URL.
  Rationale: The first Vercel deployment should build with correct absolute metadata links without weakening validation on other hosts.
  Date/Author: 2026-10-21 / Codex.
- Decision: Non-production Vercel environments always disable indexing, including custom environments. Production uses an explicit deployment override when present, otherwise Vercel's production environment.
  Rationale: Copied production settings must not expose previews to crawlers, and intentional production noindex must remain possible.
  Date/Author: 2026-10-21 / Codex.
- Decision: Publish only through `origin` at `https://github.com/edikpilip-create/tarotwarriorpath.git`.
  Rationale: The massage website belongs to a separate repository and hosting setup.
  Date/Author: 2026-10-21 / Codex.

## Outcomes & Retrospective

Configuration, documentation, and validation are complete. All 41 tests and ESLint passed on Node.js 22.22.3 / npm 10.9.8. The existing standalone integration path still works. A separate `VERCEL=1` preview build succeeded without an explicit site URL; the generated configuration had no standalone output. HTTP checks confirmed the three language pages, original localized titles and Open Graph titles, preview canonicals, noindex, robots and sitemap, CSS, fonts, image serving, video byte ranges, language redirects, and invalid-request API validation. The temporary server was stopped after checks. Vercel account setup, live deployment, DNS changes, and entering Telegram secrets remain user steps; publication of this prepared source is the last repository step.

## Context and Orientation

The repository is at `F:\artofseeing`. `next.config.ts` selects build output. `package.json` and the root package entry in `package-lock.json` declare supported engines. `src/lib/seo.ts` resolves the origin (scheme and hostname used in metadata links) and indexing policy. `src/lib/seo.test.ts` tests these behaviors. `src/app/robots.ts` and `src/app/sitemap.ts` expose crawl instructions and page URLs. `src/app/api/telegram/route.ts` already sends leads using server secrets and needs no hosting rewrite. `docs/deployment.md` describes the existing Docker option.

## Plan of Work

Create root `vercel.json` with the Next.js framework and existing npm commands. Change declared engines to Node.js `22.x` and npm `10.x`, preserving dependencies, the package manager pin, Docker pins, and CI verification. Ignore `.vercel` and environment files in Git. Select standalone output only outside Vercel.

Extend SEO helpers with system URL fallbacks and preview safeguards, and cover boundary cases in the existing tests. Add `docs/vercel.md` with import settings and a variable table. Update README and the existing deployment guide so Vercel is primary and Docker remains an alternative.

## Concrete Steps

Run all commands from `F:\artofseeing`. Run `npm.cmd test`, then `npm.cmd run lint`. Tests build and run the app on port 3100; expect all tests to pass. After those processes exit, run:

    $env:VERCEL='1'
    $env:VERCEL_ENV='preview'
    $env:VERCEL_URL='tarot-preview.vercel.app'
    $env:NEXT_PUBLIC_SITE_URL=''
    $env:DEPLOYMENT_ENV='production'
    npm.cmd run build

The hostname is a local test input, not a deployed website. Expect successful generation of localized pages, robots, and sitemap. Start the result with `node node_modules/next/dist/bin/next start --hostname ::1 --port 3100` under the same environment. Fetch pages, robots, sitemap, and a media file locally; assert HTTP 200, preview absolute links, and noindex. Stop this temporary server afterward. Never send a live Telegram message for these hosting checks.

## Validation and Acceptance

Tests must cover production and preview host selection, explicit URL overrides, missing configuration outside Vercel, preview rejection of copied indexing settings, production detection, and explicit production noindex. The final build must succeed with Vercel variables alone. HTTP checks must show matching language, unchanged localized titles and Open Graph titles, blocked robots, and sitemap URLs using the preview hostname. Standalone integration tests must still pass.

Before committing, inspect `git diff --check`, staged paths, and `git remote -v`; secrets and generated output must not be staged. Push with explicit destination `git push origin HEAD:refs/heads/main`, without force. Compare remote `main` with local HEAD and confirm a clean working tree.

## Idempotence and Recovery

Builds only regenerate ignored `.next`. Run tests and builds sequentially and avoid cleaning output used by a running server. Configuration can be reverted in a later ordinary commit. Do not modify `.env`, global Git settings, the massage site, Vercel account state, or DNS.

## Artifacts and Notes

Record final test totals, build results, HTTP evidence, and publication result below when available. The implementation uses Vercel system variables documented as available during both build and runtime.

Validation evidence:

    tests 41; pass 41; fail 0
    Vercel preview build: generated 9/9 pages successfully
    en, uk, ru: HTTP 200; localized title/OG; preview canonical; noindex; CSS 200
    robots.txt and sitemap.xml: HTTP 200; preview hostname/policy verified
    image/font: HTTP 200; video range: HTTP 206
    localized root redirect: HTTP 307; invalid lead: HTTP 400

## Interfaces and Dependencies

Keep `getSiteUrl(env?: Environment): string` and `isIndexingEnabled(env?: Environment): boolean` as public interfaces. Add no packages. Use Vercel's built-in Next.js integration. Telegram configuration remains `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` on the server only.

Revision note (2026-10-21): Initial plan, including sequential validation to avoid the previously observed shared `.next` conflict.

Revision note (2026-10-21): Implementation and validation completed on an isolated Node.js 22 toolchain. Vercel hosting and secret entry remain dashboard steps; no external deployment was created.
