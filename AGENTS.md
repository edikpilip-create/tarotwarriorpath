# Project Guide

## GitHub Repository Boundary

- This project is the Tarot / artofseeingtest website, currently at `F:\artofseeing`.
- Publish this project only to `https://github.com/edikpilip-create/tarotwarriorpath.git`.
- Keep `origin` as the single publishing remote, with one push URL pointing to that repository. Do not push to the former `edikpilip-create/tarot` repository.
- The separate Olga Massage Site project is published to a repository owned by `dominikwood` through collaboration from the user's personal account. It must never receive this project's code.
- Before every push, verify the working directory, `git remote -v`, and the explicit destination branch. Push only to the Tarot repository above.
- Keep remote, branch, and account settings local to this repository. Do not change global Git settings or the separate massage project's configuration.
- Never commit `.env`, credentials, `node_modules`, or generated build output.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Server route for Telegram submission at `src/app/api/telegram/route.ts`
- Static assets in `public/media`

## Key Commands

Use `npm.cmd` on this Windows setup if PowerShell does not resolve `npm` directly.

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd start
npm.cmd run lint
```

- `npm.cmd run dev` starts the local development server with Webpack.
- `npm.cmd run build` creates a production build with Webpack.
- `npm.cmd start` runs the production server after a build.
- `npm.cmd run lint` runs ESLint across the project.

## Coding Conventions

- Prefer ASCII in code and configuration unless the file already uses Cyrillic text or another Unicode asset.
- Use `apply_patch` for manual file edits.
- Keep changes scoped to the requested section or feature.
- Preserve the existing App Router structure and local patterns.
- Keep page layout dense, dark, and editorial rather than marketing-style.
- Reuse existing CSS variables and component patterns before introducing new ones.
- Keep animations restrained and purposeful.
- Answer briefly and directly.
- When writing complex features or significant refactors, use an ExecPlan (as described in PLANS.md) from design to implementation.
- Use absolute imports through `@/*` when adding new project code.
- Do not remove user changes outside the requested scope.

## Self-Check And Testing

Before handing work back, run:

```powershell
npm.cmd run build
```

If the change affects styles or layout, also verify in the browser at `http://localhost:3000` with a hard refresh.

If the change touches the Telegram form or API route, confirm:

- the form still submits without client errors;
- `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are present in `.env`;
- the API route returns a successful response for valid data.

If the change affects SEO or metadata, confirm:

- `robots.txt` is reachable;
- `sitemap.xml` is reachable;
- the page title and Open Graph metadata still match the project.

## Notes

- Vercel is the primary hosting target; import settings and server environment variables are documented in `docs/vercel.md`.
- Keep Vercel Preview and custom environments non-indexable. Never commit `.vercel/` or environment secrets.
- `next.config.ts` uses native Next.js output when `VERCEL=1` and standalone output otherwise; preserve the Docker and integration-test path.
- Run tests and builds sequentially: `src/app/html-lang.test.ts` recreates `.next`.
- The project currently uses `next dev --webpack` and `next build --webpack` because the Windows environment here is not using the native Turbopack bindings.
- Key visual assets currently live in `public/media` and are referenced directly from the page components and CSS.
