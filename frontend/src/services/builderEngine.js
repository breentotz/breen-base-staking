import { builderData } from "../data/builderData";
import { achievementData } from "../data/achievementData";
import { timelineData } from "../data/timelineData";
import { streakData } from "../data/streakData";
import { activityData } from "../data/activityData";
import {
  getActivities,
  addActivity,
} from "../utils/activity";
import { getXP } from "./xpEngine";


const LEGACY_BUILDER_WALLET =
  "0x06d71eed44d152d88e6769afbb7cb3bbba2471d0";


export function getWalletReputationBreakdown(
  wallet = null
) {
  if (!wallet) {
    return {
      build: 0,
      community: 0,
      learning: 0,
      openSource: 0,
    };
  }

  const normalizedWallet =
    wallet.toLowerCase();

  // Preserve the old legacy profile,
// while allowing verified Open Source
// contributions to grow its reputation.
if (
  normalizedWallet ===
  LEGACY_BUILDER_WALLET
) {
  const legacyActivities =
    getActivities(normalizedWallet);

  const legacyOpenSourceActivities =
  legacyActivities.filter(
    (activity) =>
      activity.type === "open_source" &&
      activity.metadata?.verified === true &&
      activity.metadata?.provider === "github" &&
      Boolean(activity.metadata?.proofId)
  ).length;

  const legacyOpenSource =
    Math.min(
      builderData.reputation.openSource +
        legacyOpenSourceActivities * 15,
      100
    );

  return {
    build:
      builderData.reputation.build,

    community:
      builderData.reputation.community,

    learning:
      builderData.reputation.learning,

    openSource:
      legacyOpenSource,
  };
}

  const activities =
    getActivities(normalizedWallet);

  const achievements =
    getCompletedAchievements(
      normalizedWallet
    ).length;

  const activeDays =
    getBuilderActiveDays(
      normalizedWallet
    );

  const streakData =
    getStoredBuilderStreak(
      normalizedWallet
    );

  const longestStreak =
    Number(
      streakData?.longest || 0
    );

  const deploymentActivities =
    activities.filter(
      (activity) =>
        activity.type === "deployment"
    ).length;

  const stakingActivities =
    activities.filter(
      (activity) =>
        activity.type === "staking"
    ).length;

  const nftActivities =
    activities.filter(
      (activity) =>
        activity.type === "nft"
    ).length;

    const communityActivities =
  activities.filter(
    (activity) =>
      activity.type === "community"
  ).length;


const openSourceActivities =
  activities.filter(
    (activity) =>
      activity.type === "open_source" &&
      activity.metadata?.verified === true &&
      activity.metadata?.provider === "github" &&
      Boolean(activity.metadata?.proofId)
  ).length;


  const build =
    Math.min(
      achievements * 4 +
      deploymentActivities * 8 +
      stakingActivities * 2 +
      nftActivities * 3,
      100
    );

  const community =
  Math.min(
    communityActivities * 10,
    100
  );

  const learning =
    Math.min(
      activeDays * 4 +
      longestStreak * 3,
      100
    );

  const openSource =
  Math.min(
    openSourceActivities * 15,
    100
  );

  return {
    build,
    community,
    learning,
    openSource,
  };
}


export function getWalletReputation(
  wallet = null
) {
  if (!wallet) {
    return 0;
  }

  const breakdown =
    getWalletReputationBreakdown(wallet);

  const overall =
    breakdown.build * 0.5 +
    breakdown.community * 0.2 +
    breakdown.learning * 0.2 +
    breakdown.openSource * 0.1;

  return Math.min(
    Math.round(overall),
    100
  );
}


export function getWalletStreak(wallet = null) {
  if (!wallet) {
    return 0;
  }

  const streak =
    getStoredBuilderStreak(wallet);

  return streak.current;
}

function getAchievementStorageKey(wallet) {
  return `breen_builder_achievements_${wallet.toLowerCase()}`;
}
function getStoredAchievementIds(wallet) {
  if (!wallet) {
    return [];
  }

  const key =
    getAchievementStorageKey(wallet);

  const stored =
    localStorage.getItem(key);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}


