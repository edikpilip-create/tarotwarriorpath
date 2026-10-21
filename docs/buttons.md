# Button Inventory

This document tracks every interactive button or link currently rendered by the localized landing page.

Current scope:
- Header brand link
- Header navigation links
- Header language switcher links
- Hero CTA
- Hero orbit visual buttons
- Spread draw button
- Contact form submit button

There are currently no dedicated carousel control buttons, modal buttons, or secondary form buttons in the UI.

## Inventory

| Button ID | Visible label source | Purpose | Location / section | Action | Related event handler | Related file / component | CSS class | Telegram / source tracking role |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `brand-home` | `buttons.brand` | Return to the top of the page | Header / global nav | Anchor jump to `#top` | Native anchor navigation | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:210) | `.brand` | None |
| `nav-wisdom` | `buttons.navWisdom` | Jump to the wisdom section | Header burger menu | Anchor jump to `#wisdom` | Native anchor navigation | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:215) | `.site-nav-links a` | None |
| `nav-structure` | `buttons.navStructure` | Jump to the deck structure section | Header burger menu | Anchor jump to `#structure` | Native anchor navigation | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:218) | `.site-nav-links a` | None |
| `nav-spread` | `buttons.navSpread` | Jump to the spread section | Header burger menu | Anchor jump to `#spread` | Native anchor navigation | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:221) | `.site-nav-links a` | None |
| `nav-contact` | `buttons.navContact` | Jump to the contact form | Header burger menu | Anchor jump to `#contact` | Native anchor navigation | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:224) | `.site-nav-links a` | Indirect fallback source section for form submission when no hash is present |
| `lang-switch-en` | `languageSwitcher.labels.en` | Switch to the English locale while preserving the current hash section | Header / language switcher | Route change via `buildLanguageSwitcherPath(pathname, "en", hash)` | Next `Link` navigation | [src/components/language-switcher.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/language-switcher.tsx:14) | `.language-switcher a` | None |
| `lang-switch-uk` | `languageSwitcher.labels.uk` | Switch to the Ukrainian locale while preserving the current hash section | Header / language switcher | Route change via `buildLanguageSwitcherPath(pathname, "uk", hash)` | Next `Link` navigation | [src/components/language-switcher.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/language-switcher.tsx:14) | `.language-switcher a` | None |
| `lang-switch-ru` | `languageSwitcher.labels.ru` | Switch to the Russian locale while preserving the current hash section | Header / language switcher | Route change via `buildLanguageSwitcherPath(pathname, "ru", hash)` | Next `Link` navigation | [src/components/language-switcher.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/language-switcher.tsx:14) | `.language-switcher a` | None |
| `hero-draw-spread` | `buttons.heroCta` | Former hero CTA, no longer rendered | Hero / first screen | Removed from UI | None | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:164) | `.primary-link` | None |
| `hero-orbit-find-out` | `buttons.heroOrbitFindOut` | Move the visitor from the hero to the split/wisdom section | Hero / first screen | Anchor jump to `#split-section` | Native anchor navigation | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:164) | `.hero-orbit-button.hero-orbit-button--find-out` | None |
| `hero-orbit-spread` | `buttons.heroOrbitSpread` | Move the visitor from the hero to the spread section | Hero / first screen | Anchor jump to `#spread` | Native anchor navigation | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:164) | `.hero-orbit-button.hero-orbit-button--spread` | None |
| `hero-orbit-buy` | `buttons.heroOrbitBuy` | Move the visitor from the hero to the lead form | Hero / first screen | Anchor jump to `#lead-form` | Native anchor navigation | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:164) | `.hero-orbit-button.hero-orbit-button--buy` | None |
| `spread-draw` | `buttons.spreadDraw` | Randomly draw 3 cards from the localized spread deck | Spread / `#spread` | Button click updates spread state and scrolls results into view | `drawCards()` | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:121) | `.draw-button` | None |
| `submit-lead-form` | `buttons.submitIdle` / `buttons.submitSending` | Submit the contact form to the internal Telegram API route | Contact / `#contact` | POST to `/api/telegram` with contact data plus source metadata | `submitLead()` | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:155) | `.lead-form button` | Primary tracked button. Passed to `getRequestSource()` as `sourceButton` |

## Form Registry

| Form ID | Purpose | Related file | Telegram / source tracking role |
| --- | --- | --- | --- |
| `lead-form` | Contact / inquiry form | [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:422) | Passed to `getRequestSource()` as `sourceForm` |

## Source Of Truth

- Stable button IDs live in [src/lib/buttons.ts](C:/Users/edikp/Desktop/artofseeing/src/lib/buttons.ts:3).
- Language switcher labels live in:
  - [src/data/locales/en.json](C:/Users/edikp/Desktop/artofseeing/src/data/locales/en.json:19)
  - [src/data/locales/uk.json](C:/Users/edikp/Desktop/artofseeing/src/data/locales/uk.json:19)
  - [src/data/locales/ru.json](C:/Users/edikp/Desktop/artofseeing/src/data/locales/ru.json:19)
- Main page button labels live in each locale file under `buttons.*`.

## How To Edit Existing Buttons

- To rename a visible label, edit the relevant locale JSON entry rather than hardcoding text in a component.
- To change a target hash or stable button ID, edit [src/lib/buttons.ts](C:/Users/edikp/Desktop/artofseeing/src/lib/buttons.ts:3).
- To change the language-switch destination logic, edit [src/lib/i18n/config.ts](C:/Users/edikp/Desktop/artofseeing/src/lib/i18n/config.ts:81) and [src/components/language-switcher.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/language-switcher.tsx:14).

## How To Add A New Button

1. Add a stable ID to [src/lib/buttons.ts](C:/Users/edikp/Desktop/artofseeing/src/lib/buttons.ts:3).
2. Add the visible label to every locale dictionary if the label is user-facing.
3. Render the button in the relevant component and attach `data-button-id` when useful for inspection or future tracking.
4. If the button submits a tracked request, pass its ID into `getRequestSource(...)`.
5. Add the new button to this document.

## Telegram Tracking Example

The contact submit flow uses:
- `sourceForm = "lead-form"`
- `sourceButton = "submit-lead-form"`

That payload is created in [src/components/home-page-client.tsx](C:/Users/edikp/Desktop/artofseeing/src/components/home-page-client.tsx:160) and normalized by [src/lib/telegram-source.ts](C:/Users/edikp/Desktop/artofseeing/src/lib/telegram-source.ts:21).
