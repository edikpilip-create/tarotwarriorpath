import type { Locale } from "./i18n/config.ts";

export const buttonRegistry = {
  brand: {
    id: "brand-home",
    href: "#top",
  },
  navWisdom: {
    id: "nav-wisdom",
    href: "#wisdom",
  },
  navStructure: {
    id: "nav-structure",
    href: "#structure",
  },
  navSpread: {
    id: "nav-spread",
    href: "#spread",
  },
  navContact: {
    id: "nav-contact",
    href: "#contact",
  },
  heroCta: {
    id: "hero-draw-spread",
    href: "#spread",
  },
  heroOrbitFindOut: {
    id: "hero-orbit-find-out",
    href: "#split-section",
  },
  heroOrbitSpread: {
    id: "hero-orbit-spread",
    href: "#spread",
  },
  heroOrbitBuy: {
    id: "hero-orbit-buy",
    href: "#lead-form",
  },
  spreadDraw: {
    id: "spread-draw",
  },
  // SPREAD REDESIGN: separate IDs for the new shuffle-first and reset-after-result buttons.
  spreadShuffle: {
    id: "spread-shuffle",
  },
  spreadReset: {
    id: "spread-reset",
  },
  submitLead: {
    id: "submit-lead-form",
  },
} as const;

export const languageSwitcherButtonRegistry: Record<Locale, { id: string; locale: Locale }> = {
  en: {
    id: "lang-switch-en",
    locale: "en",
  },
  uk: {
    id: "lang-switch-uk",
    locale: "uk",
  },
  ru: {
    id: "lang-switch-ru",
    locale: "ru",
  },
};

export const formRegistry = {
  lead: {
    id: "lead-form",
    submitButtonId: buttonRegistry.submitLead.id,
  },
} as const;