export function getCompletedAchievements(wallet = null) {
  if (!wallet) {
    return [];
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const storedIds =
    getStoredAchievementIds(normalizedWallet);

  const completedIds =
    new Set(storedIds);

  // Preserve the original Breen wallet's
  // legacy achievement history.
  if (
    normalizedWallet ===
    LEGACY_BUILDER_WALLET
  ) {
    achievementData
      .filter(
        (achievement) =>
          achievement.completed
      )
      .forEach(
        (achievement) =>
          completedIds.add(achievement.id)
      );
  }

  return achievementData.filter(
    (achievement) =>
      completedIds.has(achievement.id)
  );
}


export function unlockAchievement(
  achievementId,
  wallet = null
) {
  if (!wallet) {
    return {
      unlocked: false,
      reason: "wallet_required",
      achievement: null,
    };
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const achievement =
    achievementData.find(
      (item) => item.id === achievementId
    );

  if (!achievement) {
    return {
      unlocked: false,
      reason: "achievement_not_found",
      achievement: null,
    };
  }

  const storedIds =
    getStoredAchievementIds(normalizedWallet);

  if (storedIds.includes(achievementId)) {
    return {
      unlocked: false,
      reason: "already_unlocked",
      achievement,
    };
  }

  const updatedIds = [
    ...storedIds,
    achievementId,
  ];

  localStorage.setItem(
    getAchievementStorageKey(normalizedWallet),
    JSON.stringify(updatedIds)
  );

  return {
    unlocked: true,
    reason: "unlocked",
    achievement,
  };
}

export function processAchievementAction(
  action,
  wallet = null
) {
  if (!wallet) {
    return [];
  }

  const unlockedAchievements = [];

  function tryUnlock(achievementId) {
    const result =
      unlockAchievement(
        achievementId,
        wallet
      );

    if (result.unlocked) {
      unlockedAchievements.push(
        result.achievement
      );
    }
  }


  // First Smart Contract
  // Any contract deployment qualifies.
  if (
    action === "DEPLOY_CONTRACT" ||
    action === "DEPLOY_CONTRACT_SEPOLIA" ||
    action === "DEPLOY_CONTRACT_MAINNET"
  ) {
    tryUnlock(1);
  }


  // First NFT
  if (
    action === "MINT_NFT" ||
    action === "MINT_BUILDER_NFT"
  ) {
    tryUnlock(2);
  }


  // First Base Mainnet Deployment
  if (
    action === "DEPLOY_CONTRACT_MAINNET"
  ) {
    tryUnlock(3);
  }


  // Base Explorer
  if (
    action === "DEPLOY_CONTRACT_SEPOLIA"
  ) {
    tryUnlock(6);
  }

// First Stake
if (action === "STAKE_BREEN") {
  tryUnlock(8);
}
  return unlockedAchievements;
}


export function getAchievementProgress(wallet = null) {
  const completed =
    getCompletedAchievements(wallet).length;

  const total = achievementData.length;

  const percentage =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return {
    completed,
    total,
    percentage,
  };
}

export function getNextRecommendation(wallet = null) {
  const progress =
    getAchievementProgress(wallet);

  if (progress.percentage < 50) {
    return {
      title: "Complete more achievements",
      reward: 250,
    };
  }

  if (getWalletReputation(wallet) < 90) {
    return {
      title: "Increase your Builder Reputation",
      reward: 350,
    };
  }

  return {
    title: "Deploy your first Base Mainnet contract",
    reward: 500,
  };
}

export function getLatestTimelineEvent(wallet = null) {
  if (!wallet) {
    return null;
  }

  const activities = getActivities(wallet);

  if (activities.length > 0) {
    const latest = activities[0];

    return {
      id: latest.id,
      date: latest.date,
      icon: latest.icon,
      title: latest.title,
      description:
        latest.description ||
        latest.message ||
        "Breen Web3 activity completed.",
      type: latest.type,
      txHash: latest.txHash || null,
    };
  }

  const normalizedWallet = wallet.toLowerCase();

  // Preserve old timeline history only for Wallet A.
  if (
    normalizedWallet ===
    LEGACY_BUILDER_WALLET
  ) {
    return timelineData[0] ?? null;
  }

  return null;
}


const BUILDER_STREAK_ACTIONS = [
  "STAKE_BREEN",
  "UNSTAKE_BREEN",

  // Legacy deployment action
  "DEPLOY_CONTRACT",

  // Network-aware deployment actions
  "DEPLOY_CONTRACT_SEPOLIA",
  "DEPLOY_CONTRACT_MAINNET",

  "MINT_NFT",
"MINT_BUILDER_NFT",

"OPEN_SOURCE_CONTRIBUTION",

// Verified GitHub builder work
"VERIFIED_GITHUB_PR",
];

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getYesterdayDateString() {
  const yesterday = new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  return getLocalDateString(yesterday);
}


function getLast7Days() {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setDate(
      date.getDate() - i
    );

    days.push(
      getLocalDateString(date)
    );
  }

  return days;
}

function buildWeeklyActivity(builderDays = []) {
  const last7Days = getLast7Days();

  return last7Days.map((date) =>
    builderDays.includes(date)
  );
}

const STREAK_MILESTONES = [
  {
    id: "first_flame",
    days: 3,
    title: "🔥 First Flame",
    xp: 100,
  },
  {
    id: "weekly_builder",
    days: 7,
    title: "⚡ Weekly Builder",
    xp: 200,
  },
  {
    id: "consistent_builder",
    days: 14,
    title: "💎 Consistent Builder",
    xp: 350,
  },
  {
    id: "dedicated_builder",
    days: 30,
    title: "🏆 Dedicated Builder",
    xp: 750,
  },
];


function getStreakMilestoneStorageKey(wallet) {
  return `breen_streak_milestones_${wallet.toLowerCase()}`;
}


function getStoredStreakMilestones(wallet) {
  if (!wallet) {
    return [];
  }

  const stored = localStorage.getItem(
    getStreakMilestoneStorageKey(wallet)
  );

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function getCompletedStreakMilestones(
  wallet = null
) {
  if (!wallet) {
    return [];
  }

  const completedIds =
    getStoredStreakMilestones(wallet);

  return STREAK_MILESTONES.filter(
    (milestone) =>
      completedIds.includes(milestone.id)
  );
}


function getStreakMilestoneXPKey(wallet) {
  return `breen_streak_milestone_xp_${wallet.toLowerCase()}`;
}


function awardStreakMilestones(
  wallet,
  streakDays
) {
  if (!wallet) {
    return [];
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const completed =
    getStoredStreakMilestones(
      normalizedWallet
    );

  const completedSet =
    new Set(completed);

  const newlyUnlocked = [];

  STREAK_MILESTONES.forEach(
    (milestone) => {
      if (
        streakDays >= milestone.days &&
        !completedSet.has(milestone.id)
      ) {
        completedSet.add(milestone.id);
        newlyUnlocked.push(milestone);
      }
    }
  );

  if (newlyUnlocked.length === 0) {
    return [];
  }

  localStorage.setItem(
    getStreakMilestoneStorageKey(
      normalizedWallet
    ),
    JSON.stringify([...completedSet])
  );

  // First Flame Achievement
// Unlock achievement #7 when the
// 3-Day First Flame milestone is reached.
if (
  newlyUnlocked.some(
    (milestone) =>
      milestone.id === "first_flame"
  )
) {
  unlockAchievement(
    7,
    normalizedWallet
  );
}

  const xpKey =
    getStreakMilestoneXPKey(
      normalizedWallet
    );

  const currentXP =
    Number(
      localStorage.getItem(xpKey) || 0
    );

  const earnedXP =
    newlyUnlocked.reduce(
      (total, milestone) =>
        total + milestone.xp,
      0
    );

  localStorage.setItem(
    xpKey,
    String(currentXP + earnedXP)
  );

  return newlyUnlocked;
}


function getStreakStorageKey(wallet) {
  return `breen_builder_streak_${wallet.toLowerCase()}`;
}

function getStoredBuilderStreak(wallet) {
  if (!wallet) {
    return {
      current: 0,
      longest: 0,
      lastBuilderDay: null,
      builderDays: [],
      weekly: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    };
  }

  const key =
    getStreakStorageKey(wallet);

  const stored =
    localStorage.getItem(key);

  if (!stored) {
    return {
      current: 0,
      longest: 0,
      lastBuilderDay: null,
      builderDays: [],
      weekly: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    };
  }

  try {
  const parsed = JSON.parse(stored);

  const builderDays =
    Array.isArray(parsed.builderDays)
      ? parsed.builderDays
      : [];

  const weekly =
    Array.isArray(parsed.weekly) &&
    parsed.weekly.length === 7
      ? parsed.weekly
      : buildWeeklyActivity(builderDays);

  return {
    current: Number(parsed.current || 0),
    longest: Number(parsed.longest || 0),
    lastBuilderDay:
      parsed.lastBuilderDay || null,
    builderDays,
    weekly,
  };
} catch {

    return {
      current: 0,
      longest: 0,
      lastBuilderDay: null,
      builderDays: [],
      weekly: [
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ],
    };
  }
}


export function updateBuilderStreak(
  action,
  wallet = null
) {
  if (!wallet) {
    return null;
  }

  if (!BUILDER_STREAK_ACTIONS.includes(action)) {
    return null;
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const key =
    getStreakStorageKey(normalizedWallet);

  const streak =
    getStoredBuilderStreak(normalizedWallet);

  const today =
    getLocalDateString();

  const yesterday =
    getYesterdayDateString();

  // Already counted today.
  if (streak.lastBuilderDay === today) {
    return streak;
  }

  let newCurrent = 1;

  // Continue streak if the last builder day was yesterday.
  if (streak.lastBuilderDay === yesterday) {
    newCurrent =
      Number(streak.current || 0) + 1;
  }

  const newLongest =
    Math.max(
      Number(streak.longest || 0),
      newCurrent
    );

  const existingBuilderDays =
  Array.isArray(streak.builderDays)
    ? streak.builderDays
    : [];

const builderDays = [
  ...new Set([
    ...existingBuilderDays,
    today,
  ]),
];

const recentBuilderDays =
  builderDays;

const updatedStreak = {
  ...streak,

  current: newCurrent,
  longest: newLongest,
  lastBuilderDay: today,

  builderDays: recentBuilderDays,

  weekly:
    buildWeeklyActivity(
      recentBuilderDays
    ),
};

  localStorage.setItem(
  key,
  JSON.stringify(updatedStreak)
);

const unlockedMilestones =
  awardStreakMilestones(
    normalizedWallet,
    newCurrent
  );

return {
  ...updatedStreak,
  unlockedMilestones,
};
}



export function getBuilderStreakStatus(wallet = null) {
  const days = getWalletStreak(wallet);

  if (days >= 100) {
    return "👑 Legendary Builder";
  }

  if (days >= 30) {
    return "🚀 Dedicated Builder";
  }

  if (days >= 7) {
    return "🔥 Consistent Builder";
  }

  if (days >= 1) {
    return "🌱 Getting Started";
  }

  return "✨ New Builder";
}


export function getBuilderStreakMessage(wallet = null) {
  if (!wallet) {
    return "Connect your wallet to start building.";
  }

  const streak =
    getStoredBuilderStreak(wallet);

  const today =
    getLocalDateString();

  const yesterday =
    getYesterdayDateString();

  if (streak.lastBuilderDay === today) {
    return "🔥 Today counted. Build again tomorrow to continue.";
  }

  if (streak.lastBuilderDay === yesterday) {
    return "⚡ Complete a Builder Action today to keep your streak alive.";
  }

  if (streak.current > 0) {
    return "🌱 Your previous streak ended. Build today to start again.";
  }

  return "🌱 Complete your first Builder Action to start a streak.";
}


export function getBuilderStreakMilestone(wallet = null) {
  const days = getWalletStreak(wallet);

  if (days < 3) {
    return {
      days: 3,
      title: "🔥 First Flame",
      reached: false,
      complete: false,
    };
  }

  if (days < 7) {
    return {
      days: 7,
      title: "⚡ Weekly Builder",
      reached: false,
      complete: false,
    };
  }

  if (days < 14) {
    return {
      days: 14,
      title: "💎 Consistent Builder",
      reached: false,
      complete: false,
    };
  }

  if (days < 30) {
    return {
      days: 30,
      title: "🏆 Dedicated Builder",
      reached: false,
      complete: false,
    };
  }

  return {
    days: 30,
    title: "👑 Streak Master",
    reached: true,
    complete: true,
  };
}




export function getCalculatedBuilderXP(
  wallet = null
) {
  if (!wallet) {
    return 0;
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const walletXPKey =
    `breen_builder_xp_${normalizedWallet}`;

  const actionXP =
    Number(
      localStorage.getItem(
        walletXPKey
      ) || 0
    );

  const milestoneXP =
    Number(
      localStorage.getItem(
        getStreakMilestoneXPKey(
          normalizedWallet
        )
      ) || 0
    );

  return (
    actionXP +
    milestoneXP
  );
}


export function getCalculatedBuilderLevel(wallet = null) {
  const xp = getCalculatedBuilderXP(wallet);

  if (xp >= 10000) return 10;
  if (xp >= 7000) return 9;
  if (xp >= 5200) return 8;
  if (xp >= 3800) return 7;
  if (xp >= 2700) return 6;
  if (xp >= 1800) return 5;
  if (xp >= 1100) return 4;
  if (xp >= 600) return 3;
  if (xp >= 250) return 2;

  return 1;
}


/* ========================================
   BREEN BUILDER LEVEL IDENTITIES
   Base-focused progression
======================================== */

export const BUILDER_LEVEL_TITLES = {
  1: "New Builder",
  2: "Base Explorer",
  3: "Onchain Contributor",
  4: "Active Builder",
  5: "Base Builder",
  6: "Established Builder",
  7: "Advanced Base Builder",
  8: "Onchain Architect",
  9: "Elite Base Builder",
  10: "Master Base Builder",
};


export function getCalculatedBuilderTier(
  wallet = null
) {
  const level =
    getCalculatedBuilderLevel(wallet);

  return (
    BUILDER_LEVEL_TITLES[level] ||
    "New Builder"
  );
}

export function getLevelProgress(wallet = null) {
  const xp = getCalculatedBuilderXP(wallet);

  const thresholds = [
    0,      // Level 1
    250,    // Level 2
    600,    // Level 3
    1100,   // Level 4
    1800,   // Level 5
    2700,   // Level 6
    3800,   // Level 7
    5200,   // Level 8
    7000,   // Level 9
    10000,  // Level 10
  ];

  const level =
    getCalculatedBuilderLevel(wallet);

  const currentLevelXP =
    thresholds[level - 1];

  const isMaxLevel =
    level >= 10;

  const nextLevelXP =
    isMaxLevel
      ? null
      : thresholds[level];

  const progress =
    isMaxLevel
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((xp - currentLevelXP) /
                (nextLevelXP - currentLevelXP)) *
                100
            )
          )
        );

  return {
    currentLevelXP,
    nextLevelXP,
    progress,
    isMaxLevel,
  };
}


/* ========================================
   BREEN BUILDER PROGRESSION V2
   Level Requirements
======================================== */

export const BUILDER_LEVEL_REQUIREMENTS = {
  1: {
    xp: 0,
    activeDays: 0,
    achievements: 0,
    streak: 0,
    reputation: 0,
  },

  2: {
    xp: 250,
    activeDays: 3,
    achievements: 1,
    streak: 0,
    reputation: 0,
  },

  3: {
    xp: 600,
    activeDays: 7,
    achievements: 2,
    streak: 3,
    reputation: 0,
  },

  4: {
    xp: 1100,
    activeDays: 14,
    achievements: 3,
    streak: 7,
    reputation: 20,
  },

  5: {
    xp: 1800,
    activeDays: 30,
    achievements: 4,
    streak: 7,
    reputation: 40,
  },

  6: {
    xp: 2700,
    activeDays: 45,
    achievements: 5,
    streak: 14,
    reputation: 55,
  },

  7: {
    xp: 3800,
    activeDays: 60,
    achievements: 6,
    streak: 14,
    reputation: 65,
  },

  8: {
    xp: 5200,
    activeDays: 75,
    achievements: 7,
    streak: 30,
    reputation: 75,
  },

  9: {
    xp: 7000,
    activeDays: 90,
    achievements: 8,
    streak: 30,
    reputation: 85,
  },

  10: {
    xp: 10000,
    activeDays: 120,
    achievements: 8,
    streak: 60,
    reputation: 90,
  },
};


/* ========================================
   ACTIVE BUILDER DAYS
======================================== */

export function getBuilderActiveDays(
  wallet = null
) {
  if (!wallet) {
    return 0;
  }

  const streak =
    getStoredBuilderStreak(wallet);

  return Array.isArray(streak.builderDays)
    ? streak.builderDays.length
    : 0;
}


/* ========================================
   LEVEL REQUIREMENT STATUS
======================================== */

export function getLevelRequirementStatus(
  targetLevel,
  wallet = null
) {
  const requirements =
    BUILDER_LEVEL_REQUIREMENTS[
      targetLevel
    ];

  if (!requirements) {
    return null;
  }

  const xp =
    getCalculatedBuilderXP(wallet);

  const activeDays =
    getBuilderActiveDays(wallet);

  const achievements =
    getCompletedAchievements(
      wallet
    ).length;

  const streakData =
  getStoredBuilderStreak(wallet);

const longestStreak =
  Number(streakData?.longest || 0);

  const reputation =
    getWalletReputation(wallet);

  const checks = {
    xp:
      xp >= requirements.xp,

    activeDays:
      activeDays >=
      requirements.activeDays,

    achievements:
      achievements >=
      requirements.achievements,

    streak:
  longestStreak >=
  requirements.streak,

    reputation:
      reputation >=
      requirements.reputation,
  };

  const completedRequirements =
    Object.values(checks).filter(
      Boolean
    ).length;

  const totalRequirements =
    Object.keys(checks).length;

  const eligible =
    Object.values(checks).every(
      Boolean
    );

  return {
    targetLevel,

    eligible,

    requirements,

    current: {
  xp,
  activeDays,
  achievements,

  currentStreak:
    getWalletStreak(wallet),

  longestStreak,

  reputation,
},

    checks,

    completedRequirements,
    totalRequirements,
  };
}


export function getEligibleBuilderLevel(
  wallet = null
) {
  if (!wallet) {
    return 1;
  }

  for (
    let level = 10;
    level >= 1;
    level--
  ) {
    const status =
      getLevelRequirementStatus(
        level,
        wallet
      );

    if (
      status &&
      status.eligible
    ) {
      return level;
    }
  }

  return 1;
}


/* ========================================
   VERIFIED BUILDER LEVEL
   XP + Builder Requirements
======================================== */

export function getVerifiedBuilderLevel(
  wallet = null
) {
  if (!wallet) {
    return 1;
  }

  const xpLevel =
    getCalculatedBuilderLevel(wallet);

  const eligibleLevel =
    getEligibleBuilderLevel(wallet);

  return Math.min(
    xpLevel,
    eligibleLevel
  );
}


export function getVerifiedBuilderTier(
  wallet = null
) {
  const level =
    getVerifiedBuilderLevel(wallet);

  return (
    BUILDER_LEVEL_TITLES[level] ||
    "New Builder"
  );
}


export function getNextLevelRequirementStatus(
  wallet = null
) {
  const eligibleLevel =
    getEligibleBuilderLevel(wallet);

  const nextLevel =
    Math.min(
      eligibleLevel + 1,
      10
    );

  return {
    eligibleLevel,
    nextLevel,
    status:
      getLevelRequirementStatus(
        nextLevel,
        wallet
      ),
  };
}


export function getBuilderActivities(wallet = null) {
  if (!wallet) {
    return [];
  }

  return getActivities(wallet);
}

export function getActivitySummary(wallet = null) {
  const activities = getBuilderActivities(wallet);

  const totalXP = activities.reduce(
    (sum, activity) =>
      sum + Number(activity.xp || 0),
    0
  );

  return {
    totalActivities: activities.length,
    totalXP,
  };
}


export function getReputationRank(
  wallet = null
) {
  if (!wallet) {
    return {
      currentRank: "Not Connected",
      nextRank: "Connect Wallet",
      reputationNeeded: 0,
    };
  }

  const reputation =
    getWalletReputation(wallet);

  const ranks = [
    {
      min: 0,
      name: "New Builder",
    },
    {
      min: 20,
      name: "Base Explorer",
    },
    {
      min: 40,
      name: "Onchain Builder",
    },
    {
      min: 60,
      name: "Mainnet Builder",
    },
    {
      min: 80,
      name: "Established Builder",
    },
    {
      min: 100,
      name: "Elite Builder",
    },
  ];

  let currentRank =
    ranks[0].name;

  let nextRank =
    ranks[ranks.length - 1].name;

  let reputationNeeded = 0;

  for (
    let i = 0;
    i < ranks.length;
    i++
  ) {
    if (
      reputation >= ranks[i].min
    ) {
      currentRank =
        ranks[i].name;
    }

    if (
      reputation < ranks[i].min
    ) {
      nextRank =
        ranks[i].name;

      reputationNeeded =
        ranks[i].min -
        reputation;

      break;
    }
  }

  return {
    currentRank,
    nextRank,
    reputationNeeded,
  };
}


/* ========================================
   REPUTATION ACTION POLICY V1
======================================== */

const REPUTATION_ACTION_POLICY = {
  COMMUNITY_CONTRIBUTION: {
    category: "community",
    mode: "verified_only",
    points: 10,
  },

  OPEN_SOURCE_CONTRIBUTION: {
    category: "open_source",
    mode: "verified_only",
    points: 15,
  },
};


function getReputationActionPolicy(action) {
  return (
    REPUTATION_ACTION_POLICY[action] ||
    null
  );
}

function getReputationProofKey(
  wallet,
  action,
  proofId
) {
  return `breen_reputation_proof_${wallet.toLowerCase()}_${action}_${proofId}`;
}


function hasUsedReputationProof(
  wallet,
  action,
  proofId
) {
  if (!wallet || !proofId) {
    return false;
  }

  const key = getReputationProofKey(
    wallet,
    action,
    proofId
  );

  return (
    localStorage.getItem(key) === "true"
  );
}


function markReputationProofUsed(
  wallet,
  action,
  proofId
) {
  if (!wallet || !proofId) {
    return;
  }

  const key = getReputationProofKey(
    wallet,
    action,
    proofId
  );

  localStorage.setItem(key, "true");
}


export function recordCommunityContribution(
  wallet = null,
  title = "Community Contribution",
  description =
    "Contributed to the Breen Web3 or Base community.",
  verified = false,
  proofId = null
) {
  if (!wallet) {
    return {
      recorded: false,
      reason: "wallet_required",
    };
  }

  const action =
    "COMMUNITY_CONTRIBUTION";

  const policy =
    getReputationActionPolicy(action);

  if (
    policy?.mode === "verified_only" &&
    !verified
  ) {
    return {
      recorded: false,
      reason: "verification_required",
    };
  }

  if (!proofId) {
    return {
      recorded: false,
      reason: "proof_required",
    };
  }

  if (
    hasUsedReputationProof(
      wallet,
      action,
      proofId
    )
  ) {
    return {
      recorded: false,
      reason: "proof_already_used",
    };
  }

  addActivity(
    "community",
    title,
    description,
    0,
    null,
    wallet
  );

  markReputationProofUsed(
    wallet,
    action,
    proofId
  );

 updateBuilderStreak(
  action,
  wallet
);

  return {
    recorded: true,
    reason: "recorded",
    category: policy?.category,
    points: policy?.points || 0,
    proofId,
  };
}


/* ========================================
   COMMUNITY PROOF V1
   X / Twitter Post
======================================== */

export function parseCommunityXPostUrl(
  url = ""
) {
  try {
    const parsedUrl =
      new URL(url);

    const hostname =
      parsedUrl.hostname
        .toLowerCase()
        .replace(/^www\./, "");

    const allowedHosts = [
      "x.com",
      "twitter.com",
    ];

    if (
      !allowedHosts.includes(
        hostname
      )
    ) {
      return {
        valid: false,
        reason: "unsupported_host",
      };
    }

    const parts =
      parsedUrl.pathname
        .split("/")
        .filter(Boolean);

    if (
      parts.length < 3 ||
      parts[1] !== "status"
    ) {
      return {
        valid: false,
        reason: "invalid_post_url",
      };
    }

    const username =
      String(parts[0] || "")
        .trim()
        .toLowerCase();

    const postId =
      String(parts[2] || "")
        .trim();

    if (
      !username ||
      !postId
    ) {
      return {
        valid: false,
        reason: "missing_post_fields",
      };
    }

    return {
      valid: true,
      reason: "valid",
      contribution: {
        platform: "x",
        username,
        postId,
      },
    };
  } catch {
    return {
      valid: false,
      reason: "invalid_url",
    };
  }
}



export function buildCommunityXProofId({
  username,
  postId,
} = {}) {
  const normalizedUsername =
    String(username || "")
      .trim()
      .toLowerCase();

  const normalizedPostId =
    String(postId || "")
      .trim();

  if (
    !normalizedUsername ||
    !normalizedPostId
  ) {
    return null;
  }

  return [
    "community",
    "x",
    normalizedUsername,
    "status",
    normalizedPostId,
  ].join(":");
}



export function getCommunityXProofStatus(
  wallet = null,
  url = ""
) {
  if (!wallet) {
    return {
      status: "wallet_required",
      proofId: null,
    };
  }

  const parsed =
    parseCommunityXPostUrl(url);

  if (!parsed.valid) {
    return {
      status: "invalid",
      reason: parsed.reason,
      proofId: null,
    };
  }

  const proofId =
    buildCommunityXProofId(
      parsed.contribution
    );

  if (!proofId) {
    return {
      status: "invalid",
      reason: "invalid_community_proof",
      proofId: null,
    };
  }

  const alreadyUsed =
    hasUsedReputationProof(
      wallet,
      "COMMUNITY_CONTRIBUTION",
      proofId
    );

  if (alreadyUsed) {
    return {
      status: "already_used",
      proofId,
      contribution:
        parsed.contribution,
    };
  }

  return {
    status: "unverified",
    proofId,
    contribution:
      parsed.contribution,
  };
}



export function claimCommunityXProof(
  wallet = null,
  url = ""
) {
  if (!wallet) {
    return {
      claimed: false,
      reason: "wallet_required",
    };
  }

  const parsed =
    parseCommunityXPostUrl(url);

  if (!parsed.valid) {
    return {
      claimed: false,
      reason: parsed.reason,
    };
  }

  const proofId =
    buildCommunityXProofId(
      parsed.contribution
    );

  if (!proofId) {
    return {
      claimed: false,
      reason: "invalid_community_proof",
    };
  }

  const result =
    recordCommunityContribution(
      wallet,
      "X Community Contribution",
      `Community contribution by @${parsed.contribution.username}.`,
      true,
      proofId
    );

  if (!result.recorded) {
    return {
      claimed: false,
      reason: result.reason,
      proofId,
    };
  }

  return {
    claimed: true,
    reason: "claimed",
    proofId,
    contribution:
      parsed.contribution,
    points:
      result.points || 0,
  };
}


/* ========================================
   BUILDER IDENTITY V1
   Wallet × GitHub
======================================== */

function getBuilderIdentityKey(
  wallet
) {
  if (!wallet) {
    return null;
  }

  return `breen_builder_identity_${wallet.toLowerCase()}`;
}


export function getBuilderIdentity(
  wallet = null
) {
  if (!wallet) {
    return {
  wallet: null,

  githubUsername: null,
  githubVerified: false,

  xUsername: null,
  xVerified: false,
};
  }

  const key =
    getBuilderIdentityKey(wallet);

  const stored =
    localStorage.getItem(key);

  if (!stored) {
    return {
      wallet:
        wallet.toLowerCase(),

      githubUsername: null,

      githubVerified: false,

      xUsername: null,

      xVerified: false,
    };
  }

  try {
    const parsed =
  JSON.parse(stored);

const normalizedWallet =
  wallet.toLowerCase();

const githubUsername =
  parsed.githubUsername
    ? String(parsed.githubUsername)
        .trim()
        .replace(/^@/, "")
        .toLowerCase()
    : null;

let githubVerified =
  Boolean(parsed.githubVerified);

// Check whether this GitHub identity
// belongs to another BREEN wallet.
if (githubUsername) {
  const ownerKey =
    `breen_github_identity_owner_${githubUsername}`;

  const githubOwner =
    localStorage.getItem(ownerKey);

  if (
    githubOwner &&
    githubOwner !== normalizedWallet
  ) {
    githubVerified = false;
  }
}

return {
  wallet:
    normalizedWallet,

  githubUsername,

  githubVerified,

  xUsername:
    parsed.xUsername ||
    null,

  xVerified:
    Boolean(
      parsed.xVerified
    ),
};


  } catch {
    return {
      wallet:
        wallet.toLowerCase(),

      githubUsername: null,

      githubVerified: false,

      xUsername: null,

      xVerified: false,
    };
  }
}



export function saveBuilderGitHubIdentity(
  wallet = null,
  githubUsername = ""
) {
  if (!wallet) {
    return {
      saved: false,
      reason: "wallet_required",
    };
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const normalizedUsername =
    String(githubUsername)
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

  if (!normalizedUsername) {
    return {
      saved: false,
      reason: "github_username_required",
    };
  }

  // One GitHub identity can only belong
  // to one BREEN Builder wallet.
  const ownerKey =
    `breen_github_identity_owner_${normalizedUsername}`;

  const existingOwner =
    localStorage.getItem(ownerKey);

  if (
    existingOwner &&
    existingOwner !== normalizedWallet
  ) {
    return {
      saved: false,
      reason: "github_identity_already_linked",
    };
  }

  const key =
    getBuilderIdentityKey(normalizedWallet);

  // Preserve X identity and any
  // other existing identity fields.
  const current =
    getBuilderIdentity(normalizedWallet);

  const identity = {
    ...current,

    wallet: normalizedWallet,

    githubUsername:
      normalizedUsername,

    githubVerified: false,
  };

  localStorage.setItem(
    key,
    JSON.stringify(identity)
  );

  // Reserve this GitHub username
  // for this wallet.
  localStorage.setItem(
    ownerKey,
    normalizedWallet
  );

  return {
    saved: true,
    reason: "saved",
    identity,
  };
}



export function saveBuilderXIdentity(
  wallet = null,
  xUsername = ""
) {
  if (!wallet) {
    return {
      saved: false,
      reason: "wallet_required",
    };
  }

  const normalizedUsername =
    String(xUsername)
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

  if (!normalizedUsername) {
    return {
      saved: false,
      reason: "x_username_required",
    };
  }

  const key =
    getBuilderIdentityKey(wallet);

  const current =
    getBuilderIdentity(wallet);

  const identity = {
    ...current,

    wallet:
      wallet.toLowerCase(),

    xUsername:
      normalizedUsername,

    xVerified: false,
  };

  localStorage.setItem(
    key,
    JSON.stringify(identity)
  );

  return {
    saved: true,
    reason: "saved",
    identity,
  };
}


export function setBuilderXVerified(
  wallet = null,
  verified = false
) {
  if (!wallet) {
    return {
      updated: false,
      reason: "wallet_required",
    };
  }

  const current =
    getBuilderIdentity(wallet);

  if (!current.xUsername) {
    return {
      updated: false,
      reason: "x_identity_required",
    };
  }

  const key =
    getBuilderIdentityKey(wallet);

  const updatedIdentity = {
    ...current,

    xVerified:
      Boolean(verified),
  };

  localStorage.setItem(
    key,
    JSON.stringify(updatedIdentity)
  );

  return {
    updated: true,

    reason: verified
      ? "verified"
      : "unverified",

    identity:
      updatedIdentity,
  };
}


export function getXVerificationMessage(
  wallet = null
) {
  if (!wallet) {
    return null;
  }

  const normalizedWallet =
    wallet.toLowerCase();

  return `BREEN X verification: ${normalizedWallet}`;
}


export function doesXAuthorMatchIdentity(
  wallet = null,
  author = ""
) {
  if (!wallet) {
    return {
      matches: false,
      reason: "wallet_required",
    };
  }

  const identity =
    getBuilderIdentity(wallet);

  if (!identity.xUsername) {
    return {
      matches: false,
      reason: "x_identity_required",
    };
  }

  if (!identity.xVerified) {
    return {
      matches: false,
      reason: "x_identity_not_verified",
    };
  }

  const normalizedAuthor =
    String(author)
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

  const normalizedIdentity =
    String(identity.xUsername)
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

  if (!normalizedAuthor) {
    return {
      matches: false,
      reason: "x_author_required",
    };
  }

  if (
    normalizedAuthor !==
    normalizedIdentity
  ) {
    return {
      matches: false,
      reason: "x_author_mismatch",
    };
  }

  return {
    matches: true,
    reason: "x_author_matched",
    xUsername:
      normalizedIdentity,
  };
}


export async function verifyXIdentity(
  wallet = null,
  postUrl = ""
) {
  if (!wallet) {
    return {
      verified: false,
      reason: "wallet_required",
    };
  }

  const identity =
    getBuilderIdentity(wallet);

  if (!identity?.xUsername) {
    return {
      verified: false,
      reason: "x_identity_required",
    };
  }

  const parsed =
    parseCommunityXPostUrl(
      postUrl
    );

  if (!parsed.valid) {
    return {
      verified: false,
      reason: parsed.reason,
    };
  }

  const expectedMessage =
    getXVerificationMessage(
      wallet
    );

  try {
    const response =
      await fetch(
        "/api/verify-x",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            postId:
              parsed.contribution.postId,

            expectedUsername:
              identity.xUsername,

            expectedMessage,
          }),
        }
      );

    const result =
      await response.json();

    if (!result.verified) {
      return {
        verified: false,
        reason:
          result.reason ||
          "x_verification_failed",
      };
    }

    const updateResult =
      setBuilderXVerified(
        wallet,
        true
      );

    return {
      verified: true,
      reason:
        "x_identity_verified",

      username:
        identity.xUsername,

      postId:
        parsed.contribution.postId,

      identity:
        updateResult.identity,
    };
  } catch (error) {
    console.error(
      "X identity verification failed:",
      error
    );

    return {
      verified: false,
      reason:
        "x_verification_request_failed",
    };
  }
}



