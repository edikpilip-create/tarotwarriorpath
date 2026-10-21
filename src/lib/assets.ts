import { existsSync } from "node:fs";
import { join } from "node:path";

import { type Locale } from "./i18n/config.ts";

import { spreadCardIds, spreadCardImageSrcById, type SpreadCardId } from "./spread-cards.ts";

type CarouselAsset = {
  id: string;
  frontSrc: string;
  backSrc: string;
};

type FeaturedVideoAsset = {
  embedUrl: string;
};

export type LocalizedAssets = {
  hero: {
    maskSrc: string;
  };
  practice: {
    visualSrc: string;
  };
  textures: {
    ancientArchiveSrc: string;
  };
  carouselCards: CarouselAsset[];
  featuredVideos: {
    primary: FeaturedVideoAsset;
    secondary: FeaturedVideoAsset;
  };
  spreadCardBackSrc: string;
  spreadCardImages: Record<SpreadCardId, string>;
};

const sharedAssets = {
  hero: {
    maskSrc: "/media/warrior-mask.png",
  },
  practice: {
    visualSrc: "/media/practice-89.avif",
  },
  textures: {
    ancientArchiveSrc: "/media/ancient-archive-texture.jpg",
  },
  carouselCards: [
    {
      id: "card-1",
      frontSrc: "/media/carousel-lovers.webp",
      backSrc: "/media/carousel-lovers-back.webp",
    },
    {
      id: "card-2",
      frontSrc: "/media/carousel-mage.webp",
      backSrc: "/media/carousel-mage-back.webp",
    },
    {
      id: "card-3",
      frontSrc: "/media/carousel-power.webp",
      backSrc: "/media/carousel-power-back.webp",
    },
    {
      id: "card-4",
      frontSrc: "/media/carousel-sun.webp",
      backSrc: "/media/carousel-sun-back.webp",
    },
    {
      id: "card-5",
      frontSrc: "/media/carousel-zhrica.webp",
      backSrc: "/media/carousel-zhrica-back.webp",
    },
    {
      id: "card-6",
      frontSrc: "/media/carousel-otshelnik.webp",
      backSrc: "/media/carousel-otshelnik-back.webp",
    },
  ] satisfies CarouselAsset[],
  featuredVideos: {
    primary: {
      embedUrl: "https://player.vimeo.com/video/1196251431?autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&badge=0&transparent=0&dnt=1",
    },
    secondary: {
      embedUrl: "https://player.vimeo.com/video/1196251432?autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&badge=0&transparent=0&dnt=1",
    },
  },
  // SPREAD REDESIGN: one shared back image is rendered 21 times as separate interactive deck buttons.
  spreadCardBackSrc: "/media/card-turnover-spread.png",
} as const;

const localeOverrides: Partial<Record<Locale, Partial<LocalizedAssets>>> = {};
const publicMediaDirectory = join(process.cwd(), "public", "media");

export function getLocalizedAssets(locale: Locale): LocalizedAssets {
  const overrides = localeOverrides[locale];

  return {
    hero: {
      maskSrc: overrides?.hero?.maskSrc ?? sharedAssets.hero.maskSrc,
    },
    practice: {
      visualSrc: overrides?.practice?.visualSrc ?? sharedAssets.practice.visualSrc,
    },
    textures: {
      ancientArchiveSrc: overrides?.textures?.ancientArchiveSrc ?? sharedAssets.textures.ancientArchiveSrc,
    },
    // Localized carousel files live in /public/media/locales/{lang}/carousel/
    // using the same filenames as the shared /public/media/ fallback assets.
    carouselCards: overrides?.carouselCards ?? buildCarouselCards(locale),
    featuredVideos: {
      primary: overrides?.featuredVideos?.primary ?? sharedAssets.featuredVideos.primary,
      secondary: overrides?.featuredVideos?.secondary ?? sharedAssets.featuredVideos.secondary,
    },
    spreadCardBackSrc: overrides?.spreadCardBackSrc ?? sharedAssets.spreadCardBackSrc,
    // Localized spread files live in /public/media/locales/{lang}/spread/
    // using the same filenames as the shared /public/media/ fallback assets.
    spreadCardImages: buildSpreadCardImages(locale),
  };
}

function buildCarouselCards(locale: Locale): CarouselAsset[] {
  return sharedAssets.carouselCards.map((card) => ({
    ...card,
    frontSrc: resolveLocalizedMediaPath(locale, "carousel", getFileName(card.frontSrc), card.frontSrc),
    backSrc: resolveLocalizedMediaPath(locale, "carousel", getFileName(card.backSrc), card.backSrc),
  }));
}

function buildSpreadCardImages(locale: Locale): Record<SpreadCardId, string> {
  return Object.fromEntries(
    spreadCardIds.map((id) => [
      id,
      resolveLocalizedMediaPath(
        locale,
        "spread",
        getFileName(spreadCardImageSrcById[id]),
        spreadCardImageSrcById[id],
      ),
    ]),
  ) as Record<SpreadCardId, string>;
}

function resolveLocalizedMediaPath(
  locale: Locale,
  category: "carousel" | "spread",
  fileName: string,
  fallbackPath: string,
): string {
  const localizedRelativePath = `/media/locales/${locale}/${category}/${fileName}`;
  const localizedAbsolutePath = join(publicMediaDirectory, "locales", locale, category, fileName);

  return existsSync(localizedAbsolutePath) ? localizedRelativePath : fallbackPath;
}

function getFileName(publicPath: string): string {
  const parts = publicPath.split("/");

  return parts[parts.length - 1] ?? publicPath;
}
