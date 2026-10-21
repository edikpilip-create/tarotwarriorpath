"use client";

import Image from "next/image";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { analyticsEventNames, trackEvent } from "@/lib/analytics";
import { type LocalizedAssets } from "@/lib/assets";
import { buttonRegistry, formRegistry } from "@/lib/buttons";
import { type Locale } from "@/lib/i18n/config";
import type { LocaleDictionary } from "@/lib/i18n/types";
import { createSpreadCards, shuffleSpreadCards, type SpreadCard, type SpreadCardId } from "@/lib/spread-cards";
import { getRequestSource } from "@/lib/telegram-source";
import { getInitialSpreadState, getSpreadResultsScrollTop } from "@/lib/spread-view";

import { AnimatedCampfire } from "./AnimatedCampfire";
import { LanguageSwitcher } from "./language-switcher";

const starField = [
  { x: "4%", y: "10%", size: 6, color: "rgba(255, 214, 232, 0.95)", dx: "10px", dy: "8px", drift: "13s", twinkle: "5.6s", delay: "-1.2s" },
  { x: "12%", y: "28%", size: 7, color: "rgba(214, 231, 255, 0.9)", dx: "-8px", dy: "12px", drift: "15s", twinkle: "6.2s", delay: "-3.1s" },
  { x: "21%", y: "16%", size: 8, color: "rgba(226, 255, 244, 0.92)", dx: "14px", dy: "-6px", drift: "18s", twinkle: "7s", delay: "-2.4s" },
  { x: "31%", y: "9%", size: 5, color: "rgba(255, 241, 204, 0.92)", dx: "-10px", dy: "9px", drift: "12s", twinkle: "5.4s", delay: "-4.2s" },
  { x: "43%", y: "24%", size: 7, color: "rgba(235, 223, 255, 0.92)", dx: "7px", dy: "10px", drift: "17s", twinkle: "6.8s", delay: "-0.6s" },
  { x: "55%", y: "13%", size: 6, color: "rgba(255, 224, 213, 0.9)", dx: "-12px", dy: "-5px", drift: "14s", twinkle: "4.9s", delay: "-2.9s" },
  { x: "67%", y: "32%", size: 5, color: "rgba(218, 239, 255, 0.92)", dx: "8px", dy: "7px", drift: "16s", twinkle: "7.2s", delay: "-5.1s" },
  { x: "76%", y: "11%", size: 8, color: "rgba(236, 255, 220, 0.9)", dx: "-9px", dy: "11px", drift: "19s", twinkle: "6s", delay: "-1.8s" },
  { x: "84%", y: "26%", size: 9, color: "rgba(255, 216, 241, 0.94)", dx: "11px", dy: "-7px", drift: "13s", twinkle: "5.8s", delay: "-3.8s" },
  { x: "92%", y: "8%", size: 5, color: "rgba(224, 235, 255, 0.9)", dx: "-7px", dy: "10px", drift: "17s", twinkle: "6.5s", delay: "-2.2s" },
  { x: "8%", y: "58%", size: 6, color: "rgba(245, 227, 255, 0.92)", dx: "9px", dy: "-7px", drift: "15s", twinkle: "6.7s", delay: "-1.4s" },
  { x: "18%", y: "74%", size: 7, color: "rgba(226, 255, 232, 0.9)", dx: "-11px", dy: "6px", drift: "18s", twinkle: "5.2s", delay: "-4.6s" },
  { x: "29%", y: "68%", size: 6, color: "rgba(255, 233, 214, 0.92)", dx: "10px", dy: "9px", drift: "12s", twinkle: "7.1s", delay: "-0.9s" },
  { x: "48%", y: "77%", size: 7, color: "rgba(214, 235, 255, 0.9)", dx: "-8px", dy: "-10px", drift: "16s", twinkle: "6.1s", delay: "-3.4s" },
  { x: "59%", y: "61%", size: 6, color: "rgba(255, 223, 235, 0.94)", dx: "6px", dy: "8px", drift: "14s", twinkle: "5.5s", delay: "-2.7s" },
  { x: "71%", y: "80%", size: 7, color: "rgba(232, 255, 247, 0.9)", dx: "-9px", dy: "-7px", drift: "19s", twinkle: "6.9s", delay: "-5.6s" },
  { x: "82%", y: "70%", size: 6, color: "rgba(255, 239, 210, 0.92)", dx: "12px", dy: "5px", drift: "13s", twinkle: "5.1s", delay: "-1.1s" },
  { x: "95%", y: "63%", size: 7, color: "rgba(229, 223, 255, 0.92)", dx: "-10px", dy: "8px", drift: "15s", twinkle: "6.3s", delay: "-4.8s" }
] as const;

const spreadResultsHeaderGap = 28;
// SPREAD REDESIGN: timing and slot count for the interactive 3-card flow.
const spreadPreparationDelayMs = 2000;
const spreadSlotCount = 3;
const heroHeadFloatDistanceDefault = "clamp(10px, 1.2vw, 19px)";
const heroHeadAuraMaskEdgeDefault = 70;
const suitVideoGradientHeightDefault = 54;
const suitVideoGradientOpacityDefault = 78;
const leadChannel = "telegram";

type HomePageClientProps = {
  lang: Locale;
  dictionary: LocaleDictionary;
  assets: LocalizedAssets;
};

type StructureVisualId = "air" | "fire" | "earth" | "water";
type HeroOrbitButtonVariant = "find-out" | "spread" | "buy";
// SPREAD REDESIGN: selecting -> preparing -> complete controls which spread UI block is visible.
type SpreadStage = "selecting" | "preparing" | "complete";

const suitCarouselVisuals: Record<string, { className: string; iconSrc: string }> = {
  swords: { className: "suit-card-air", iconSrc: "/media/icons/suits/swords.svg" },
  wands: { className: "suit-card-fire", iconSrc: "/media/icons/suits/wands.svg" },
  pentacles: { className: "suit-card-earth", iconSrc: "/media/icons/suits/pentacles.svg" },
  cups: { className: "suit-card-water", iconSrc: "/media/icons/suits/cups.svg" }
};

const minorElementVisuals: StructureVisualId[] = ["fire", "water", "air", "earth"];

const elementIconSrc: Record<StructureVisualId, string> = {
  air: "/media/icons/elements/air.svg",
  earth: "/media/icons/elements/earth.svg",
  fire: "/media/icons/elements/fire.svg",
  water: "/media/icons/elements/water.svg"
};

