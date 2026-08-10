import { builderData } from "../data/builderData";
import { achievementData } from "../data/achievementData";
import { timelineData } from "../data/timelineData";
import { streakData } from "../data/streakData";
import { activityData } from "../data/activityData";
import { getXP } from "./xpEngine";

export function getCompletedAchievements() {
  return achievementData.filter(
    (achievement) => achievement.completed
  );
}

export function getAchievementProgress() {
  const completed = getCompletedAchievements().length;
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

export function getNextRecommendation() {
  const progress = getAchievementProgress();

  if (progress.percentage < 50) {
    return {
      title: "Complete more achievements",
      reward: 250,
    };
  }

  if (builderData.reputation.overall < 90) {
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

export function getLatestTimelineEvent() {
  return timelineData[0] ?? null;
}

export function getBuilderStreakStatus() {
  const days = streakData.current;

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

export function getCalculatedBuilderXP() {
  const achievementXP =
    getCompletedAchievements().length * 200;

  const reputationXP =
    builderData.reputation.overall * 5;

  const streakXP =
    streakData.current * 25;

  return (
    achievementXP +
    reputationXP +
    streakXP
  );
}

export function getCalculatedBuilderLevel() {
  const xp = getCalculatedBuilderXP();

  if (xp >= 2000) {
    return 5;
  }

  if (xp >= 1500) {
    return 4;
  }

  if (xp >= 1000) {
    return 3;
  }

  if (xp >= 500) {
    return 2;
  }

  return 1;
}

export function getCalculatedBuilderTier() {
  const level = getCalculatedBuilderLevel();

  if (level >= 5) {
    return "Elite Builder";
  }

  if (level === 4) {
    return "Base Builder";
  }

  if (level === 3) {
    return "Developer";
  }

  if (level === 2) {
    return "Contributor";
  }

  return "Explorer";
}

export function getLevelProgress() {
  const xp = getCalculatedBuilderXP();

  const thresholds = [
    0,
    500,
    1000,
    1500,
    2000,
  ];

  const level = getCalculatedBuilderLevel();

  const currentLevelXP =
    thresholds[level - 1];

  const nextLevelXP =
    thresholds[level] ?? thresholds[thresholds.length - 1];

  const progress =
    nextLevelXP > currentLevelXP
      ? Math.round(
          ((xp - currentLevelXP) /
            (nextLevelXP - currentLevelXP)) *
            100
        )
      : 100;

  return {
    currentLevelXP,
    nextLevelXP,
    progress,
  };
}

export function getBuilderActivities() {
  return activityData;
}

export function getActivitySummary() {
  const activities = getBuilderActivities();

  const totalXP = activities.reduce(
    (sum, activity) => sum + activity.xp,
    0
  );

  return {
    totalActivities: activities.length,
    totalXP,
  };
}

export function getBuilderSummary() {
  return {
    name: builderData.name,
    level: getCalculatedBuilderLevel(),
    xp: getCalculatedBuilderXP(),
    tier: getCalculatedBuilderTier(),
    levelProgress: getLevelProgress(),

    nextRank: builderData.nextRank,
    reputationNeeded: builderData.reputationNeeded,

    builderScore: builderData.builderScore,
    network: builderData.network,
    builderSince: builderData.builderSince,
    currentJourney: builderData.currentJourney,

    reputation: builderData.reputation.overall,

    reputationBreakdown: {
      build: builderData.reputation.build,
      community: builderData.reputation.community,
      learning: builderData.reputation.learning,
      openSource: builderData.reputation.openSource,
    },

    achievementProgress: getAchievementProgress(),

    latestEvent: getLatestTimelineEvent(),

    recommendation: getNextRecommendation().title,

    recommendationReward: getNextRecommendation().reward,

    streak: {
      current: streakData.current,
      longest: streakData.longest,
      lastActivity: streakData.lastActivity,
      weekly: streakData.weekly,
    },

    streakStatus: getBuilderStreakStatus(),
  };
}

export function awardXP(action) {
  const earnedXP = getXP(action);

  const currentXP = Number(
    localStorage.getItem("breen_builder_xp") || 0
  );

  const newTotalXP = currentXP + earnedXP;

  localStorage.setItem(
    "breen_builder_xp",
    newTotalXP.toString()
  );

  return {
    earnedXP,
    totalXP: newTotalXP,
  };
}
