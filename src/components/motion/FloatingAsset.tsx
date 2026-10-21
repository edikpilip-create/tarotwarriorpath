import Image from "next/image";
import type { CSSProperties } from "react";

import { animationDurations, animationEasings } from "@/lib/animation-presets";

type FloatingAssetStyle = CSSProperties & {
  "--floating-amplitude"?: string;
  "--floating-delay"?: string;
  "--floating-duration"?: string;
  "--floating-left"?: string;
  "--floating-opacity"?: number;
  "--floating-top"?: string;
  "--floating-width"?: string;
  "--floating-z-index"?: number;
};

export type FloatingAssetProps = {
  alt?: string;
  amplitude?: number;
  className?: string;
  delay?: number;
  disableOnMobile?: boolean;
  height?: number;
  opacity?: number;
  position: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
  priority?: boolean;
  size: number | string;
  speed?: number;
  src: string;
  width?: number;
  zIndex?: number;
};

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toCssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

export function FloatingAsset({
  alt = "",
  amplitude = 18,
  className,
  delay = 0,
  disableOnMobile = false,
  height,
  opacity = 0.72,
  position,
  priority = false,
  size,
  speed = animationDurations.ambient,
  src,
  width,
  zIndex = 0,
}: FloatingAssetProps) {
  const resolvedWidth = width ?? (typeof size === "number" ? size : 800);
  const resolvedHeight = height ?? resolvedWidth;
  const floatingStyle: FloatingAssetStyle = {
    "--floating-amplitude": `${amplitude}px`,
    "--floating-delay": `${delay}ms`,
    "--floating-duration": `${speed}ms`,
    "--floating-left": position.left,
    "--floating-opacity": opacity,
    "--floating-top": position.top,
    "--floating-width": toCssSize(size),
    "--floating-z-index": zIndex,
    right: position.right,
    bottom: position.bottom,
    animationTimingFunction: animationEasings.ambient,
  };

  return (
    <div
      className={joinClasses("floating-asset", disableOnMobile && "floating-asset-mobile-hidden", className)}
      style={floatingStyle}
      aria-hidden={alt ? undefined : true}
    >
      <Image
        src={src}
        alt={alt}
        width={resolvedWidth}
        height={resolvedHeight}
        priority={priority}
        sizes={toCssSize(size)}
      />
    </div>
  );
}
