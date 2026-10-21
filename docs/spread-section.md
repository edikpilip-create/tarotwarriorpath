# Spread Section Notes

This document maps the redesigned `spread-section` so it is easier to tune by hand.

## Main Files

- `src/components/home-page-client.tsx` - UI state machine, card selection, shuffle/reset handlers, JSX for the board, deck, loading overlay, and result list.
- `src/app/globals.css` - visual layout for the board, 3 slots, 21-card deck, shuffle animation, result cards, and responsive behavior.
- `src/lib/spread-cards.ts` - card creation plus full-deck shuffle helper.
- `src/lib/assets.ts` - shared back-side image path for visible deck cards.
- `src/lib/i18n/locales/*.json` - button and spread texts.
- `public/media/card-turnover-spread.png` - duplicated card-back image used by all 21 visible cards.

## Flow

The spread UI now uses three stages:

1. `selecting` - user sees the top board, 3 empty slots, 21 card backs, and the shuffle button.
2. `preparing` - after the third card click, the deck disappears and the board gets a dark overlay with the loading text.
3. `complete` - after about 2 seconds, the page scrolls to the result cards and shows the reset button.

The 21 visible cards are visually identical, but each position maps to a card from `spreadDeckOrder`. This hidden order is generated with `shuffleSpreadCards()`, so one spread cannot contain duplicate cards.

## Edit Points

- Loading duration: `spreadPreparationDelayMs` in `src/components/home-page-client.tsx`.
- Number of required slots: `spreadSlotCount` in `src/components/home-page-client.tsx`.
- Shuffle behavior: `handleShuffleSpread()`, `shuffleSpreadDeck()`, and `.spread-deck.is-shuffling .spread-deck-card`.
- Click-to-select behavior: `selectSpreadCard()`.
- Reset behavior: `resetSpread()`.
- Board and slot visuals: `.spread-board`, `.spread-slots`, `.spread-slot`.
- Card-back line visuals: `.spread-deck`, `.spread-deck-card`, `.spread-deck-card-image`.
- Result layout: `.spread-section .spread-grid`, `.spread-card`, `.spread-reset-button`.
- Text labels: `buttons.spreadShuffle`, `buttons.spreadReset`, `spread.slotPlaceholder`, `spread.selectionPrompt`, `spread.preparing`.

## Analytics Events

- `spread_started` fires on the first card selection.
- `spread_card_selected` fires on every selected card.
- `spread_completed` fires after the loading delay finishes.

## Code Markers

Search for `SPREAD REDESIGN` in the codebase to find every intentional marker around the new spread implementation.
