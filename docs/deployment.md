# Docker / Dokploy Deployment Guide

Vercel is the primary hosting target. For importing the GitHub repository into Vercel, follow [vercel.md](vercel.md). This document preserves the optional self-hosted Docker/Dokploy deployment path.

## Runtime Contract

CI and Docker pin Node.js `22.22.3` and npm `10.9.8`. `package.json` allows the compatible Node.js `22.x` and npm `10.x` release lines, so Vercel can apply managed patch updates.

The application uses Next.js App Router with standalone output outside Vercel. Vercel uses its native Next.js integration instead. Localized pages live under `src/app/(localized)/[lang]`, the root route redirects visitors to a locale, and `POST /api/telegram` handles lead delivery.

## Optional Self-Hosting Model

The alternative hosting model is self-hosted VPS + Dokploy + Docker.

Production canonical origin:

```text
https://tarotwarriorpath.com
```

Canonical hostname:

```text
tarotwarriorpath.com
```

`www.tarotwarriorpath.com` must redirect to `tarotwarriorpath.com` at the proxy, Dokploy, or DNS provider layer. Do not use fake domains in production-facing configuration.

Required VPS ports:

- `80` for HTTP and ACME HTTP challenges.
- `443` for HTTPS traffic.
- `3000` for the Dokploy panel, unless the Dokploy installation is configured differently.

Dokploy should be installed on the VPS, connected to the Git repository, and configured to deploy this app from the repository Dockerfile. Production secrets must be configured in the Dokploy UI, not stored in Git.

## Environment Contract

Start from `.env.example`. Never commit `.env`, `.env.local`, or deployment secrets.

| Variable | Required | Scope | Production value |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes for builds and production | Build and runtime | `https://tarotwarriorpath.com` |
| `DEPLOYMENT_ENV` | Yes for deployment | Build and runtime | `production` |
| `TELEGRAM_BOT_TOKEN` | Yes for live lead delivery | Runtime secret | Real bot token in Dokploy UI only |
| `TELEGRAM_CHAT_ID` | Yes for live lead delivery | Runtime secret | Real chat ID in Dokploy UI only |
| `TURNSTILE_SITE_KEY` | Not active yet | Future build/runtime value | Placeholder until Turnstile is implemented |
| `TURNSTILE_SECRET_KEY` | Not active yet | Future runtime secret | Placeholder until Turnstile is implemented |

