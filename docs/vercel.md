# Deploy the Tarot website to Vercel

## Import the existing GitHub repository

Use [Vercel New Project](https://vercel.com/new) and import the existing repository **edikpilip-create/tarotwarriorpath**. Its production branch is **main**. Authorize access to this repository in the GitHub integration if it is not listed. Do not create or clone another GitHub repository.

This is the Tarot / artofseeingtest website. The separate Olga Massage Site project belongs to the `dominikwood` collaboration and must remain a separate Vercel project and GitHub repository.

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | Repository root (leave the default; do not select `src` or enter a local drive path) |
| Production Branch | `main` |
| Node.js Version | `22.x` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Leave the Next.js default |

The committed `vercel.json` selects the framework and commands. Vercel manages the server and API functions; no start command, Dockerfile, VPS, custom rewrites, or static export is needed. Keep the automatic exposure of system environment variables enabled in the project settings.

## Environment variables

Add variables in the project's environment settings before deploying. Local `.env` files are ignored by Git and are not transferred by a GitHub import. Never use a `NEXT_PUBLIC_` prefix for Telegram secrets.

| Variable | Scope | Value / behavior |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | Production; optionally Preview | The real bot token, stored as a server secret |
| `TELEGRAM_CHAT_ID` | Production; optionally Preview | The destination chat ID, stored as a server secret |
| `NEXT_PUBLIC_SITE_URL` | Optional; Production only for a custom domain | Full connected canonical origin, such as `https://tarotwarriorpath.com`, without a trailing slash |
| `DEPLOYMENT_ENV` | Optional | Usually leave unset on Vercel. Set `preview` in Production to keep the public deployment non-indexable until launch |

The first build can succeed without custom variables because Vercel supplies the hostname. Actual lead delivery requires both Telegram variables. Do not copy placeholder secrets from `.env.example`. Preview submissions reach the configured chat too; use a test bot/chat if preview lead testing is needed.

URL resolution prefers `NEXT_PUBLIC_SITE_URL`. Otherwise production uses `https://VERCEL_PROJECT_PRODUCTION_URL`, falling back to `https://VERCEL_URL` on a first build. Preview and custom environments use `https://VERCEL_URL`. These values are supplied automatically by Vercel; do not enter literal variable names or invented hostnames in the dashboard.

Indexing follows Vercel's deployment environment when `DEPLOYMENT_ENV` is unset. Production is indexable; Preview, Development, and custom environments are always blocked, even if `DEPLOYMENT_ENV=production` was copied into them. An explicit non-production `DEPLOYMENT_ENV` can also disable indexing in Production.

The Turnstile variables in `.env.example` are reserved for a future feature and are not required for deployment. Redeploy after changing variables because metadata and crawl policies are generated during the build.

## First deployment and custom domain

After adding Telegram variables, deploy the project. Open the actual assigned `vercel.app` address from the completed deployment; the code uses that hostname automatically. All three language pages and `/api/telegram` are served from the same project.

When the custom domain is ready, add `tarotwarriorpath.com` in this Vercel project's domain settings and apply the exact DNS records shown there. Configure `www.tarotwarriorpath.com` to redirect to the apex domain. Only after connecting the domain, set `NEXT_PUBLIC_SITE_URL=https://tarotwarriorpath.com` for Production and redeploy. Keep the variable unset in Preview so metadata uses each preview's own hostname.

Subsequent pushes to `main` deploy production automatically after the GitHub integration is connected. Other branches produce previews. Push this project's code only to `edikpilip-create/tarotwarriorpath`.

## Verify the completed deployment

Open `/en`, `/uk`, and `/ru` and confirm their existing localized titles, Open Graph metadata, matching page language, and working media. The root `/` should redirect to a supported language. Check that `/robots.txt` and `/sitemap.xml` return HTTP 200 and that the sitemap and canonical URLs use the real deployed domain.

On Production, robots should allow crawling unless indexing was deliberately disabled. On Preview, robots must disallow `/` and page metadata must contain `noindex`. Submit one clearly labeled test request through the form after configuring Telegram, confirm successful feedback, and verify receipt in the intended chat.

If the site builds but the form fails, check both Telegram variables in the deployed environment and redeploy. Inspect function logs without copying secrets into an issue or chat. If an old canonical domain appears, check the Production override and rebuild.

## Local verification and alternative hosting

Run tests and builds sequentially because the integration test recreates `.next`. Use Node.js `22.x` and npm `10.x`; CI and Docker retain exact version pins. A local Vercel-mode smoke test can set `VERCEL=1`, `VERCEL_ENV=preview`, and a test `VERCEL_URL`, then run `npm run build`. This is not a live Vercel deployment.

Outside Vercel, standalone output remains enabled, and `npm start` runs the standalone server. See [deployment.md](deployment.md) for Docker/Dokploy commands. Do not set `VERCEL=1` for those builds.

Official references: [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables), [supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), and [environment variable scopes](https://vercel.com/docs/environment-variables).
