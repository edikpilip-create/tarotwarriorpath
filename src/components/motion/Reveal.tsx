"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { animationVariants, type RevealVariantName } from "@/lib/animation-presets";

type RevealElement = "div" | "section" | "article" | "span" | "li" | "p" | "header" | "footer";

type MotionStyle = CSSProperties & {
  "--reveal-delay"?: string;
  "--reveal-duration"?: string;
  "--reveal-easing"?: string;
  "--reveal-from-transform"?: string;
};

export type RevealProps = {
  as?: RevealElement;
  children: ReactNode;
  className?: string;
  delay?: number;
  disabled?: boolean;
  duration?: number;
  once?: boolean;
  rootMargin?: string;
  style?: CSSProperties;
  threshold?: number;
  variant?: RevealVariantName;
};

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  disabled = false,
  duration,
  once = true,
  rootMargin = "0px 0px -12% 0px",
  style,
  threshold = 0.18,
  variant = "fadeUp",
}: RevealProps) {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(disabled);
  const shouldShow = disabled || isVisible;
  const preset = animationVariants[variant];
  const revealStyle: MotionStyle = {
    ...style,
    "--reveal-delay": `${delay}ms`,
    "--reveal-duration": `${duration ?? preset.duration}ms`,
    "--reveal-easing": preset.easing,
    "--reveal-from-transform": "transform" in preset.from ? preset.from.transform : "none",
  };

  useEffect(() => {
    const element = elementRef.current;

    if (!element || disabled) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reducedMotion.matches) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.disconnect();
          }

          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [disabled, once, rootMargin, threshold]);

  const revealClassName = joinClasses("motion-reveal", shouldShow && "is-visible", className);
  const setElementRef = (element: HTMLElement | null) => {
    elementRef.current = element;
  };

  switch (as) {
    case "article":
      return <article ref={setElementRef} className={revealClassName} style={revealStyle}>{children}</article>;
    case "footer":
      return <footer ref={setElementRef} className={revealClassName} style={revealStyle}>{children}</footer>;
    case "header":
      return <header ref={setElementRef} className={revealClassName} style={revealStyle}>{children}</header>;
    case "li":
      return <li ref={setElementRef} className={revealClassName} style={revealStyle}>{children}</li>;
    case "p":
      return <p ref={setElementRef} className={revealClassName} style={revealStyle}>{children}</p>;
    case "section":
      return <section ref={setElementRef} className={revealClassName} style={revealStyle}>{children}</section>;
    case "span":
      return <span ref={setElementRef} className={revealClassName} style={revealStyle}>{children}</span>;
    default:
      return <div ref={setElementRef} className={revealClassName} style={revealStyle}>{children}</div>;
  }
}