export function getXVerificationPostStatus(
  wallet = null,
  url = ""
) {
  if (!wallet) {
    return {
      valid: false,
      reason: "wallet_required",
    };
  }

  const parsed =
    parseCommunityXPostUrl(url);

  if (!parsed.valid) {
    return {
      valid: false,
      reason: parsed.reason,
    };
  }

  const identity =
    getBuilderIdentity(wallet);

  if (!identity.xUsername) {
    return {
      valid: false,
      reason: "x_identity_required",
    };
  }

  const normalizedAuthor =
    String(
      parsed.contribution.username
    )
      .trim()
      .toLowerCase();

  const normalizedIdentity =
    String(identity.xUsername)
      .trim()
      .toLowerCase();

  if (
    normalizedAuthor !==
    normalizedIdentity
  ) {
    return {
      valid: false,
      reason: "x_author_mismatch",
      author:
        normalizedAuthor,
    };
  }

  return {
    valid: true,
    reason: "x_author_matched",
    author:
      normalizedAuthor,
    postId:
      parsed.contribution.postId,
  };
}


export function setBuilderGitHubVerified(
  wallet = null,
  verified = false
) {
  if (!wallet) {
    return {
      updated: false,
      reason: "wallet_required",
    };
  }

  const current =
    getBuilderIdentity(wallet);

  if (!current.githubUsername) {
    return {
      updated: false,
      reason: "github_identity_required",
    };
  }

  const key =
    getBuilderIdentityKey(wallet);

  const updatedIdentity = {
    ...current,
    githubVerified:
      Boolean(verified),
  };

  localStorage.setItem(
    key,
    JSON.stringify(updatedIdentity)
  );

  return {
    updated: true,
    reason: verified
      ? "verified"
      : "unverified",
    identity: updatedIdentity,
  };
}