const elementIconAlt: Record<StructureVisualId, string> = {
  air: "Air element icon",
  earth: "Earth element icon",
  fire: "Fire element icon",
  water: "Water element icon"
};

function getSiteHeaderHeight(): number {
  const value = window.getComputedStyle(document.documentElement).getPropertyValue("--site-header-height");
  const parsedValue = Number.parseFloat(value);

  return Number.isFinite(parsedValue) ? parsedValue : 70;
}

const heroOrbitButtonSeparatorSrc = "/media/hero-buttons/hero-button-separator.svg";
const deckCtaOrnamentSrc = "/media/practice-gate-divider.png";

const heroOrbitButtonAssets = {
  findOut: {
    frameSrc: "/media/hero-buttons/find-out-eye-bg.png",
    iconSrc: "/media/hero-buttons/find-out-eye.svg"
  },
  spread: {
    frameSrc: "/media/hero-buttons/spread-button-bg.svg",
    iconSrc: "/media/hero-buttons/spread-button-icon.png"
  },
  buy: {
    frameSrc: "/media/hero-buttons/buy-button-bg.svg",
    iconSrc: "/media/hero-buttons/buy-button-icon.png"
  }
} as const;

type PointerTiltConfig = {
  rotateXVariable: string;
  rotateYVariable: string;
  lightXVariable?: string;
  lightYVariable?: string;
  rotateXMultiplier: number;
  rotateYMultiplier: number;
};

function bindPointerTilt(frame: HTMLElement, config: PointerTiltConfig) {
  let animationFrameId = 0;

  const setTilt = (rotateX: number, rotateY: number, lightX = 50, lightY = 50) => {
    frame.style.setProperty(config.rotateXVariable, `${rotateX.toFixed(2)}deg`);
    frame.style.setProperty(config.rotateYVariable, `${rotateY.toFixed(2)}deg`);

    if (config.lightXVariable) {
      frame.style.setProperty(config.lightXVariable, `${lightX.toFixed(2)}%`);
    }

    if (config.lightYVariable) {
      frame.style.setProperty(config.lightYVariable, `${lightY.toFixed(2)}%`);
    }
  };

  const handlePointerMove = (event: PointerEvent) => {
    window.cancelAnimationFrame(animationFrameId);

    animationFrameId = window.requestAnimationFrame(() => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      setTilt(
        y * config.rotateXMultiplier,
        x * config.rotateYMultiplier,
        (x + 0.5) * 100,
        (y + 0.5) * 100
      );
    });
  };

  const handlePointerLeave = () => {
    window.cancelAnimationFrame(animationFrameId);
    setTilt(0, 0);
  };

  frame.addEventListener("pointermove", handlePointerMove);
  frame.addEventListener("pointerleave", handlePointerLeave);

  return () => {
    window.cancelAnimationFrame(animationFrameId);
    frame.removeEventListener("pointermove", handlePointerMove);
    frame.removeEventListener("pointerleave", handlePointerLeave);
  };
}

function StructureIcon({ id }: { id: StructureVisualId }) {
  // Keep these SVGs as plain image assets so their internal colors, masks, and effects stay untouched.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={elementIconSrc[id]} alt={elementIconAlt[id]} className="element-icon-image" />;
}

function HeroOrbitButton({
  buttonId,
  frameSrc,
  href,
  iconSrc,
  label,
  variant
}: {
  buttonId: string;
  frameSrc: string;
  href: string;
  iconSrc: string;
  label: string;
  variant: HeroOrbitButtonVariant;
}) {
  return (
    <a
      className={`hero-orbit-button hero-orbit-button--${variant}`}
      href={href}
      data-button-id={buttonId}
      aria-label={label}
    >
      <span className="hero-orbit-button__float">
        <span className="hero-orbit-button__frame">
          {variant === "find-out" ? (
            <span className="hero-orbit-button__find-out-artifact">
              <Image
                className="hero-orbit-button__background"
                src={frameSrc}
                alt=""
                fill
                sizes="(max-width: 1024px) 180px, 260px"
                unoptimized
              />
              <span className="hero-orbit-button__find-out-eye" aria-hidden="true">
                <Image src={iconSrc} alt="" fill sizes="48px" unoptimized />
              </span>
              <span className="hero-orbit-button__label">{label}</span>
            </span>
          ) : (
            <>
              <Image
                className="hero-orbit-button__background"
                src={frameSrc}
                alt=""
                fill
                sizes="(max-width: 680px) 112px, (max-width: 1024px) 140px, 176px"
                unoptimized
              />
              <span className="hero-orbit-button__icon" aria-hidden="true">
                <Image src={iconSrc} alt="" width={96} height={96} sizes="72px" unoptimized />
              </span>
              <span className="hero-orbit-button__label">{label}</span>
              <span className="hero-orbit-button__separator" aria-hidden="true">
                <Image src={heroOrbitButtonSeparatorSrc} alt="" width={148} height={32} sizes="88px" unoptimized />
              </span>
            </>
          )}
        </span>
      </span>
    </a>
  );
}

function CarouselFlipCard({
  frontSrc,
  backSrc,
  frontAlt,
  backAlt
}: {
  frontSrc: string;
  backSrc: string;
  frontAlt: string;
  backAlt: string;
}) {
  return (
    <div className="carousel-flip-card">
      <div className="carousel-flip-card-inner">
        <div className="carousel-flip-card-face carousel-flip-card-front">
          <Image
            className="carousel-flip-card-image"
            src={frontSrc}
            alt={frontAlt}
            fill
            sizes="(max-width: 768px) 72vw, (max-width: 1200px) 34vw, 430px"
          />
        </div>
        <div className="carousel-flip-card-face carousel-flip-card-back" aria-hidden="true">
          <Image
            className="carousel-flip-card-image"
            src={backSrc}
            alt={backAlt}
            fill
            sizes="(max-width: 768px) 72vw, (max-width: 1200px) 34vw, 430px"
          />
        </div>
      </div>
    </div>
  );
}

