import type { Locale } from "./config.ts";

export type LocalizedSpreadCardEntry = {
  id: string;
  title: string;
  description: string;
  imageAlt: string;
  imageSrc?: string;
};

export type LocalizedSuitVideoSlide = {
  id: string;
  name: string;
  meta: string;
  description: string;
  iconAlt: string;
  videoSrc?: string;
  posterSrc?: string;
};

export type LocaleDictionary = {
  locale: {
    code: Locale;
    name: string;
    nativeName: string;
  };
  meta: {
    title: string;
    description: string;
    keywords: string[];
    siteName: string;
    ogDescription: string;
    twitterDescription: string;
    ogImageAlt: string;
  };
  nav: {
    ariaLabel: string;
  };
  languageSwitcher: {
    ariaLabel: string;
    labels: Record<Locale, string>;
  };
  carousel: {
    ariaLabel: string;
    cards: Array<{
      id: string;
      frontAlt: string;
      backAlt: string;
    }>;
  };
  buttons: {
    brand: string;
    navWisdom: string;
    navStructure: string;
    navSpread: string;
    navContact: string;
    heroCta: string;
    heroOrbitFindOut: string;
    heroOrbitSpread: string;
    heroOrbitBuy: string;
    heroBuyCta: string;
    spreadDraw: string;
    // SPREAD REDESIGN: labels used by the interactive spread controls.
    spreadShuffle: string;
    spreadReset: string;
    submitIdle: string;
    submitSending: string;
  };
  hero: {
    overline: string;
    titlePrefix: string;
    title: string;
    lead: string;
  };
  wisdom: {
    heading: string;
    body: string[];
    accent: string;
    sparkle: string;
    finalAccent: string;
  };
  practiceGate: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    quote: string;
    quoteAuthor: string;
  };
  featuredVideos: {
    primary: {
      title: string;
      subtitle: string;
      quote: string;
      quoteSource: string;
      description: string;
      iframeTitle: string;
    };
    secondary: {
      title: string;
      subtitle: string;
      quote: string;
      quoteSource: string;
      description: string;
      iframeTitle: string;
    };
  };
  structure: {
    eyebrow: string;
    heading: string;
    description: string;
    elementLabel: string;
    totemsLabel: string;
    stats: Array<{
      value: string;
      label: string;
      text: string;
    }>;
    minorElements: Array<{
      element: string;
      meaning: string;
    }>;
  };
  suitVideoCarousel: {
    ariaLabel: string;
    placeholderLabel: string;
    slides: LocalizedSuitVideoSlide[];
  };
  suits: Array<{
    name: string;
    element: string;
    totems: string;
    text: string;
  }>;
  practiceSection: {
    heading: string;
    description: string;
  };
  practiceCards: Array<{
    name: string;
    text: string;
  }>;
  spread: {
    heading: string;
    description: string;
    // SPREAD REDESIGN: copy for empty slots, deck prompt, and 2-second preparation overlay.
    slotPlaceholder: string;
    selectionPrompt: string;
    preparing: string;
    cards: LocalizedSpreadCardEntry[];
  };
  contact: {
    eyebrow: string;
    heading: string;
    description: string;
  };
  form: {
    nameLabel: string;
    contactLabel: string;
    messageLabel: string;
  };
  feedback: {
    sent: string;
    error: string;
    api: {
      validation: string;
      serverMisconfigured: string;
      deliveryFailed: string;
    };
  };
};
