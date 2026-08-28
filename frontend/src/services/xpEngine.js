const XP_ACTIONS = {
  // ========================================
  // BREEN BUILDER XP V2
  // ========================================

  // Onboarding
  CONNECT_WALLET: 0,

  // BREEN / Onchain participation
  APPROVE_BREEN: 5,
  STAKE_BREEN: 20,
  UNSTAKE_BREEN: 10,

  // Verified open-source contribution
VERIFIED_GITHUB_PR: 25,

  // Exploration
  VISIT_NFT: 0,
  VISIT_MARKET: 0,

  // Daily participation
  // Actual Daily Check-In reward is
  // randomized to 1–5 XP inside awardXP().
  DAILY_LOGIN: 5,

  // NFT milestones
  MINT_BUILDER_NFT: 50,

  // Future NFT V2 progression rewards
MINT_GENESIS_NFT: 25,
MINT_COMMON_NFT: 40,
MINT_RARE_NFT: 70,
MINT_EPIC_NFT: 120,
MINT_LEGENDARY_NFT: 200,

  // ========================================
  // FUTURE BASE BUILDER MILESTONES
  // These become active when their
  // verification systems are implemented.
  // ========================================

  DEPLOY_CONTRACT: 100,
DEPLOY_CONTRACT_SEPOLIA: 150,
DEPLOY_CONTRACT_MAINNET: 300,

// Future verified-contract rewards
VERIFY_CONTRACT_SEPOLIA: 150,
VERIFY_CONTRACT_MAINNET: 250,
};

export function getXP(action) {
  return XP_ACTIONS[action] || 0;
}

export function calculateLevel(totalXP) {
  return Math.floor(totalXP / 100) + 1;
}

export function getProgress(totalXP) {
  return totalXP % 100;
}