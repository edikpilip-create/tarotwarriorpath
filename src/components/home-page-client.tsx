"use client";

import Image from "next/image";
import type { CSSProperties, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { analyticsEventNames, trackEvent } from "@/lib/analytics";
import { type LocalizedAssets } from "@/lib/assets";
import { buttonRegistry, formRegistry } from "@/lib/buttons";
import { type Locale } from "@/lib/i18n/config";
import type { LocaleDictionary } from "@/lib/i18n/types";
import { createSpreadCards, drawSpreadCards, type SpreadCard, type SpreadCardId } from "@/lib/spread-cards";
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

const spreadResultsScrollNudge = 56;
const leadChannel = "telegram";

type HomePageClientProps = {
  lang: Locale;
  dictionary: LocaleDictionary;
  assets: LocalizedAssets;
};

type StructureVisualId = "air" | "fire" | "earth" | "water";

const suitVisuals: Array<{ id: StructureVisualId; className: string; iconSrc: string }> = [
  { id: "air", className: "suit-card-air", iconSrc: "/media/icons/suits/swords.svg" },
  { id: "fire", className: "suit-card-fire", iconSrc: "/media/icons/suits/wands.svg" },
  { id: "earth", className: "suit-card-earth", iconSrc: "/media/icons/suits/pentacles.svg" },
  { id: "water", className: "suit-card-water", iconSrc: "/media/icons/suits/cups.svg" }
];

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

function StructureIcon({ id }: { id: StructureVisualId }) {
  // Keep these SVGs as plain image assets so their internal colors, masks, and effects stay untouched.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={elementIconSrc[id]} alt={elementIconAlt[id]} className="element-icon-image" />;
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
  const spreadDeck = createSpreadCards(
    dictionary.spread.cards.map((card) => {
      const id = card.id as SpreadCardId;

      return {
        ...card,
        id,
        imageSrc: card.imageSrc ?? assets.spreadCardImages[id]
      };
    })
  );

  const [spread, setSpread] = useState<SpreadCard[]>(getInitialSpreadState);
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const spreadResultsRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollToSpreadRef = useRef(false);
  const hasTrackedLeadFormStartRef = useRef(false);

  useEffect(() => {
    trackEvent(analyticsEventNames.pageView, {
      locale: lang,
      page_path: window.location.pathname
    });
  }, [lang]);

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

  function drawCards() {
    shouldScrollToSpreadRef.current = true;
    const drawnSpread = drawSpreadCards(spreadDeck, 3);

    trackEvent(analyticsEventNames.spreadStarted, {
      locale: lang,
      page_path: getPagePath(),
      spread_cards_count: drawnSpread.length
    });

    setSpread(drawnSpread);

    trackEvent(analyticsEventNames.spreadCompleted, {
      locale: lang,
      page_path: getPagePath(),
      spread_cards_count: drawnSpread.length
    });
  }

  useEffect(() => {
    if (!spread.length || !shouldScrollToSpreadRef.current || !spreadResultsRef.current) {
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
        elementHeight: rect.height,
        viewportHeight: window.innerHeight,
        offset: 24
      });

      window.scrollTo({
        top: scrollTop + spreadResultsScrollNudge,
        behavior: "smooth"
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [spread]);

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sending");

    const formData = new FormData(event.currentTarget);
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

    const delivered = response?.ok === true;

    setFormState(delivered ? "sent" : "error");

    if (delivered) {
      trackEvent(analyticsEventNames.generateLead, {
        locale: lang,
        page_path: getPagePath(),
        form_id: formRegistry.lead.id,
        lead_channel: leadChannel,
        telegram_delivery_status: "success"
      });
      event.currentTarget.reset();

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
      <header className="site-nav">
        <a href={buttonRegistry.brand.href} className="brand" data-button-id={buttonRegistry.brand.id}>
          {dictionary.buttons.brand}
        </a>
        <div className="site-nav-shell">
          <nav aria-label={dictionary.nav.ariaLabel}>
            <a href={buttonRegistry.navWisdom.href} data-button-id={buttonRegistry.navWisdom.id}>
              {dictionary.buttons.navWisdom}
            </a>
            <a href={buttonRegistry.navStructure.href} data-button-id={buttonRegistry.navStructure.id}>
              {dictionary.buttons.navStructure}
            </a>
            <a href={buttonRegistry.navSpread.href} data-button-id={buttonRegistry.navSpread.id}>
              {dictionary.buttons.navSpread}
            </a>
            <a href={buttonRegistry.navContact.href} data-button-id={buttonRegistry.navContact.id}>
              {dictionary.buttons.navContact}
            </a>
          </nav>
          <LanguageSwitcher
            currentLocale={lang}
            ariaLabel={dictionary.languageSwitcher.ariaLabel}
            labels={dictionary.languageSwitcher.labels}
          />
        </div>
      </header>

      <section id="top" className="hero section">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-art" aria-hidden="true">
          <Image
            src={assets.hero.maskSrc}
            alt=""
            width={1536}
            height={1024}
            priority
            sizes="(max-width: 768px) 120vw, 980px"
          />
        </div>
        <div className="hero-content">
          <p className="overline">{dictionary.hero.overline}</p>
          <h1>
            <span>{dictionary.hero.titlePrefix}</span>
            {dictionary.hero.title}
          </h1>
          <p className="lead">{dictionary.hero.lead}</p>
          <a
            className="primary-link"
            href={buttonRegistry.heroCta.href}
            data-button-id={buttonRegistry.heroCta.id}
            onClick={() => {
              trackEvent(analyticsEventNames.heroCtaClick, {
                locale: lang,
                page_path: getPagePath(),
                cta_location: "hero"
              });
            }}
          >
            {dictionary.buttons.heroCta}
          </a>
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

      <section id="wisdom" className="section split-section">
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
          <div className="wide-copy">
            <p className="eyebrow">{dictionary.practiceGate.eyebrow}</p>
            <h2>{dictionary.practiceGate.heading}</h2>
            {dictionary.practiceGate.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <blockquote>
              {dictionary.practiceGate.quote}
              <cite>{dictionary.practiceGate.quoteAuthor}</cite>
            </blockquote>
          </div>
        </section>

        <section className="section example-section">
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
        </section>

        <section className="section video-section">
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
            <div className="video-card-frame">
              <iframe
                src={assets.featuredVideos.secondary.embedUrl}
                title={dictionary.featuredVideos.secondary.iframeTitle}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
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
          <p className="eyebrow">{dictionary.structure.eyebrow}</p>
          <h2>{dictionary.structure.heading}</h2>
          <p>{dictionary.structure.description}</p>
        </div>
        <div className="structure-grid structure-arcana-grid">
          {dictionary.structure.stats.map((stat, index) => {
            const isMinorArcana = index === 1;

            return (
              <article
                key={stat.label}
                className={`stat structure-stat ${isMinorArcana ? "structure-stat-minor" : "structure-stat-major"}`}
              >
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
              </article>
            );
          })}
        </div>
        <div className="suits-grid structure-suits-grid">
          {dictionary.suits.map((suit, index) => {
            const visual = suitVisuals[index] ?? suitVisuals[0];

            return (
              <article key={suit.name} className={`suit-card structure-suit-card ${visual.className}`}>
                <div className="suit-card-top">
                  <span className="suit-icon-badge" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Original SVGs must render as plain image files without recoloring. */}
                    <img className="suit-icon-image" src={visual.iconSrc} alt="" />
                  </span>
                  <span className="suit-element-name">{suit.element}</span>
                </div>
                <h3>{suit.name}</h3>
                <p className="muted">{dictionary.structure.totemsLabel}: {suit.totems}</p>
                <p>{suit.text}</p>
              </article>
            );
          })}
        </div>
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
          {dictionary.practiceCards.map((card, index) => (
            <article key={card.name} className="practice-item">
              <span>{String(index + 1).padStart(2, "0")}</span>
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
          <button className="draw-button" type="button" onClick={drawCards} data-button-id={buttonRegistry.spreadDraw.id}>
            {dictionary.buttons.spreadDraw}
          </button>
          <div ref={spreadResultsRef} className="spread-grid">
            {spread.map((card) => (
              <SpreadResultCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-copy">
            <p className="eyebrow">{dictionary.contact.eyebrow}</p>
            <h2>{dictionary.contact.heading}</h2>
            <p>{dictionary.contact.description}</p>
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
            {formState === "sent" && <p className="form-note">{dictionary.feedback.sent}</p>}
            {formState === "error" && <p className="form-note error">{dictionary.feedback.error}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
