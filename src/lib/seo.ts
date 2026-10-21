import type { Metadata, MetadataRoute } from "next";

import { getSupportedLocales, type Locale } from "./i18n/config.ts";
import type { LocaleDictionary } from "./i18n/types.ts";

const localeToOpenGraphLocale: Record<Locale, string> = {
  en: "en_US",
  uk: "uk_UA",
  ru: "ru_RU",
};

type Environment = Readonly<Record<string, string | undefined>>;

let hasWarnedAboutLocalSiteUrl = false;

export function getSiteUrl(env: Environment = process.env): string {
  const configuredUrl = env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelEnvironment = env.VERCEL_TARGET_ENV || env.VERCEL_ENV;
  const vercelHostname = vercelEnvironment === "production"
    ? env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || env.VERCEL_URL?.trim()
    : env.VERCEL_URL?.trim();
  const resolvedUrl = configuredUrl || (vercelHostname ? `https://${vercelHostname}` : undefined);

  if (!resolvedUrl) {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL or a Vercel deployment URL is required for production builds and runtime.",
      );
    }

    if (!hasWarnedAboutLocalSiteUrl) {
      console.warn(
        "NEXT_PUBLIC_SITE_URL is not set; using http://localhost:3000 for local development only.",
      );
      hasWarnedAboutLocalSiteUrl = true;
    }

    return "http://localhost:3000";
  }

  const siteUrl = new URL(resolvedUrl);

  if (siteUrl.protocol !== "http:" && siteUrl.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http:// or https://.");
  }

  return siteUrl.toString().replace(/\/$/, "");
}

export function isIndexingEnabled(env: Environment = process.env): boolean {
  const vercelEnvironment = env.VERCEL_TARGET_ENV || env.VERCEL_ENV;

  if (vercelEnvironment && vercelEnvironment !== "production") {
    return false;
  }

  return (env.DEPLOYMENT_ENV ?? vercelEnvironment) === "production";
}

export function buildLocaleMetadata(
  locale: Locale,
  dictionary: LocaleDictionary,
  siteUrl: string = getSiteUrl(),
  indexingEnabled: boolean = isIndexingEnabled(),
): Metadata {
  const canonicalPath = `/${locale}`;
  const alternateLanguages = Object.fromEntries(
    getSupportedLocales().map((entry) => [entry, `/${entry}`]),
  );

  return {
    metadataBase: new URL(siteUrl),
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    keywords: dictionary.meta.keywords,
    authors: [{ name: "Art of Seeing" }],
    alternates: {
      canonical: canonicalPath,
      languages: {
        ...alternateLanguages,
        "x-default": "/en",
      },
    },
    openGraph: {
      title: dictionary.meta.siteName,
      description: dictionary.meta.ogDescription,
      url: `${siteUrl}${canonicalPath}`,
      siteName: dictionary.meta.siteName,
      images: [
        {
          url: "/og.svg",
          width: 1200,
          height: 630,
          alt: dictionary.meta.ogImageAlt,
        },
      ],
      locale: localeToOpenGraphLocale[locale],
      alternateLocale: getSupportedLocales()
        .filter((entry) => entry !== locale)
        .map((entry) => localeToOpenGraphLocale[entry]),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.meta.siteName,
      description: dictionary.meta.twitterDescription,
      images: ["/og.svg"],
    },
    icons: {
      icon: "/favicon.svg",
    },
    robots: {
      index: indexingEnabled,
      follow: indexingEnabled,
    },
  };
}

export function buildRobotsPolicy(
  env: Environment = process.env,
  siteUrl: string = getSiteUrl(env),
): MetadataRoute.Robots {
  if (!isIndexingEnabled(env)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

export function buildSitemapEntries(siteUrl: string = getSiteUrl()): MetadataRoute.Sitemap {
  return getSupportedLocales().map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  }));
}