export function getGitHubVerificationMessage(
  wallet = null
) {
  if (!wallet) {
    return null;
  }

  const normalizedWallet =
    wallet.toLowerCase();

  return `BREEN GitHub verification: ${normalizedWallet}`;
}


export async function verifyGitHubProfileOwnership(
  wallet = null,
  githubUsername = ""
) {
  if (!wallet) {
    return {
      verified: false,
      reason: "wallet_required",
    };
  }

  const normalizedUsername =
    String(githubUsername)
      .trim()
      .toLowerCase();

  if (!normalizedUsername) {
    return {
      verified: false,
      reason: "github_username_required",
    };
  }

  const verificationMessage =
    getGitHubVerificationMessage(wallet);

  try {
    const response = await fetch(
      `https://api.github.com/users/${normalizedUsername}`,
      {
        headers: {
          Accept:
            "application/vnd.github+json",
        },
      }
    );

    if (response.status === 404) {
      return {
        verified: false,
        reason: "github_user_not_found",
      };
    }

    if (!response.ok) {
      return {
        verified: false,
        reason: "github_api_error",
      };
    }

    const profile =
      await response.json();

    const bio =
      String(profile.bio || "");

    const matched =
      bio.includes(
        verificationMessage
      );

    return {
      verified: matched,

      reason: matched
        ? "ownership_verified"
        : "verification_message_not_found",

      githubUsername:
        profile.login || normalizedUsername,

      verificationMessage,

      profileUrl:
        profile.html_url || "",
    };
  } catch (error) {
    console.error(
      "GitHub ownership verification failed:",
      error
    );

    return {
      verified: false,
      reason: "github_request_failed",
    };
  }
}