For local work, use `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and `DEPLOYMENT_ENV=development`.

Outside Vercel, production builds fail clearly when `NEXT_PUBLIC_SITE_URL` is missing. On Vercel, the system deployment hostnames provide the fallback described in [vercel.md](vercel.md).

## Commands

Install dependencies:

```powershell
npm.cmd ci
```

Start local development:

```powershell
npm.cmd run dev
```

Create a production build:

```powershell
npm.cmd run build
```

Run the same checks enforced by CI:

```powershell
npm.cmd ci
npm.cmd run test
npm.cmd run lint
$env:NEXT_PUBLIC_SITE_URL="http://localhost:3000"; $env:DEPLOYMENT_ENV="preview"; npm.cmd run build
```

Start the built production server:

```powershell
npm.cmd start
```

## CI Enforcement

GitHub Actions runs `.github/workflows/ci.yml` on pull requests and pushes to `main`, `master`, and `codex/**` branches. The workflow uses Node.js `22.22.3`, installs npm `10.9.8`, checks both runtime versions, installs with `npm ci`, runs `npm run test`, runs `npm run lint`, and builds with `DEPLOYMENT_ENV=preview` plus `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

The preview-mode build keeps CI non-indexable while still exercising the production Next.js build pipeline.

## Docker Deploy Flow

The repository Dockerfile is the primary deployment path for Dokploy. It builds a standalone Next.js server and copies the required assets:

- `.next/standalone`
- `.next/static`
- `public`

The container defaults to:

```text
HOSTNAME=0.0.0.0
PORT=3000
```

Build an immutable image. SEO metadata and robots output are generated during the build, so the canonical URL and deployment environment must be provided as build arguments.

```powershell
docker build `
  --build-arg NEXT_PUBLIC_SITE_URL=https://tarotwarriorpath.com `
  --build-arg DEPLOYMENT_ENV=production `
  --tag artofseeing:<git-sha> .
```

Run the image with the same public values and runtime secrets:

```powershell
docker run --detach `
  --name artofseeing `
  --publish 3000:3000 `
  --env NEXT_PUBLIC_SITE_URL=https://tarotwarriorpath.com `
  --env DEPLOYMENT_ENV=production `
  --env TELEGRAM_BOT_TOKEN=<dokploy-secret> `
  --env TELEGRAM_CHAT_ID=<dokploy-secret> `
  artofseeing:<git-sha>
```

For staging or preview, use the real preview origin and set `DEPLOYMENT_ENV=preview` or `staging` in both commands.

## Dokploy VPS Deployment

1. Install Dokploy on the VPS.
2. Confirm ports `80`, `443`, and the Dokploy panel port `3000` are open.
3. Create an app in Dokploy from the Git repository.
4. Select Dockerfile-based deployment from the repository root.
5. Configure build arguments:
   - `NEXT_PUBLIC_SITE_URL=https://tarotwarriorpath.com`
   - `DEPLOYMENT_ENV=production`
6. Configure runtime environment variables in the Dokploy UI:
   - `NEXT_PUBLIC_SITE_URL=https://tarotwarriorpath.com`
   - `DEPLOYMENT_ENV=production`
   - `TELEGRAM_BOT_TOKEN=<real secret>`
   - `TELEGRAM_CHAT_ID=<real secret>`
   - `TURNSTILE_SITE_KEY=<placeholder until implemented>`
   - `TURNSTILE_SECRET_KEY=<placeholder until implemented>`
7. Configure `tarotwarriorpath.com` as the production domain.
8. Configure `www.tarotwarriorpath.com` to redirect to `tarotwarriorpath.com`.
9. Enable HTTPS for the production domain.
10. Deploy from the selected Git commit.

Do not paste secrets into `Dockerfile`, `.env.example`, `README.md`, this document, or Git commit messages.

## Docker Compose

No `docker-compose.yml` is required for the current Dokploy path. Dokploy can build and run the app directly from the Dockerfile, and its proxy should manage public domain routing. Add Compose later only if Dokploy needs an explicit compose project for this app.

## Indexing Policy

Indexing is opt-in. `DEPLOYMENT_ENV=production` produces `index, follow` page metadata, allows crawling in `robots.txt`, and publishes the sitemap location.

Every other value, including a missing value, `development`, `preview`, or `staging`, produces `noindex, nofollow` page metadata and `Disallow: /` in `robots.txt`. `NODE_ENV` is intentionally not used for this decision because preview servers also run optimized production builds.

Changing `DEPLOYMENT_ENV` requires a rebuild because metadata and robots output may be statically generated.

## Root Redirect Policy

The existing behavior remains in place. A request to `/` reads the `Accept-Language` header, selects the first supported language among English, Ukrainian, and Russian, and redirects to `/en`, `/uk`, or `/ru`. Unsupported or missing language preferences fall back to `/en`.

This keeps locale-specific URLs canonical and avoids publishing duplicate content at `/`. Language selection is not persisted in a cookie; visitors can use the language switcher after redirect.

## Rollback Basics

Tag every image with an immutable Git commit SHA or release identifier. Keep at least the previous known-good image available.

To roll back:

1. Stop routing traffic to the failed container.
2. Start the previous image with the same production environment variables and secrets.
3. Verify `/robots.txt`, `/sitemap.xml`, all locale routes, and a Telegram lead submission.
4. Restore traffic only after smoke tests pass.
5. Preserve failed deployment logs for diagnosis; do not print Telegram or Turnstile secrets.

If the domain or `NEXT_PUBLIC_SITE_URL` changed, use an image built for that exact origin. Rolling back code while keeping metadata generated for another domain is not safe.

## Post-Deploy Smoke Test

- Confirm `/` returns a redirect to one of `/en`, `/uk`, or `/ru`.
- Confirm `/en`, `/uk`, and `/ru` return HTTP 200 and display the correct language.
- Confirm static files under `/_next/static` and key images under `/media` load successfully.
- Confirm the browser console has no client errors.
- Draw a spread and verify three cards render.
- Submit valid contact data and confirm the UI reports success.
- Confirm the lead arrives in the configured Telegram chat with source metadata.
- Submit invalid data and confirm the API rejects it without sending to Telegram.
- Confirm `/robots.txt` allows crawling in production.
- Confirm `/sitemap.xml` contains `/en`, `/uk`, and `/ru` on `https://tarotwarriorpath.com`.
- Review server logs for configuration errors and upstream Telegram failures.

## Custom Domain Checklist

- Point the apex DNS record for `tarotwarriorpath.com` to the Dokploy VPS.
- Point `www.tarotwarriorpath.com` to the same deployment target or redirect provider.
- Enable TLS and verify the certificate covers the apex hostname.
- Redirect `www.tarotwarriorpath.com` to `tarotwarriorpath.com`.
- Set `NEXT_PUBLIC_SITE_URL=https://tarotwarriorpath.com` with no path or trailing slash.
- Rebuild and redeploy after changing the canonical origin.
- Verify locale canonical URLs and `hreflang` alternates use the apex hostname.
- Verify Telegram source URLs use the apex hostname.

## SEO Verification Checklist

- In production, confirm `/robots.txt` allows `/` and references `/sitemap.xml`.
- In preview or staging, confirm `/robots.txt` disallows `/`.
- Confirm `/sitemap.xml` contains `/en`, `/uk`, and `/ru` on the correct origin.
- Inspect each locale page for its canonical URL and `en`, `uk`, `ru`, and `x-default` alternates.
- Confirm production pages emit `index, follow`; preview pages emit `noindex, nofollow`.
- Confirm the localized title and description match the visible language.
- Confirm Open Graph and Twitter metadata resolve the current image and canonical origin.
- Confirm `/favicon.svg` is reachable.
- Test the production URL with the search engine and social preview tools used by the team.

## SEO Production Inputs

The locale dictionaries in `src/data/locales/*.json` are the source of truth.

Title policy: each locale uses a concise localized product name followed by a page qualifier. Keep titles distinct by locale and avoid keyword repetition.

Description policy: summarize the deck, awareness practice, and interactive spread in the page language. Keep the description accurate to visible content and suitable for a search snippet.

Open Graph image policy: `public/og.svg` is the current shared 1200 by 630 source. Replace it only with an approved production asset at the same social-preview aspect ratio, and update localized alt text in every dictionary.

Favicon policy: `public/favicon.svg` is the canonical favicon. Keep the symbol legible at small sizes and add raster or platform-specific variants only when a deployment target requires them.

Brand naming by locale is maintained in the locale dictionaries. Metadata changes must be made in all three locale dictionaries unless the difference is intentional.

## Analytics Contract

`src/lib/analytics.ts` defines a provider-neutral `trackEvent` helper. It is currently a safe no-op: no analytics script is loaded and no network request is sent.

The conversion model is documented in `docs/conversion-model.md`. The primary macro conversion is `generate_lead`, which must be emitted only after confirmed Telegram delivery.

Provider selection, consent handling, GA4/GTM setup, and key-event marking belong to the later observability task. Do not send names, contact details, messages, Telegram identifiers, IP addresses, Turnstile tokens, or other personal data to analytics.

## Planned Anti-Spam Strategy

Turnstile is intentionally not wired yet. The planned lead-form protection has two independent controls:

1. Cloudflare Turnstile verifies that a browser interaction is legitimate. The client will request a short-lived token with `TURNSTILE_SITE_KEY`, submit it with the lead payload, and the Telegram route will verify it server-side with `TURNSTILE_SECRET_KEY` before sending any message. Missing, expired, duplicate, or failed tokens will be rejected.
2. Server-side rate limiting restricts repeated submissions even when Turnstile succeeds. The limit should use a privacy-conscious hash of the client IP plus a short time window, return HTTP 429 when exceeded, and use a shared store in multi-instance deployments.

Implementation requirements for the later anti-spam task:

- Verify Turnstile before calling Telegram.
- Apply rate limiting before expensive upstream requests.
- Fail closed when Turnstile verification is unavailable in production.
- Keep development bypasses explicit and disabled in production.
- Never log secrets, raw Turnstile tokens, contact fields, or unredacted IP addresses.
- Add localized error states for challenge failure and rate limiting.
- Track only the coarse `lead_submit_error` category without personal data.
