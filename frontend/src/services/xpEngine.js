const XP_ACTIONS = {
  CONNECT_WALLET: 5,
  STAKE_BREEN: 20,
  UNSTAKE_BREEN: 10,
  APPROVE_BREEN: 5,
  VISIT_NFT: 2,
  VISIT_MARKET: 2,
  DAILY_LOGIN: 15,
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