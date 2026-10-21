import type { SpreadCard } from "./spread-cards";

type SpreadResultsScrollTopArgs = {
  elementTop: number;
  offset?: number;
};

export function getInitialSpreadState(): SpreadCard[] {
  return [];
}

export function getSpreadResultsScrollTop({
  elementTop,
  offset = 0,
}: SpreadResultsScrollTopArgs): number {
  const alignedTop = elementTop - offset;

  return Math.max(0, Math.round(alignedTop));
}
