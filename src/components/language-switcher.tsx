"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { languageSwitcherButtonRegistry } from "@/lib/buttons";
import { buildLanguageSwitcherPath, getSupportedLocales, type Locale } from "@/lib/i18n/config";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  ariaLabel: string;
  labels: Record<Locale, string>;
};

export function LanguageSwitcher({ currentLocale, ariaLabel, labels }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const menuId = useId();
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHash = () => {
      setHash(window.location.hash);
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);

    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={switcherRef} className="language-switcher" aria-label={ariaLabel}>
      <button
        className="language-switcher-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{labels[currentLocale]}</span>
        <span className="language-switcher-chevron" aria-hidden="true" />
      </button>
      <div id={menuId} className="language-switcher-menu" role="menu" data-open={isOpen} aria-hidden={!isOpen}>
        {getSupportedLocales().map((locale) => {
          const button = languageSwitcherButtonRegistry[locale];

          return (
            <Link
              key={locale}
              href={buildLanguageSwitcherPath(pathname || `/${currentLocale}`, locale, hash)}
              className={locale === currentLocale ? "is-active" : undefined}
              aria-current={locale === currentLocale ? "page" : undefined}
              data-button-id={button.id}
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => setIsOpen(false)}
            >
              {labels[locale]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
