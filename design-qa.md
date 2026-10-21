# Learn Button Background Design QA

## Evidence

- Source visual truth: `public/media/hero-buttons/find-out-eye-bg.png`
- Source pixels: 1536 x 1024 PNG with alpha transparency.
- Implementation screenshot: `docs/qa/find-out-top-1036.png`
- Implementation pixels / CSS viewport: 1036 x 912 at device scale factor 1.
- Focused comparison: `docs/qa/learn-button-comparison.png`
- State: default RU hero state at 1036 x 912; automated top-position checks also cover 320 x 700, 390 x 844, 680 x 900, 681 x 900, 1440 x 1000, and 1920 x 1080.

## Findings

- No actionable P0, P1, or P2 differences remain.
- The complete generated eye ornament is visible. `object-fit: cover` removes only transparent canvas padding; it does not crop the gold frame or glow.
- The existing fixed eye SVG is centered above the localized HTML label and remains proportional.
- The former rectangular plaque, its border, fill, radius, and shadow are absent.
- The button remains visually subordinate to the primary Buy CTA and does not introduce horizontal overflow at the checked breakpoints.

## Fidelity Surfaces

- Fonts and typography: the existing heading font, weight, uppercase treatment, gold color, line height, and text glow are preserved. RU, UK, and EN labels fit without clipping.
- Spacing and layout rhythm: one header-relative formula keeps the button at the top on every breakpoint while using a responsive 225-325 px width and 105-150 px height. Eye and label spacing stays inside the dark center of the ornament.
- Colors and visual tokens: the supplied dark purple and warm gold asset is used directly; no replacement palette or broad token change was introduced.
- Image quality and asset fidelity: the supplied PNG is copied unchanged and rendered without stretching. Its alpha transparency blends into the hero image without a rectangular edge.
- Copy and content: existing dictionary values and the anchor's localized accessible name remain unchanged.

## Interaction And Accessibility

- Existing anchor, `href`, `data-button-id`, `aria-label`, float wrapper, hover timing, focus outline, active transform, and reduced-motion rules are preserved.
- Hover leaves the background image unchanged and applies only the existing frame scale effect; no rotation, recoloring, or separate background border is added.
- The head image and Find Out float share the same 7-second keyframe and responsive 10-19 px displacement. Samples at 0, 1.75, 3.5, 5.25, and 7 seconds returned identical transforms for both elements.
- Hover and keyboard focus keep the synchronized float running; reduced-motion resolves both animation names to `none`.
- The button remains visible from 320 px upward. At the float animation's highest point it keeps a 5-10 px gap below the fixed header and introduces no horizontal overflow.

## Comparison History

- Pass 1: no P0/P1/P2 mismatch was found in the focused source/implementation comparison or responsive captures; no post-capture visual correction was required.
- Annotation pass: removed the Find Out background rotation and hover filter while preserving the existing frame scale interaction.
- Size and synchronization pass: enlarged Find Out by 25%, shared its motion timing and distance with the hero head, preserved hover zoom, and verified exact phase equality across the full 7-second cycle.
- Responsive-position pass: removed tablet/phone `svh` positioning and the 680 px hide rule, then verified a single header-relative top position across 320-1920 px.

## Verification

- ESLint: passed.
- Tests: 33 passed.
- Production build: passed with preview environment variables.
- Preview HTTP check: passed at `http://localhost:3001/ru`.

## Hero Description Relocation

- Moved the localized `hero.lead` copy directly below `.hero-title` and removed the former carousel heading so the sentence renders once.
- Styled the copy as centered descriptive text with normal casing, body font weight, restrained contrast, and 20 px padding on every side.
- Verified EN, RU, and UK at 390, 680, 681, 862, 1024, 1329, and 1440 px: title, description, and CTA remain in document order without overlap or horizontal overflow.
- Evidence: `docs/qa/hero-description-en-1329.png`, `docs/qa/hero-description-ru-862.png`, and `docs/qa/hero-description-uk-390.png`.
- ESLint, all 33 tests, and the preview production build passed.

## Hero CTA Row

- Placed the Buy Deck and Spread CTAs in one centered horizontal row on tablet and desktop without changing their links or interactions.
- Preserved the primary/secondary hierarchy while allowing the primary CTA to flex into the available width.
- On phone widths up to 767 px, the group switches to a centered column with Spread below Buy Deck; at 768 px and above it returns to a row.
- Verified the breakpoint at 390, 680, 764, 767, 768, and 862 px: both labels fit, the group stays inside the viewport, and no horizontal overflow is introduced.
- ESLint, all 33 tests, and the preview production build passed.

## Primary Buy CTA Reduction

- Scoped the change to `.hero-buy-cta` and its existing child ornament, frame, glow, icon, and label selectors in `src/app/globals.css`; no broad hero or page rules changed.
- Desktop changed from approximately 610 x 122 px to 427 x 86 px. At 1057 px it changed from 610 x 110 px to 427 x 78 px.
- Mobile at 390 px changed from approximately 343 x 80 px to 240 x 72 px. A 230 px minimum width keeps the primary CTA at least as wide as Spread at the 320 px safety viewport.
- Label sizing changed from `clamp(1.28rem, 3.2vw, 2.85rem)` to `clamp(0.96rem, 2.35vw, 2rem)`; the phone override changed to `clamp(0.82rem, 4.2vw, 1.05rem)`.
- Icon sizing changed from 52-68 px to 36-48 px; the phone override changed from 48 px to 34 px.
- Diamonds, inner frame insets, ornament lines, focus offset, icon shadows, and default/hover glow radii were reduced proportionally without removing the original visual treatment.
- A follow-up height adjustment sets Buy CTA to 72 px on phones and approximately 76-88 px on tablets up to 1024 px; desktop above 1024 px remains unchanged.
- Verified RU, UK, and EN at 320, 390, 680, 764, 767, 768, 854, 1024, 1057, and 1329 px: labels fit, ornaments align, and no horizontal overflow is introduced. Spread and Find Out dimensions remain unchanged.
- ESLint, all 33 tests, production build, and preview HTTP check passed.

final result: passed