export async function verifyAndSaveGitHubIdentity(
  wallet = null
) {
  if (!wallet) {
    return {
      verified: false,
      reason: "wallet_required",
    };
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const identity =
    getBuilderIdentity(normalizedWallet);

  if (!identity.githubUsername) {
    return {
      verified: false,
      reason: "github_identity_required",
    };
  }

  const normalizedUsername =
    String(identity.githubUsername)
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

  // Anti-Sybil:
  // one GitHub identity = one BREEN wallet.
  const ownerKey =
    `breen_github_identity_owner_${normalizedUsername}`;

  const existingOwner =
    localStorage.getItem(ownerKey);

  if (
    existingOwner &&
    existingOwner !== normalizedWallet
  ) {
    setBuilderGitHubVerified(
      normalizedWallet,
      false
    );

    return {
      verified: false,
      reason: "github_identity_already_linked",
    };
  }

  const verification =
    await verifyGitHubProfileOwnership(
      normalizedWallet,
      normalizedUsername
    );

  if (!verification.verified) {
  return verification;
}

  // Reserve GitHub identity for this wallet.
  localStorage.setItem(
    ownerKey,
    normalizedWallet
  );

  const updateResult =
    setBuilderGitHubVerified(
      normalizedWallet,
      true
    );

  return {
    ...verification,

    identity:
      updateResult.identity,
  };
}


const GITHUB_OPEN_SOURCE_TYPES = [
  "pr",
  "commit",
];


export function parseGitHubPullRequestUrl(
  url = ""
) {
  try {
    const parsedUrl =
      new URL(url);

    if (
      parsedUrl.hostname !==
      "github.com"
    ) {
      return {
        valid: false,
        reason: "unsupported_host",
      };
    }

    const parts =
      parsedUrl.pathname
        .split("/")
        .filter(Boolean);

    if (
      parts.length < 4 ||
      parts[2] !== "pull"
    ) {
      return {
        valid: false,
        reason: "invalid_pull_request_url",
      };
    }

    const [
      owner,
      repo,
      ,
      number,
    ] = parts;

    if (
      !owner ||
      !repo ||
      !number
    ) {
      return {
        valid: false,
        reason: "missing_pull_request_fields",
      };
    }

    return {
      valid: true,
      reason: "valid",
      contribution: {
        owner,
        repo,
        type: "pr",
        number,
      },
    };

  } catch {
    return {
      valid: false,
      reason: "invalid_url",
    };
  }
}



export async function verifyGitHubPullRequest(
  url = "",
  wallet = null
) {
  const parsed =
    parseGitHubPullRequestUrl(url);

  if (!parsed.valid) {
    return {
      verified: false,
      reason: parsed.reason,
      contribution: null,
    };
  }

  const {
    owner,
    repo,
    number,
  } = parsed.contribution;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`,
      {
        headers: {
          Accept:
            "application/vnd.github+json",
        },
      }
    );

    if (response.status === 404) {
      return {
        verified: false,
        reason: "pull_request_not_found",
        contribution:
          parsed.contribution,
      };
    }

    if (!response.ok) {
      return {
        verified: false,
        reason: "github_api_error",
        contribution:
          parsed.contribution,
      };
    }

    const pullRequest =
      await response.json();

    const merged =
  Boolean(
    pullRequest.merged_at
  );

const author =
  pullRequest.user?.login || "";

const authorCheck =
  doesGitHubAuthorMatchIdentity(
    wallet,
    author
  );

const eligible =
  merged &&
  authorCheck.matches;

let eligibilityReason =
  "eligible";

if (!merged) {
  eligibilityReason =
    "pull_request_not_merged";
} else if (!authorCheck.matches) {
  eligibilityReason =
    authorCheck.reason;
}

return {
  verified: true,

  eligible,

  reason: eligibilityReason,

  authorMatched:
    authorCheck.matches,

  contribution: {
    ...parsed.contribution,

    title:
      pullRequest.title || "",

    author,

    state:
      pullRequest.state || "",

    merged,

    htmlUrl:
      pullRequest.html_url || "",
  },
};

  } catch (error) {
    console.error(
      "GitHub PR verification failed:",
      error
    );

    return {
      verified: false,
      reason: "github_request_failed",
      contribution:
        parsed.contribution,
    };
  }
}


export function getGitHubPullRequestProofStatus(
  wallet = null,
  url = ""
) {
  const parsed =
    parseGitHubPullRequestUrl(url);

  if (!parsed.valid) {
    return {
      status: "invalid",
      reason: parsed.reason,
      proofId: null,
    };
  }

  return getGitHubProofStatus(
    wallet,
    parsed.contribution
  );
}


export function verifyGitHubContributionShape({
  owner,
  repo,
  type,
  number,
} = {}) {

  if (
    !owner ||
    !repo ||
    !type ||
    number === undefined ||
    number === null
  ) {
    return {
      valid: false,
      reason: "missing_fields",
    };
  }

  const normalizedOwner =
    String(owner).trim();

  const normalizedRepo =
    String(repo).trim();

  const normalizedType =
    String(type).trim().toLowerCase();

  const normalizedNumber =
    String(number).trim();

  if (
    normalizedOwner.length === 0 ||
    normalizedRepo.length === 0 ||
    normalizedNumber.length === 0
  ) {
    return {
      valid: false,
      reason: "invalid_fields",
    };
  }

  if (
  !GITHUB_OPEN_SOURCE_TYPES.includes(
    normalizedType
  )
) {
    return {
      valid: false,
      reason: "unsupported_type",
    };
  }

  return {
    valid: true,
    reason: "valid",
  };
}




/* ========================================
   GITHUB OPEN SOURCE PROOF
======================================== */

export function buildGitHubProofId({
  owner,
  repo,
  type,
  number,
}) {
  if (
    !owner ||
    !repo ||
    !type ||
    number === undefined ||
    number === null
  ) {
    return null;
  }

  const normalizedOwner =
    String(owner).trim().toLowerCase();

  const normalizedRepo =
    String(repo).trim().toLowerCase();

  const normalizedType =
    String(type).trim().toLowerCase();

  const normalizedNumber =
    String(number).trim();

  if (
  !GITHUB_OPEN_SOURCE_TYPES.includes(
    normalizedType
  )
) {
    return null;
  }

  return [
    "github",
    `${normalizedOwner}/${normalizedRepo}`,
    normalizedType,
    normalizedNumber,
  ].join(":");
}


export function getGitHubProofStatus(
  wallet = null,
  contribution = {}
) {
  if (!wallet) {
    return {
      status: "wallet_required",
      proofId: null,
    };
  }

  const shapeCheck =
    verifyGitHubContributionShape(
      contribution
    );

  if (!shapeCheck.valid) {
    return {
      status: "invalid",
      reason: shapeCheck.reason,
      proofId: null,
    };
  }

  const proofId =
    buildGitHubProofId(
      contribution
    );

  if (!proofId) {
    return {
      status: "invalid",
      reason: "invalid_github_proof",
      proofId: null,
    };
  }

  const alreadyUsed =
    hasUsedReputationProof(
      wallet,
      "OPEN_SOURCE_CONTRIBUTION",
      proofId
    );

  if (alreadyUsed) {
    return {
      status: "already_used",
      proofId,
    };
  }

  return {
    status: "unverified",
    proofId,
  };
}


export function doesGitHubAuthorMatchIdentity(
  wallet = null,
  author = ""
) {
  if (!wallet) {
    return {
      matches: false,
      reason: "wallet_required",
    };
  }

  const identity =
    getBuilderIdentity(wallet);

  if (!identity.githubUsername) {
    return {
      matches: false,
      reason: "github_identity_required",
    };
  }

  if (!identity.githubVerified) {
    return {
      matches: false,
      reason: "github_identity_not_verified",
    };
  }

  const normalizedAuthor =
    String(author)
      .trim()
      .toLowerCase();

  const normalizedIdentity =
    String(identity.githubUsername)
      .trim()
      .toLowerCase();

  if (!normalizedAuthor) {
    return {
      matches: false,
      reason: "github_author_required",
    };
  }

  if (
    normalizedAuthor !==
    normalizedIdentity
  ) {
    return {
      matches: false,
      reason: "github_author_mismatch",
    };
  }

  return {
    matches: true,
    reason: "github_author_matched",
    githubUsername:
      normalizedIdentity,
  };
}



export function recordGitHubContribution(
  wallet = null,
  {
    owner,
    repo,
    type,
    number,
    title = "GitHub Contribution",
    description =
      "Open-source contribution on GitHub.",
    verified = false,
  } = {}
) {
  if (!wallet) {
    return {
      recorded: false,
      reason: "wallet_required",
    };
  }

const shapeCheck =
  verifyGitHubContributionShape({
    owner,
    repo,
    type,
    number,
  });

if (!shapeCheck.valid) {
  return {
    recorded: false,
    reason:
      shapeCheck.reason ||
      "invalid_github_proof",
  };
}

  const proofId =
    buildGitHubProofId({
      owner,
      repo,
      type,
      number,
    });

  if (!proofId) {
    return {
      recorded: false,
      reason: "invalid_github_proof",
    };
  }

  return recordOpenSourceContribution(
    wallet,
    title,
    description,
    verified,
    proofId
  );
}


export async function claimGitHubOpenSourceProof(
  wallet = null,
  url = ""
) {
  if (!wallet) {
    return {
      claimed: false,
      reason: "wallet_required",
    };
  }

  const identity =
    getBuilderIdentity(wallet);

  if (
    !identity.githubUsername ||
    !identity.githubVerified
  ) {
    return {
      claimed: false,
      reason: "github_identity_not_verified",
    };
  }

  // Re-check GitHub ownership live.
  const ownership =
    await verifyGitHubProfileOwnership(
      wallet,
      identity.githubUsername
    );

  if (!ownership.verified) {
    setBuilderGitHubVerified(
      wallet,
      false
    );

    return {
      claimed: false,
      reason:
        ownership.reason ||
        "github_ownership_failed",
    };
  }

  // Re-check the actual PR live.
  const verification =
    await verifyGitHubPullRequest(
      url,
      wallet
    );

  if (!verification.verified) {
    return {
      claimed: false,
      reason:
        verification.reason ||
        "pull_request_not_verified",
    };
  }

  if (!verification.eligible) {
    return {
      claimed: false,
      reason:
        verification.reason ||
        "proof_not_eligible",
    };
  }

  const contribution =
    verification.contribution;

  const proofId =
    buildGitHubProofId(
      contribution
    );

  if (!proofId) {
    return {
      claimed: false,
      reason: "invalid_github_proof",
    };
  }

  const result =
  recordOpenSourceContribution(
    wallet,
    contribution.title ||
      "GitHub Pull Request",
    `Merged GitHub PR by @${contribution.author}.`,
    true,
    proofId,
    {
      owner: contribution.owner,
      repo: contribution.repo,
      type: contribution.type,
      number: contribution.number,

      title: contribution.title,
      author: contribution.author,
      state: contribution.state,
      merged: contribution.merged,
      htmlUrl: contribution.htmlUrl,
    }
  );

  if (!result.recorded) {
    return {
      claimed: false,
      reason: result.reason,
      proofId,
    };
  }

  const xpResult =
  awardXP(
    "VERIFIED_GITHUB_PR",
    wallet,
    proofId
  );

 return {
  claimed: true,
  reason: "claimed",

  proofId,
  contribution,

  reputationPoints:
    result.reputationPoints || 0,

  earnedXP:
    xpResult.earnedXP || 0,

  totalXP:
    xpResult.totalXP || 0,

  reward: {
    type: "verified_open_source",

    reputation:
      result.reputationPoints || 0,

    xp:
      xpResult.earnedXP || 0,
  },
};
}



/* ========================================
   OPEN SOURCE REPUTATION
======================================== */

export function recordOpenSourceContribution(
  wallet = null,
  title = "Open Source Contribution",
  description =
    "Contributed to an open-source Base project.",
  verified = false,
  proofId = null,
  metadata = {}
) {
  if (!wallet) {
    return {
      recorded: false,
      reason: "wallet_required",
    };
  }

  const action =
    "OPEN_SOURCE_CONTRIBUTION";

  const policy =
    getReputationActionPolicy(action);

  if (
    policy?.mode === "verified_only" &&
    !verified
  ) {
    return {
      recorded: false,
      reason: "verification_required",
    };
  }

  if (!proofId) {
    return {
      recorded: false,
      reason: "proof_required",
    };
  }

  if (
    hasUsedReputationProof(
      wallet,
      action,
      proofId
    )
  ) {
    return {
      recorded: false,
      reason: "proof_already_used",
    };
  }

  addActivity(
    "open_source",
    title,
    description,
    0,
    null,
    wallet,
    {
      ...metadata,

      verified: true,
      provider: "github",
      proofId,
    }
  );

  markReputationProofUsed(
    wallet,
    action,
    proofId
  );

 return {
  recorded: true,
  reason: "recorded",

  action,
  category: policy?.category,

  reputationPoints:
    policy?.points || 0,

  proofId,

  reward: {
    type: "verified_open_source",
    reputation:
      policy?.points || 0,
    xp: 0,
  },
};
}


export function getOpenSourceProofHistory(
  wallet = null
) {
  if (!wallet) {
    return [];
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const activities =
    getActivities(normalizedWallet);

  return activities
    .filter(
      (activity) =>
        activity.type === "open_source" &&
        activity.metadata?.verified === true &&
        activity.metadata?.provider === "github" &&
        Boolean(activity.metadata?.proofId)
    )
    .map((activity) => ({
      ...activity,

      proofId:
        activity.metadata?.proofId || null,

      provider:
        activity.metadata?.provider || "github",

      owner:
        activity.metadata?.owner || null,

      repo:
        activity.metadata?.repo || null,

      contributionType:
        activity.metadata?.type || null,

      number:
        activity.metadata?.number ?? null,

      githubTitle:
        activity.metadata?.title ||
        activity.title ||
        "",

      githubAuthor:
        activity.metadata?.author || null,

      githubState:
        activity.metadata?.state || null,

      merged:
        activity.metadata?.merged === true,

      githubUrl:
        activity.metadata?.htmlUrl || null,

      verified:
        activity.metadata?.verified === true,
    }));
}


export function migrateLegacyGitHubProofActivity(
  wallet = null,
  {
    proofId,
    title,
  } = {}
) {
  if (!wallet) {
    return {
      migrated: false,
      reason: "wallet_required",
    };
  }

  if (!proofId || !title) {
    return {
      migrated: false,
      reason: "proof_data_required",
    };
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const activities =
    getActivities(normalizedWallet);

  const alreadyMigrated =
    activities.some(
      (activity) =>
        activity.metadata?.proofId ===
        proofId
    );

  if (alreadyMigrated) {
    return {
      migrated: false,
      reason: "already_migrated",
    };
  }

  const targetIndex =
    activities.findIndex(
      (activity) =>
        activity.type === "open_source" &&
        activity.title === title
    );

  if (targetIndex === -1) {
    return {
      migrated: false,
      reason: "legacy_activity_not_found",
    };
  }

  const proofAlreadyClaimed =
    hasUsedReputationProof(
      normalizedWallet,
      "OPEN_SOURCE_CONTRIBUTION",
      proofId
    );

  if (!proofAlreadyClaimed) {
    return {
      migrated: false,
      reason: "proof_not_previously_claimed",
    };
  }

  const updatedActivities =
    [...activities];

  updatedActivities[targetIndex] = {
    ...updatedActivities[targetIndex],

    metadata: {
      verified: true,
      provider: "github",
      proofId,
    },
  };

  const activityKey =
    `breenActivities_${normalizedWallet}`;

  localStorage.setItem(
    activityKey,
    JSON.stringify(updatedActivities)
  );

  return {
    migrated: true,
    reason: "migrated",
    proofId,
  };
}


export function getBuilderSummary(wallet = null) {
  const hasWallet = Boolean(wallet);

  const reputationRank =
  getReputationRank(wallet);

const xpLevel =
  getCalculatedBuilderLevel(wallet);

const eligibleLevel =
  getEligibleBuilderLevel(wallet);

const nextRequirement =
  getNextLevelRequirementStatus(wallet);

console.log(
  "========== BUILDER LEVEL V2 =========="
);

console.log(
  "XP Level:",
  xpLevel
);

console.log(
  "Eligible Level:",
  eligibleLevel
);

console.log(
  "Next Level:",
  nextRequirement.nextLevel
);

console.log(
  "Next Requirements:",
  nextRequirement.status
);

console.log(
  "======================================"
);


console.log(
  "Verified Level:",
  getVerifiedBuilderLevel(wallet)
);


  return {
    name: wallet
      ? wallet.toLowerCase() ===
        "0x06d71eed44d152d88e6769afbb7cb3bbba2471d0"
        ? "Breen"
        : "Builder"
      : "Builder",

    level: getCalculatedBuilderLevel(wallet),
    xp: getCalculatedBuilderXP(wallet),
    tier: getCalculatedBuilderTier(wallet),
    levelProgress: getLevelProgress(wallet),

reputationRank:
  reputationRank.currentRank,

    nextRank:
  reputationRank.nextRank,

reputationNeeded:
  reputationRank.reputationNeeded,

    builderScore: hasWallet
      ? builderData.builderScore
      : 0,

    network: builderData.network,

    builderSince: hasWallet
      ? builderData.builderSince
      : "Not Connected",

    currentJourney: hasWallet
      ? builderData.currentJourney
      : "Connect your wallet to begin your Builder Journey.",

    reputation: getWalletReputation(wallet),

    reputationBreakdown:
  getWalletReputationBreakdown(wallet),

    achievementProgress:
      getAchievementProgress(wallet),

    latestEvent:
      getLatestTimelineEvent(wallet),

    recommendation:
      getNextRecommendation(wallet).title,

    recommendationReward:
      getNextRecommendation(wallet).reward,

    streak:
      getStoredBuilderStreak(wallet),

    streakStatus:
      getBuilderStreakStatus(wallet),

    streakMessage:
      getBuilderStreakMessage(wallet),

    streakMilestone:
      getBuilderStreakMilestone(wallet),

    completedStreakMilestones:
      getCompletedStreakMilestones(wallet),
  };
}

/* ========================================
   BREEN XP POLICY V2
======================================== */

const XP_REWARD_POLICY = {
  CONNECT_WALLET: "no_reward",

  APPROVE_BREEN: "once_wallet",

  STAKE_BREEN: "once_day",
  UNSTAKE_BREEN: "once_day",

  VISIT_NFT: "no_reward",
  VISIT_MARKET: "no_reward",

  DAILY_LOGIN: "once_day",

  MINT_BUILDER_NFT: "once_wallet",

  DEPLOY_CONTRACT: "once_wallet",
  DEPLOY_CONTRACT_SEPOLIA: "once_wallet",
  DEPLOY_CONTRACT_MAINNET: "once_wallet",

  VERIFY_CONTRACT_SEPOLIA: "once_wallet",
  VERIFY_CONTRACT_MAINNET: "once_wallet",

  VERIFIED_GITHUB_PR: "once_wallet",
};


function checkXPRewardPolicy(
  action,
  wallet,
  rewardScope = null
) {
  if (!wallet) {
    return {
      allowed: false,
      reason: "wallet_required",
    };
  }

  const normalizedWallet =
    wallet.toLowerCase();

  const policy =
    XP_REWARD_POLICY[action];

  // No configured policy:
  // keep old behavior for compatibility.
  if (!policy) {
    return {
      allowed: true,
      reason: "allowed",
    };
  }

  if (policy === "no_reward") {
    return {
      allowed: false,
      reason: "no_reward",
    };
  }

  const today =
    getLocalDateString();


  /* ========================================
     LEGACY / CURRENT REWARD KEYS
     Preserve already-earned rewards
  ======================================== */

  // Approval already uses this key.
  if (action === "APPROVE_BREEN") {
    const legacyKey =
      `breen_reward_approve_${normalizedWallet}`;

    if (
      localStorage.getItem(legacyKey) ===
      "true"
    ) {
      return {
        allowed: false,
        reason: "already_rewarded",
      };
    }

    return {
      allowed: true,
      reason: "rewarded",
      rewardKey: legacyKey,
    };
  }


  // Current Builder NFT reward key.
  if (action === "MINT_BUILDER_NFT") {
    const legacyKey =
      `breen_reward_builder_nft_${normalizedWallet}`;

    if (
      localStorage.getItem(legacyKey) ===
      "true"
    ) {
      return {
        allowed: false,
        reason: "already_rewarded",
      };
    }

    return {
      allowed: true,
      reason: "rewarded",
      rewardKey: legacyKey,
    };
  }


  // Stake / Unstake already use
  // wallet + local calendar day.
  if (
    action === "STAKE_BREEN" ||
    action === "UNSTAKE_BREEN"
  ) {
    const legacyKey =
      `breen_reward_${action.toLowerCase()}_${normalizedWallet}_${today}`;

    if (
      localStorage.getItem(legacyKey) ===
      "true"
    ) {
      return {
        allowed: false,
        reason: "already_rewarded",
      };
    }

    return {
      allowed: true,
      reason: "rewarded",
      rewardKey: legacyKey,
    };
  }


  // Daily Check-In currently stores
  // the last date instead of "true".
  if (action === "DAILY_LOGIN") {
    const legacyKey =
      `breen_daily_checkin_${normalizedWallet}`;

    const lastCheckIn =
      localStorage.getItem(legacyKey);

    if (lastCheckIn === today) {
      return {
        allowed: false,
        reason: "already_checked_in",
      };
    }

    return {
      allowed: true,
      reason: "rewarded",
      rewardKey: legacyKey,
      rewardValue: today,
    };
  }


  /* ========================================
     GENERIC V2 POLICIES
     Used by new/future actions
  ======================================== */

  if (policy === "once_wallet") {
  const legacyRewardKey =
    `breen_xp_policy_${action.toLowerCase()}_${normalizedWallet}`;

  const normalizedScope =
    rewardScope
      ? String(rewardScope).toLowerCase()
      : null;

  const rewardKey =
    normalizedScope
      ? `breen_xp_policy_${action.toLowerCase()}_${normalizedScope}_${normalizedWallet}`
      : legacyRewardKey;


  /* ========================================
     DEPLOYMENT REWARD MIGRATION

     The old verified Counter deployment used
     the non-scoped once_wallet key.

     Migrate that existing reward to the new
     "counter" scope so it cannot earn again.
  ======================================== */

  if (
    normalizedScope === "counter" &&
    localStorage.getItem(rewardKey) !== "true" &&
    localStorage.getItem(legacyRewardKey) === "true"
  ) {
    localStorage.setItem(
      rewardKey,
      "true"
    );

    localStorage.removeItem(
      legacyRewardKey
    );
  }


  if (
    localStorage.getItem(rewardKey) ===
    "true"
  ) {
    return {
      allowed: false,
      reason: "already_rewarded",
    };
  }

  return {
    allowed: true,
    reason: "rewarded",
    rewardKey,
  };
}


  if (policy === "once_day") {
    const rewardKey =
      `breen_xp_policy_${action.toLowerCase()}_${normalizedWallet}_${today}`;

    if (
      localStorage.getItem(rewardKey) ===
      "true"
    ) {
      return {
        allowed: false,
        reason: "already_rewarded",
      };
    }

    return {
      allowed: true,
      reason: "rewarded",
      rewardKey,
    };
  }


  return {
    allowed: true,
    reason: "allowed",
  };
}


export function awardXP(
  action,
  wallet = null,
  rewardScope = null
) {
  if (!wallet) {
  return {
    earnedXP: 0,
    totalXP: 0,
    reason: "wallet_required",
  };
}

const normalizedWallet = wallet.toLowerCase();

const walletXPKey =
  `breen_builder_xp_${normalizedWallet}`;

  const migrationKey =
  "breen_builder_xp_migrated";

if (
  localStorage.getItem(walletXPKey) === null &&
  localStorage.getItem("breen_builder_xp") !== null &&
  localStorage.getItem(migrationKey) !== "true"
) {
  localStorage.setItem(
    walletXPKey,
    localStorage.getItem("breen_builder_xp")
  );

  localStorage.setItem(
    migrationKey,
    "true"
  );
}

const currentXP = Number(
  localStorage.getItem(walletXPKey) || 0
);

  
let earnedXP = getXP(action);


/* ========================================
   XP POLICY V2
======================================== */

const policyResult =
  checkXPRewardPolicy(
    action,
    normalizedWallet,
    rewardScope
  );


/* ========================================
   REWARD NOT ALLOWED
======================================== */

if (!policyResult.allowed) {
  earnedXP = 0;
}


/* ========================================
   DAILY CHECK-IN
   Random 1–5 XP
======================================== */

if (
  action === "DAILY_LOGIN" &&
  policyResult.allowed
) {
  earnedXP =
    Math.floor(Math.random() * 5) + 1;
}


/* ========================================
   SAVE REWARD POLICY STATE
======================================== */

if (
  policyResult.allowed &&
  policyResult.rewardKey
) {
  localStorage.setItem(
    policyResult.rewardKey,
    policyResult.rewardValue ??
      "true"
  );
}

  const newTotalXP =
  currentXP + earnedXP;

localStorage.setItem(
  walletXPKey,
  newTotalXP.toString()
);

// Builder Streak V2
// Only qualifying builder actions will count.
updateBuilderStreak(
  action,
  normalizedWallet
);

const unlockedAchievements =
  processAchievementAction(
    action,
    normalizedWallet
  );

return {
  earnedXP,
  totalXP: newTotalXP,
  reason: policyResult.reason,
  unlockedAchievements,
};
}