function SpreadResultCard({ card }: { card: SpreadCard }) {
  return (
    <article className="spread-card">
      <div className="spread-card-media">
        <Image
          className="spread-card-image"
          src={card.imageSrc}
          alt={card.imageAlt}
          fill
          sizes="(max-width: 680px) 82vw, (max-width: 1100px) 42vw, 320px"
        />
      </div>
      <div className="spread-card-copy">
        <h3>{card.title}</h3>
        <p>{card.description}</p>
      </div>
    </article>
  );
}

function getLeadSubmitErrorType(status?: number) {
  if (!status) {
    return "network_or_timeout";
  }

  if (status === 400) {
    return "validation";
  }

  if (status === 429) {
    return "rate_limited";
  }

  if (status === 500) {
    return "missing_configuration";
  }

  if (status === 502) {
    return "telegram_http_error";
  }

  return "unknown_server_error";
}

export default function HomePageClient({ lang, dictionary, assets }: HomePageClientProps) {
  // SPREAD REDESIGN: keep the localized 21-card database intact, then attach image assets for the UI.
  const spreadDeck = useMemo(
    () =>
      createSpreadCards(
        dictionary.spread.cards.map((card) => {
          const id = card.id as SpreadCardId;

          return {
            ...card,
            id,
            imageSrc: card.imageSrc ?? assets.spreadCardImages[id]
          };
        })
      ),
    [assets.spreadCardImages, dictionary.spread.cards]
  );

  // SPREAD REDESIGN: spreadDeckOrder is the hidden shuffled deck behind the identical visible backs.
  const [spread, setSpread] = useState<SpreadCard[]>(getInitialSpreadState);
  const [spreadDeckOrder, setSpreadDeckOrder] = useState<SpreadCard[]>(() => shuffleSpreadCards(spreadDeck));
  const [selectedSpreadIndexes, setSelectedSpreadIndexes] = useState<number[]>([]);
  const [spreadStage, setSpreadStage] = useState<SpreadStage>("selecting");
  const [isShufflingSpread, setIsShufflingSpread] = useState(false);
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formError, setFormError] = useState("");
  const [quoteIsVisible, setQuoteIsVisible] = useState(false);
  const [activeSuitCarouselIndex, setActiveSuitCarouselIndex] = useState(0);
  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
  const siteMenuRef = useRef<HTMLDivElement | null>(null);
  const spreadSelectionRef = useRef<HTMLDivElement | null>(null);
  const spreadResultsRef = useRef<HTMLDivElement | null>(null);
  const quoteSectionRef = useRef<HTMLElement | null>(null);
  const practiceGateVideoRef = useRef<HTMLVideoElement | null>(null);
  const practiceGateExampleVideoRef = useRef<HTMLVideoElement | null>(null);
  const practiceGateExampleFrameRef = useRef<HTMLDivElement | null>(null);
  const structureVideoFrameRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToSpreadRef = useRef(false);
  const spreadShuffleTimerRef = useRef<number | null>(null);
  const spreadPreparationTimerRef = useRef<number | null>(null);
  const hasTrackedLeadFormStartRef = useRef(false);
  const [practiceIntroParagraph, practiceFinalParagraph] = dictionary.practiceGate.paragraphs;

  useEffect(() => {
    if (!isSiteMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!siteMenuRef.current?.contains(event.target as Node)) {
        setIsSiteMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSiteMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSiteMenuOpen]);

  // SPREAD REDESIGN: reset the interactive spread if the localized deck changes.
  useEffect(() => {
    trackEvent(analyticsEventNames.pageView, {
      locale: lang,
      page_path: window.location.pathname
    });
  }, [lang]);

  useEffect(() => {
    const section = quoteSectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setQuoteIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.28
      }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = practiceGateVideoRef.current;

    if (!video) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          video.currentTime = 0;
          void video.play().catch(() => undefined);
          return;
        }

        video.pause();
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.36
      }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = practiceGateExampleVideoRef.current;

    if (!video) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void video.play().catch(() => undefined);
          return;
        }

        video.pause();
      },
      {
        rootMargin: "0px 0px -14% 0px",
        threshold: 0.34
      }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const practiceGateFrame = practiceGateExampleFrameRef.current;
    const structureFrame = structureVideoFrameRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) {
      return;
    }

    const cleanupFns: Array<() => void> = [];

    if (practiceGateFrame) {
      cleanupFns.push(
        bindPointerTilt(practiceGateFrame, {
          rotateXVariable: "--video-rotate-x",
          rotateYVariable: "--video-rotate-y",
          rotateXMultiplier: -8,
          rotateYMultiplier: 12
        })
      );
    }

    if (structureFrame) {
      cleanupFns.push(
        bindPointerTilt(structureFrame, {
          rotateXVariable: "--structure-video-rotate-x",
          rotateYVariable: "--structure-video-rotate-y",
          lightXVariable: "--structure-video-light-x",
          lightYVariable: "--structure-video-light-y",
          rotateXMultiplier: -6,
          rotateYMultiplier: 9
        })
      );
    }

    return () => cleanupFns.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    clearSpreadPreparationTimer();
    clearSpreadShuffleTimer();
    shouldScrollToSpreadRef.current = false;

    const resetSpreadTimer = window.setTimeout(() => {
      setSpread(getInitialSpreadState());
      setSelectedSpreadIndexes([]);
      setSpreadStage("selecting");
      setIsShufflingSpread(false);
      setSpreadDeckOrder(shuffleSpreadCards(spreadDeck));
    }, 0);

    return () => window.clearTimeout(resetSpreadTimer);
  }, [spreadDeck]);

  // SPREAD REDESIGN: clear animation/loading timers when the page unmounts.
  useEffect(
    () => () => {
      clearSpreadPreparationTimer();
      clearSpreadShuffleTimer();
    },
    []
  );

  function getPagePath() {
    return window.location.pathname;
  }

  function trackLeadFormStart() {
    if (hasTrackedLeadFormStartRef.current) {
      return;
    }

    hasTrackedLeadFormStartRef.current = true;

    trackEvent(analyticsEventNames.leadFormStart, {
      locale: lang,
      page_path: getPagePath(),
      form_id: formRegistry.lead.id,
      lead_channel: leadChannel
    });
  }

  // SPREAD REDESIGN: shuffle/select/reset handlers for the new 21-back-card interaction.
  function clearSpreadShuffleTimer() {
    if (spreadShuffleTimerRef.current === null) {
      return;
    }

    window.clearTimeout(spreadShuffleTimerRef.current);
    spreadShuffleTimerRef.current = null;
  }

  function clearSpreadPreparationTimer() {
    if (spreadPreparationTimerRef.current === null) {
      return;
    }

    window.clearTimeout(spreadPreparationTimerRef.current);
    spreadPreparationTimerRef.current = null;
  }

  function shuffleSpreadDeck() {
    clearSpreadShuffleTimer();
    setSpreadDeckOrder(shuffleSpreadCards(spreadDeck));
  }

  function handleShuffleSpread() {
    if (spreadStage !== "selecting" || spread.length > 0 || isShufflingSpread) {
      return;
    }

    setIsShufflingSpread(true);
    shuffleSpreadDeck();

    spreadShuffleTimerRef.current = window.setTimeout(() => {
      setIsShufflingSpread(false);
      spreadShuffleTimerRef.current = null;
    }, 720);
  }

  function completeSpread(nextSpread: SpreadCard[]) {
    clearSpreadPreparationTimer();
    setSpreadStage("preparing");

    spreadPreparationTimerRef.current = window.setTimeout(() => {
      shouldScrollToSpreadRef.current = true;
      setSpreadStage("complete");

      trackEvent(analyticsEventNames.spreadCompleted, {
        locale: lang,
        page_path: getPagePath(),
        spread_cards_count: nextSpread.length
      });

      spreadPreparationTimerRef.current = null;
    }, spreadPreparationDelayMs);
  }

  function selectSpreadCard(cardIndex: number) {
    if (spreadStage !== "selecting" || isShufflingSpread || selectedSpreadIndexes.includes(cardIndex)) {
      return;
    }

    const selectedCard = spreadDeckOrder[cardIndex];

    if (!selectedCard) {
      return;
    }

    const nextSpread = [...spread, selectedCard];

    if (spread.length === 0) {
      trackEvent(analyticsEventNames.spreadStarted, {
        locale: lang,
        page_path: getPagePath(),
        spread_cards_count: spreadSlotCount
      });
    }

    trackEvent(analyticsEventNames.spreadCardSelected, {
      locale: lang,
      page_path: getPagePath(),
      spread_cards_count: nextSpread.length
    });

    setSpread(nextSpread);
    setSelectedSpreadIndexes((currentIndexes) => [...currentIndexes, cardIndex]);

    if (nextSpread.length === spreadSlotCount) {
      completeSpread(nextSpread);
    }
  }

  function resetSpread() {
    clearSpreadPreparationTimer();
    clearSpreadShuffleTimer();
    shouldScrollToSpreadRef.current = false;
    setSpread(getInitialSpreadState());
    setSelectedSpreadIndexes([]);
    setSpreadStage("selecting");
    setIsShufflingSpread(false);
    setSpreadDeckOrder(shuffleSpreadCards(spreadDeck));

    window.requestAnimationFrame(() => {
      if (!spreadSelectionRef.current) {
        return;
      }

      const rect = spreadSelectionRef.current.getBoundingClientRect();

      window.scrollTo({
        top: Math.max(0, Math.round(window.scrollY + rect.top - 96)),
        behavior: "smooth"
      });
    });
  }

  // SPREAD REDESIGN: after the 2-second preparation phase, scroll to the completed result cards.
  useEffect(() => {
    if (spreadStage !== "complete" || !spread.length || !shouldScrollToSpreadRef.current || !spreadResultsRef.current) {
      return;
    }

    shouldScrollToSpreadRef.current = false;

    const frameId = window.requestAnimationFrame(() => {
      if (!spreadResultsRef.current) {
        return;
      }

      const rect = spreadResultsRef.current.getBoundingClientRect();
      const scrollTop = getSpreadResultsScrollTop({
        elementTop: window.scrollY + rect.top,
        offset: getSiteHeaderHeight() + spreadResultsHeaderGap
      });

      window.scrollTo({
        top: scrollTop,
        behavior: "smooth"
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [spread, spreadStage]);

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormState("sending");
    setFormError("");

    const formData = new FormData(form);
    const source = getRequestSource({
      lang,
      pathname: window.location.pathname,
      hash: window.location.hash || buttonRegistry.navContact.href,
      formId: formRegistry.lead.id,
      buttonId: formRegistry.lead.submitButtonId
    });

    trackEvent(analyticsEventNames.leadSubmitAttempt, {
      locale: lang,
      page_path: getPagePath(),
      form_id: formRegistry.lead.id,
      lead_channel: leadChannel
    });

    const response = await fetch("/api/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        contact: formData.get("contact"),
        message: formData.get("message"),
        ...source
      })
    }).catch(() => null);

    const result: unknown = await response?.json().catch(() => null);
    const apiResult = typeof result === "object" && result !== null
      ? result as { ok?: unknown; message?: unknown }
      : null;
    const delivered = response?.ok === true && apiResult?.ok === true;

    if (!delivered) {
      setFormError(typeof apiResult?.message === "string" && apiResult.message.trim()
        ? apiResult.message
        : dictionary.feedback.error);
    }

    setFormState(delivered ? "sent" : "error");

    if (delivered) {
      trackEvent(analyticsEventNames.generateLead, {
        locale: lang,
        page_path: getPagePath(),
        form_id: formRegistry.lead.id,
        lead_channel: leadChannel,
        telegram_delivery_status: "success"
      });
      form.reset();

      return;
    }

    trackEvent(analyticsEventNames.leadSubmitError, {
      locale: lang,
      page_path: getPagePath(),
      form_id: formRegistry.lead.id,
      lead_channel: leadChannel,
      telegram_delivery_status: "failed",
      error_type: getLeadSubmitErrorType(response?.status)
    });
  }

  const isSpreadInitial = spreadStage === "selecting" && spread.length === 0;
  const isSpreadPreparing = spreadStage === "preparing";
  const isSpreadComplete = spreadStage === "complete";
  const canSelectSpreadCards = spreadStage === "selecting" && !isShufflingSpread;
  const suitVideoSlides = dictionary.suitVideoCarousel.slides;
  const activeSuitCarouselSlide = suitVideoSlides[activeSuitCarouselIndex] ?? suitVideoSlides[0];
  const activeSuitCarouselVisual = activeSuitCarouselSlide
    ? suitCarouselVisuals[activeSuitCarouselSlide.id] ?? suitCarouselVisuals.swords
    : suitCarouselVisuals.swords;
  // HERO ORBIT BUTTONS: Stage 3 navigation targets live here; analytics can be wired later if needed.
  const heroOrbitButtons = [
    {
      variant: "find-out",
      buttonId: buttonRegistry.heroOrbitFindOut.id,
      href: buttonRegistry.heroOrbitFindOut.href,
      label: dictionary.buttons.heroOrbitFindOut,
      ...heroOrbitButtonAssets.findOut
    }
  ] satisfies Array<{
    variant: HeroOrbitButtonVariant;
    buttonId: string;
    label: string;
    href: string;
    frameSrc: string;
    iconSrc: string;
  }>;
  const heroBuyCtaLabel = dictionary.buttons.heroBuyCta;
  const heroSpreadCtaLabel = dictionary.buttons.heroOrbitSpread;
  const heroTitleText = dictionary.hero.title.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
  const heroTitleAccessibleLabel = `${dictionary.hero.titlePrefix} ${heroTitleText}`;

  return (
    <main>
      <div className="site-starfield" aria-hidden="true">
        {starField.map((star, index) => (
          <span
            key={`${star.x}-${star.y}-${index}`}
            className="site-star"
            style={
              {
                "--x": star.x,
                "--y": star.y,
                "--size": `${star.size}px`,
                "--glow": star.color,
                "--dx": star.dx,
                "--dy": star.dy,
                "--drift": star.drift,
                "--twinkle": star.twinkle,
                "--delay": star.delay
              } as CSSProperties
            }
          />
        ))}
      </div>
      {/* SITE HEADER START */}
      <header className="site-nav">
        <div className="site-nav-left">
          <a href={buttonRegistry.brand.href} className="brand" data-button-id={buttonRegistry.brand.id}>
            {dictionary.buttons.brand}
          </a>
          <LanguageSwitcher
            currentLocale={lang}
            ariaLabel={dictionary.languageSwitcher.ariaLabel}
            labels={dictionary.languageSwitcher.labels}
          />
        </div>
        <p className="site-nav-slogan" aria-hidden="true">
          <span>{dictionary.hero.overline}</span>
        </p>
        <div ref={siteMenuRef} className="site-nav-right">
          <button
            className="site-menu-button"
            type="button"
            aria-label={dictionary.nav.ariaLabel}
            aria-haspopup="menu"
            aria-expanded={isSiteMenuOpen}
            aria-controls="site-menu-panel"
            onClick={() => setIsSiteMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav
            id="site-menu-panel"
            className="site-nav-links"
            aria-label={dictionary.nav.ariaLabel}
            data-open={isSiteMenuOpen}
            aria-hidden={!isSiteMenuOpen}
            role="menu"
          >
            <a
              href={buttonRegistry.navWisdom.href}
              data-button-id={buttonRegistry.navWisdom.id}
              role="menuitem"
              tabIndex={isSiteMenuOpen ? 0 : -1}
              onClick={() => setIsSiteMenuOpen(false)}
            >
              {dictionary.buttons.navWisdom}
            </a>
            <a
              href={buttonRegistry.navStructure.href}
              data-button-id={buttonRegistry.navStructure.id}
              role="menuitem"
              tabIndex={isSiteMenuOpen ? 0 : -1}
              onClick={() => setIsSiteMenuOpen(false)}
            >
              {dictionary.buttons.navStructure}
            </a>
            <a
              href={buttonRegistry.navSpread.href}
              data-button-id={buttonRegistry.navSpread.id}
              role="menuitem"
              tabIndex={isSiteMenuOpen ? 0 : -1}
              onClick={() => setIsSiteMenuOpen(false)}
            >
              {dictionary.buttons.navSpread}
            </a>
            <a
              href={buttonRegistry.navContact.href}
              data-button-id={buttonRegistry.navContact.id}
              role="menuitem"
              tabIndex={isSiteMenuOpen ? 0 : -1}
              onClick={() => setIsSiteMenuOpen(false)}
            >
              {dictionary.buttons.navContact}
            </a>
          </nav>
        </div>
      </header>
      {/* SITE HEADER END */}

      <div className="hero-carousel-group">
        <section
          id="top"
          className="hero section"
          style={
            {
              "--hero-head-float-distance": heroHeadFloatDistanceDefault,
              "--hero-head-aura-mask-edge": `${heroHeadAuraMaskEdgeDefault}%`
            } as CSSProperties
          }
        >
          <div className="hero-bg" aria-hidden="true" />
          <div className="heroHeadStage" aria-hidden="true">
            <div className="heroHeadAura">
              <video autoPlay muted loop playsInline preload="metadata" poster="/media/hero/hero-head-aura-poster.jpg">
                <source src="/media/hero/hero-head-aura.mp4" type="video/mp4" />
              </video>
            </div>
            <Image
              className="heroHeadImage"
              src={assets.hero.maskSrc}
              alt=""
              width={1536}
              height={1024}
              priority
              sizes="(max-width: 768px) 120vw, 980px"
            />
          </div>
          <div className="hero-orbit-buttons">
            {heroOrbitButtons.map((button) => (
              <HeroOrbitButton key={button.variant} {...button} />
            ))}
          </div>
          <div className="hero-content">
            <h1 className="hero-title" aria-label={heroTitleAccessibleLabel}>
              <span className="hero-title__eyebrow">
                <span className="hero-title__line" aria-hidden="true" />
                <span className="hero-title__small" data-text={dictionary.hero.titlePrefix}>
                  {dictionary.hero.titlePrefix}
                </span>
                <span className="hero-title__line" aria-hidden="true" />
              </span>
              <span className="hero-title__main" data-text={heroTitleText}>
                {heroTitleText}
              </span>
            </h1>
            <p className="hero-description">{dictionary.hero.lead}</p>
            <div className="hero-cta-group">
              <a
                className="deck-cta deck-cta--primary hero-buy-cta"
                href={buttonRegistry.heroOrbitBuy.href}
                data-button-id={buttonRegistry.heroOrbitBuy.id}
                aria-label={heroBuyCtaLabel}
              >
                <span className="deck-cta__background" aria-hidden="true" />
                <span className="deck-cta__glow" aria-hidden="true" />
                <span className="deck-cta__frame" aria-hidden="true" />
                <span className="deck-cta__ornaments" aria-hidden="true">
                  <span className="deck-cta__ornament-line deck-cta__ornament-line--top">
                    <Image src={deckCtaOrnamentSrc} alt="" fill sizes="610px" unoptimized />
                  </span>
                  <span className="deck-cta__ornament-line deck-cta__ornament-line--bottom">
                    <Image src={deckCtaOrnamentSrc} alt="" fill sizes="610px" unoptimized />
                  </span>
                </span>
                <span className="hero-buy-cta__ornament hero-buy-cta__ornament--top" aria-hidden="true" />
                <span className="hero-buy-cta__ornament hero-buy-cta__ornament--bottom" aria-hidden="true" />
                <span className="hero-buy-cta__side hero-buy-cta__side--left" aria-hidden="true" />
                <span className="hero-buy-cta__side hero-buy-cta__side--right" aria-hidden="true" />
                <span className="hero-buy-cta__copy">
                  <span className="deck-cta__icon-medallion hero-buy-cta__icon" aria-hidden="true">
                    <Image src={heroOrbitButtonAssets.buy.iconSrc} alt="" width={96} height={96} sizes="48px" unoptimized />
                  </span>
                  <span className="hero-buy-cta__label">{heroBuyCtaLabel}</span>
                </span>
              </a>
              <a
                className="deck-cta deck-cta--secondary hero-spread-secondary"
                href={buttonRegistry.heroOrbitSpread.href}
                data-button-id={buttonRegistry.heroOrbitSpread.id}
                aria-label={heroSpreadCtaLabel}
              >
                <span className="deck-cta__background" aria-hidden="true" />
                <span className="deck-cta__glow" aria-hidden="true" />
                <span className="deck-cta__frame" aria-hidden="true" />
                <span className="deck-cta__ornaments" aria-hidden="true">
                  <span className="deck-cta__ornament-line deck-cta__ornament-line--top">
                    <Image src={deckCtaOrnamentSrc} alt="" fill sizes="230px" unoptimized />
                  </span>
                  <span className="deck-cta__ornament-line deck-cta__ornament-line--bottom">
                    <Image src={deckCtaOrnamentSrc} alt="" fill sizes="230px" unoptimized />
                  </span>
                </span>
                <span className="deck-cta__icon-medallion hero-spread-secondary__icon" aria-hidden="true">
                  <Image
                    src={heroOrbitButtonAssets.spread.iconSrc}
                    alt=""
                    width={96}
                    height={96}
                    sizes="38px"
                    unoptimized
                  />
                </span>
                <span className="hero-spread-secondary__label">{heroSpreadCtaLabel}</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section carousel-section" aria-label={dictionary.carousel.ariaLabel}>
          <div className="card-track">
            {[...assets.carouselCards, ...assets.carouselCards].map((card, index) => {
              const localizedAlt = dictionary.carousel.cards.find((entry) => entry.id === card.id);

              return (
                <CarouselFlipCard
                  key={`${card.id}-${index}`}
                  frontSrc={card.frontSrc}
                  backSrc={card.backSrc}
                  frontAlt={localizedAlt?.frontAlt ?? ""}
                  backAlt={localizedAlt?.backAlt ?? ""}
                />
              );
            })}
          </div>
        </section>
      </div>

      <section id="wisdom" className="section split-section">
        <span id="split-section" className="section-anchor" aria-hidden="true" />
        {/* FIRE LAYER: glow и canvas-костёр вставлены первыми, чтобы работать как фоновые декоративные слои. */}
        <div className="campfire-glow" aria-hidden="true" />
        <div className="campfire-anchor" aria-hidden="true">
          <AnimatedCampfire />
        </div>
        <div className="rich-copy wisdom-copy">
          <h2>{dictionary.wisdom.heading}</h2>
          {dictionary.wisdom.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="accent">{dictionary.wisdom.accent}</p>
          <p className="sparkle-copy">{dictionary.wisdom.sparkle}</p>
          <p className="final-accent">{dictionary.wisdom.finalAccent}</p>
        </div>
        <div className="wisdom-empty" aria-hidden="true" />
      </section>

      <div className="ancient-texture-group">
        <section className="section practice-gate">
          <div className="practice-gate-content">
            <div className="wide-copy practice-gate-intro">
              <h2>{dictionary.practiceGate.heading}</h2>
              {practiceIntroParagraph ? <p>{practiceIntroParagraph}</p> : null}
            </div>

            <div className="practice-gate-video-slot">
              <video
                ref={practiceGateVideoRef}
                className="practice-gate-video"
                src="/media/rasklad.mp4"
                muted
                preload="metadata"
                playsInline
                aria-label="Practice gate video"
              />
            </div>

            <div className="practice-gate-examples">
              <div className="practice-gate-example-row">
                <div className="video-card">
                  <div className="video-card-frame">
                    <iframe
                      src={assets.featuredVideos.primary.embedUrl}
                      title={dictionary.featuredVideos.primary.iframeTitle}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
                <article className="example-copy">
                  <h2>{dictionary.featuredVideos.primary.title}</h2>
                  <p className="muted">{dictionary.featuredVideos.primary.subtitle}</p>
                  <blockquote>
                    {dictionary.featuredVideos.primary.quote}
                    <cite>{dictionary.featuredVideos.primary.quoteSource}</cite>
                  </blockquote>
                  <p>{dictionary.featuredVideos.primary.description}</p>
                </article>
              </div>

              <div className="practice-gate-example-row">
                <article className="example-copy">
                  <h2>{dictionary.featuredVideos.secondary.title}</h2>
                  <p className="muted">{dictionary.featuredVideos.secondary.subtitle}</p>
                  <blockquote>
                    {dictionary.featuredVideos.secondary.quote}
                    <cite>{dictionary.featuredVideos.secondary.quoteSource}</cite>
                  </blockquote>
                  <p>{dictionary.featuredVideos.secondary.description}</p>
                </article>
                <div className="video-card">
                  {/* CUSTOM VIDEO CARD START - practice gate example video */}
                  <div ref={practiceGateExampleFrameRef} className="video-card-frame practice-gate-example-video-frame">
                    <video
                      ref={practiceGateExampleVideoRef}
                      className="practice-gate-example-video"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                    >
                      <source src="/media/cups.mp4" type="video/mp4" />
                    </video>
                  </div>
                  {/* CUSTOM VIDEO CARD END - practice gate example video */}
                </div>
              </div>

              {practiceFinalParagraph ? <p className="practice-gate-final">{practiceFinalParagraph}</p> : null}
            </div>
          </div>
        </section>

        <section
          ref={quoteSectionRef}
          className={`section quote-section ${quoteIsVisible ? "is-visible" : ""}`}
          aria-label="Quote"
        >
          <div className="quote-section-content">
            <blockquote className="quote-section-copy">
              <p>{dictionary.practiceGate.quote}</p>
              <cite>{dictionary.practiceGate.quoteAuthor}</cite>
            </blockquote>

            <div className="quote-composition" aria-hidden="true">
              <Image
                className="quote-artifact quote-artifact-left"
                src="/media/quote-artifact-right.png"
                alt=""
                width={660}
                height={1200}
              />
              <Image
                className="quote-person"
                src="/media/quote-person.png"
                alt=""
                width={760}
                height={1200}
                priority={false}
              />
              <Image
                className="quote-artifact quote-artifact-right"
                src="/media/quote-artifact-left.png"
                alt=""
                width={1200}
                height={1200}
              />
            </div>
          </div>
        </section>
      </div>

      <section id="structure" className="section structure-section">
        <div className="structure-background-mark" aria-hidden="true" />
        <div className="section-heading structure-heading">
          <div className="structure-ornament" aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
          <h2>{dictionary.structure.heading}</h2>
          <p>{dictionary.structure.description}</p>
        </div>
        <div className="structure-grid structure-arcana-grid">
          {dictionary.structure.stats.map((stat, index) => {
            const isMajorArcana = index === 0;
            const isMinorArcana = index === 1;
            const majorArcanaStat = dictionary.structure.stats[0];

            return (
              <article
                key={stat.label}
                className={`stat structure-stat ${
                  isMajorArcana ? "structure-stat-video" : "structure-stat-minor"
                }`}
              >
                {isMajorArcana ? (
                  <>
                    {/* CUSTOM VIDEO CARD START - structure dancer video */}
                    <div ref={structureVideoFrameRef} className="structure-video-frame" aria-label="Dancer video">
                      <div className="structure-video-mask">
                        <svg className="structure-video-clip-defs" aria-hidden="true" focusable="false">
                          {/* STRUCTURE VIDEO MASK
                             The path below defines the irregular contour that clips the video.
                             clipPathUnits="objectBoundingBox" means all coordinates are normalized:
                             0 = left/top edge, 1 = right/bottom edge. Edit the decimals in the
                             path to reshape the mask without changing the video itself.
                          */}
                          <clipPath id="structureVideoBlob" clipPathUnits="objectBoundingBox">
                            <path d="M .45 .02 C .52 .05 .58 -.01 .67 .04 C .79 .1 .94 .14 .96 .27 C .99 .4 .91 .48 .91 .56 C .92 .64 1 .69 .95 .78 C .91 .85 .84 .86 .8 .94 C .72 .98 .61 1 .52 .97 C .44 .95 .41 1 .36 .93 C .32 .85 .3 .79 .24 .82 C .17 .86 .1 .78 .12 .68 C .14 .59 .16 .55 .19 .49 C .12 .43 .08 .36 .11 .31 C .14 .27 .1 .23 .09 .18 C .08 .1 .18 .07 .3 .07 C .34 .05 .39 .02 .45 .02 Z" />
                          </clipPath>
                        </svg>
                        <video
                          className="structure-video"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          aria-hidden="true"
                          onLoadedData={(event) => void event.currentTarget.play().catch(() => undefined)}
                        >
                          <source src="/media/dancer.mp4" type="video/mp4" />
                        </video>
                      </div>
                    </div>
                    {/* CUSTOM VIDEO CARD END - structure dancer video */}
                  </>
                ) : (
                  <>
                    <div className="structure-stat-copy">
                      <strong>{majorArcanaStat.value}</strong>
                      <span>{majorArcanaStat.label}</span>
                      <i className="structure-divider" aria-hidden="true" />
                      <p>{majorArcanaStat.text}</p>
                    </div>

                    <div className="structure-card-mark" aria-hidden="true" />
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                    <i className="structure-divider" aria-hidden="true" />
                    <p>{stat.text}</p>

                    {isMinorArcana ? (
                      <div className="element-chip-grid" aria-label={dictionary.structure.elementLabel}>
                        {dictionary.structure.minorElements.map((element, elementIndex) => {
                          const visualId = minorElementVisuals[elementIndex] ?? "fire";

                          return (
                            <span key={element.element} className={`element-chip element-chip-${visualId}`}>
                              <StructureIcon id={visualId} />
                              <span>
                                <strong>{element.element}</strong>
                                <small>{element.meaning}</small>
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    ) : null}
                  </>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="section suit-video-carousel-section" aria-label={dictionary.suitVideoCarousel.ariaLabel}>
        {activeSuitCarouselSlide ? (
          <div className="suit-video-carousel-shell">
            <div
              className={`suit-video-carousel-frame ${activeSuitCarouselVisual.className}`}
              style={
                {
                  "--suit-video-gradient-height": `${suitVideoGradientHeightDefault}%`,
                  "--suit-video-gradient-opacity": suitVideoGradientOpacityDefault / 100
                } as CSSProperties
              }
            >
              <div className="suit-video-carousel-media" role="img" aria-label={dictionary.suitVideoCarousel.placeholderLabel}>
                {activeSuitCarouselSlide.videoSrc ? (
                  <video
                    key={activeSuitCarouselSlide.id}
                    className="suit-video-carousel-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={activeSuitCarouselSlide.posterSrc}
                    aria-hidden="true"
                  >
                    <source src={activeSuitCarouselSlide.videoSrc} type="video/mp4" />
                  </video>
                ) : (
                  <div className="suit-video-carousel-placeholder" aria-hidden="true" />
                )}
              </div>
              <div className="suit-video-carousel-copy">
                <p className="suit-video-carousel-meta">
                  <span className="suit-video-carousel-title">
                    <span className="suit-video-carousel-icon" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Suit SVGs keep their original internal colors. */}
                      <img src={activeSuitCarouselVisual.iconSrc} alt="" />
                    </span>
                    <strong>{activeSuitCarouselSlide.name}</strong>
                  </span>
                  <span className="suit-video-carousel-meta-text">{activeSuitCarouselSlide.meta}</span>
                </p>
                <p className="suit-video-carousel-description">{activeSuitCarouselSlide.description}</p>
              </div>
            </div>

            <div className="suit-video-carousel-indicators" aria-label={dictionary.suitVideoCarousel.ariaLabel}>
              {suitVideoSlides.map((slide, index) => {
                const isActive = index === activeSuitCarouselIndex;

                return (
                  <button
                    key={slide.id}
                    className={`suit-video-carousel-indicator ${isActive ? "is-active" : ""}`}
                    type="button"
                    aria-label={`${dictionary.suitVideoCarousel.ariaLabel}: ${slide.name}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => setActiveSuitCarouselIndex(index)}
                  >
                    <span aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section className="section practice-list">
        <div className="section-heading practice-heading">
          <h2>{dictionary.practiceSection.heading}</h2>
          <p>{dictionary.practiceSection.description}</p>
        </div>
        <div className="practice-visual" aria-hidden="true">
          <Image
            src={assets.practice.visualSrc}
            alt=""
            width={445}
            height={561}
            sizes="(max-width: 767px) min(100vw, 520px), (max-width: 980px) min(30vw, 260px), min(32vw, 420px)"
          />
        </div>
        <div className="practice-grid">
          {dictionary.practiceCards.map((card) => (
            <article key={card.name} className="practice-item">
              <h3>{card.name}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="archive-background-group">
        <section id="spread" className="section spread-section">
          <div className="section-heading">
            <h2>{dictionary.spread.heading}</h2>
            <p>{dictionary.spread.description}</p>
          </div>

          {/* SPREAD REDESIGN: board, slots, deck, loading, and reset/result flow live here. */}
          <div ref={spreadSelectionRef} className="spread-reading" data-stage={spreadStage}>
            <div className="spread-board" aria-live="polite">
              {/* SPREAD REDESIGN: these three slots fill in the user's click order. */}
              <div className="spread-slots" aria-label={dictionary.spread.selectionPrompt}>
                {Array.from({ length: spreadSlotCount }, (_, index) => {
                  const card = spread[index];

                  return (
                    <div key={index} className={`spread-slot ${card ? "is-filled" : ""}`}>
                      <span className="spread-slot-number">{index + 1}</span>
                      {card ? (
                        <Image
                          className="spread-slot-image"
                          src={card.imageSrc}
                          alt={card.imageAlt}
                          fill
                          sizes="(max-width: 680px) 28vw, 170px"
                        />
                      ) : (
                        <span className="spread-slot-placeholder">{dictionary.spread.slotPlaceholder}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* SPREAD REDESIGN: visible only after the third selection, before results render. */}
              {isSpreadPreparing ? (
                <div className="spread-preparing-overlay" role="status">
                  <span className="spread-preparing-spinner" aria-hidden="true" />
                  <span>{dictionary.spread.preparing}</span>
                </div>
              ) : null}
            </div>

            {!isSpreadPreparing && !isSpreadComplete ? (
              <>
                <p className="spread-selection-prompt">{dictionary.spread.selectionPrompt}</p>
                {/* SPREAD REDESIGN: 21 separate buttons use the same back image but map to hidden deck positions. */}
                <div
                  className={`spread-deck ${isShufflingSpread ? "is-shuffling" : ""}`}
                  aria-label={dictionary.spread.selectionPrompt}
                >
                  {spreadDeckOrder.map((card, index) => {
                    const isSelected = selectedSpreadIndexes.includes(index);
                    const rotation = (index - Math.floor(spreadDeckOrder.length / 2)) * 0.22;
                    const hoverRotation = rotation + (index % 2 === 0 ? 1.4 : -1.4);

                    return (
                      <button
                        key={card.id}
                        className={`spread-deck-card ${isSelected ? "is-selected" : ""}`}
                        type="button"
                        aria-label={`${dictionary.spread.slotPlaceholder} ${index + 1}`}
                        disabled={!canSelectSpreadCards || isSelected}
                        onClick={() => selectSpreadCard(index)}
                        style={
                          {
                            "--spread-card-rotation": `${rotation}deg`,
                            "--spread-card-hover-rotation": `${hoverRotation}deg`,
                            "--shuffle-delay": `${(index % 7) * 32}ms`
                          } as CSSProperties
                        }
                      >
                        <Image
                          className="spread-deck-card-image"
                          src={assets.spreadCardBackSrc}
                          alt=""
                          fill
                          sizes="(max-width: 680px) 62px, (max-width: 1100px) 82px, 112px"
                        />
                      </button>
                    );
                  })}
                </div>

                {isSpreadInitial ? (
                  <div className="spread-actions">
                    <button
                      className="draw-button spread-action-button"
                      type="button"
                      onClick={handleShuffleSpread}
                      disabled={isShufflingSpread}
                      data-button-id={buttonRegistry.spreadShuffle.id}
                    >
                      {dictionary.buttons.spreadShuffle}
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          {isSpreadComplete ? (
            <>
              {/* SPREAD REDESIGN: completed spread keeps the existing image + title + description result format. */}
              <div ref={spreadResultsRef} className="spread-grid">
                {spread.map((card) => (
                  <SpreadResultCard key={card.id} card={card} />
                ))}
              </div>
              <button
                className="draw-button spread-reset-button"
                type="button"
                onClick={resetSpread}
                data-button-id={buttonRegistry.spreadReset.id}
              >
                {dictionary.buttons.spreadReset}
              </button>
            </>
          ) : null}
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-copy">
            <h2>{dictionary.contact.heading}</h2>
          </div>
          <form id={formRegistry.lead.id} className="lead-form" onFocusCapture={trackLeadFormStart} onSubmit={submitLead}>
            <label>
              {dictionary.form.nameLabel}
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              {dictionary.form.contactLabel}
              <input name="contact" type="text" autoComplete="email" required />
            </label>
            <label>
              {dictionary.form.messageLabel}
              <textarea name="message" rows={4} />
            </label>
            <button type="submit" disabled={formState === "sending"} data-button-id={buttonRegistry.submitLead.id}>
              {formState === "sending" ? dictionary.buttons.submitSending : dictionary.buttons.submitIdle}
            </button>
            {formState === "sent" && <p className="form-note" role="status">{dictionary.feedback.sent}</p>}
            {formState === "error" && <p className="form-note error" role="alert">{formError || dictionary.feedback.error}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
