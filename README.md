# TARO "The Path of the Warrior"

Multilingual landing page for an author tarot deck, built with Next.js App Router, React, TypeScript, and Tailwind CSS.

## GitHub Destination

This Tarot project (`artofseeingtest`, local folder `F:\artofseeing`) is published only to [edikpilip-create/tarotwarriorpath](https://github.com/edikpilip-create/tarotwarriorpath). Both the fetch URL and the single push URL for `origin` must point to this repository.

The separate Olga Massage Site project is published to a repository owned by `dominikwood` through collaboration from the user's personal account. Keep its code and repository configuration separate from this project.

Before publishing, check `git remote -v`. Do not publish this project to the former `edikpilip-create/tarot` repository or to the massage project's repository. Use repository-local Git settings so account and destination changes do not affect other projects.

## Runtime

Use Node.js `22.x` and npm `10.x`. CI and Docker retain the reproducible Node.js `22.22.3` / npm `10.9.8` pins; Vercel manages Node.js patch updates within `22.x`.

## Deployment Target

The primary deployment target is Vercel, importing the existing `edikpilip-create/tarotwarriorpath` repository and its `main` branch. Follow [the Vercel setup guide](docs/vercel.md) for exact import settings and Telegram environment variables.

The first deployment can use the assigned `vercel.app` hostname. After connecting `tarotwarriorpath.com`, set it as the production canonical origin; redirect `www.tarotwarriorpath.com` to the apex hostname in Vercel's domain settings. Docker/Dokploy remains an optional alternative in [the self-hosting guide](docs/deployment.md).

## Local Development

Create `.env.local` from `.env.example`, set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and `DEPLOYMENT_ENV=development`, and add Telegram credentials when testing lead delivery.

```powershell
npm.cmd ci
npm.cmd run test
npm.cmd run lint
npm.cmd run build
npm.cmd run dev
```

The localized pages are:

- `/en`
- `/uk`
- `/ru`

The root route `/` detects `Accept-Language` and redirects to a supported locale, falling back to `/en`.

## Architecture

- `src/app/(localized)/[lang]/page.tsx` loads a locale dictionary and localized assets.
- `src/components/home-page-client.tsx` contains the interactive landing page and lead form.
- `src/data/locales/*.json` contains localized copy and metadata.
- `src/app/api/telegram/route.ts` validates and sends lead submissions to Telegram.
- `src/lib/seo.ts` owns canonical URLs, localized metadata, indexing policy, robots policy, and sitemap entries.
- `src/lib/analytics.ts` defines the planned analytics event contract without loading a provider.
- `public/media` contains visual assets.

## Production

Vercel import settings, environment variables, domains, preview indexing, and post-deployment checks are documented in [docs/vercel.md](docs/vercel.md). Optional Docker commands, rollback, SEO policy, analytics events, and the anti-spam plan remain documented in [docs/deployment.md](docs/deployment.md).

The conversion model, macro conversion rule, privacy-safe analytics parameters, and design inputs for staging QA are documented in `docs/conversion-model.md`.
