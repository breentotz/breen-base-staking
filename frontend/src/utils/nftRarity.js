export const BUILDER_NFT_RARITIES = {
  COMMON: {
    name: "Common",
    title: "Builder Spark",
    icon: "⚡",
  },

  RARE: {
    name: "Rare",
    title: "Base Pioneer",
    icon: "🔵",
  },

  EPIC: {
    name: "Epic",
    title: "Onchain Architect",
    icon: "💠",
  },

  LEGENDARY: {
    name: "Legendary",
    title: "Genesis Builder",
    icon: "👑",
  },
};

export function getBuilderNFTRarity(tokenId) {
  const id = Number(tokenId);

  if (id > 0 && id % 20 === 0) {
    return BUILDER_NFT_RARITIES.LEGENDARY;
  }

  if (id > 0 && id % 10 === 0) {
    return BUILDER_NFT_RARITIES.EPIC;
  }

  if (id > 0 && id % 5 === 0) {
    return BUILDER_NFT_RARITIES.RARE;
  }

  return BUILDER_NFT_RARITIES.COMMON;
}