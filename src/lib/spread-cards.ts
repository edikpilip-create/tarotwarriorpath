export type SpreadCard = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

export const spreadCardIds = [
  "mag",
  "high-priestess",
  "empress",
  "emperor",
  "hierophant",
  "lovers",
  "chariot",
  "strength",
  "hermit",
  "wheel-of-fortune",
  "justice",
  "hanged-man",
  "death",
  "temperance",
  "devil",
  "tower",
  "star",
  "moon",
  "sun",
  "judgement",
  "world",
] as const;

export type SpreadCardId = (typeof spreadCardIds)[number];

export const spreadCardImageSrcById: Record<SpreadCardId, string> = {
  mag: "/media/tarot-magician.jpg",
  "high-priestess": "/media/tarot-high-priestess.jpg",
  empress: "/media/tarot-empress.jpg",
  emperor: "/media/tarot-emperor.jpg",
  hierophant: "/media/tarot-hierophant.jpg",
  lovers: "/media/tarot-lovers.jpg",
  chariot: "/media/tarot-chariot.jpg",
  strength: "/media/tarot-strength.jpg",
  hermit: "/media/tarot-hermit.jpg",
  "wheel-of-fortune": "/media/tarot-wheel-of-fortune.jpg",
  justice: "/media/tarot-justice.jpg",
  "hanged-man": "/media/tarot-hanged-man.jpg",
  death: "/media/tarot-death.jpg",
  temperance: "/media/tarot-temperance.jpg",
  devil: "/media/tarot-devil.jpg",
  tower: "/media/tarot-tower.jpg",
  star: "/media/tarot-star.jpg",
  moon: "/media/tarot-moon.jpg",
  sun: "/media/tarot-sun.jpg",
  judgement: "/media/tarot-judgement.jpg",
  world: "/media/tarot-world.jpg",
};

export type SpreadCardContent = {
  id: SpreadCardId;
  title: string;
  description: string;
  imageAlt: string;
  imageSrc?: string;
};

export function createSpreadCards(entries: readonly SpreadCardContent[]): SpreadCard[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    description: entry.description,
    imageSrc: entry.imageSrc ?? spreadCardImageSrcById[entry.id],
    imageAlt: entry.imageAlt,
  }));
}

export function drawSpreadCards(
  cards: readonly SpreadCard[],
  count: number,
  random: () => number = Math.random,
): SpreadCard[] {
  return shuffleSpreadCards(cards, random).slice(0, count);
}

// SPREAD REDESIGN: full-deck Fisher-Yates shuffle for hidden card order without mutating the source database.
export function shuffleSpreadCards(cards: readonly SpreadCard[], random: () => number = Math.random): SpreadCard[] {
  const shuffledCards = [...cards];

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffledCards[index], shuffledCards[swapIndex]] = [shuffledCards[swapIndex], shuffledCards[index]];
  }

  return shuffledCards;
}
