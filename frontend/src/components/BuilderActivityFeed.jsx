import "../styles/BuilderJourney.css";

import {
  getBuilderActivities,
  getActivitySummary,
  getWalletStreak,
  getAchievementProgress,
  getWalletReputation,
  getVerifiedBuilderLevel,
  getVerifiedBuilderTier,
  getNextLevelRequirementStatus,
  BUILDER_LEVEL_TITLES,
} from "../services/builderEngine";

function BuilderActivityFeed({ wallet }) {

  const activities =
    getBuilderActivities(wallet);

  const activitySummary =
    getActivitySummary(wallet);

 const builderStreak =
  getWalletStreak(wallet);

const achievementProgress =
  getAchievementProgress(wallet);

const reputation =
  getWalletReputation(wallet);

const verifiedLevel =
  getVerifiedBuilderLevel(wallet);

const journeyStage =
  getVerifiedBuilderTier(wallet);

const nextLevelData =
  getNextLevelRequirementStatus(wallet);

const nextLevel =
  nextLevelData?.nextLevel || verifiedLevel;

const nextLevelTitle =
  BUILDER_LEVEL_TITLES[nextLevel] ||
  journeyStage;

const nextRequirements =
  nextLevelData?.status;


const activeDaysRemaining =
  nextRequirements
    ? Math.max(
        0,
        nextRequirements.requirements.activeDays -
          nextRequirements.current.activeDays
      )
    : 0;

const journeyProgress =
  nextRequirements
    ? Math.round(
        (
          nextRequirements.completedRequirements /
          nextRequirements.totalRequirements
        ) * 100
      )
    : 0;  

const nextJourneyStage =
  journeyStage === "Foundation Builder"
    ? "Base Explorer"
    : journeyStage === "Base Explorer"
    ? "Onchain Contributor"
    : journeyStage === "Onchain Contributor"
    ? "Active Builder"
    : journeyStage === "Active Builder"
    ? "Established Builder"
    : journeyStage === "Established Builder"
    ? "Legendary Builder"
    : null;



  return (
    <div className="builder-activity-feed">
      <h2>📜 Builder Activity</h2>

      <p>
        Your recent milestones and builder journey.
      </p>

    <div className="builder-journey-overview">
  <span>BUILDER JOURNEY</span>

  <h3>
    {journeyStage}
  </h3>

  <p>
    Your current stage based on activity,
    streak, achievements, and reputation.
  </p>

  <div className="builder-journey-stats">
    <span>
      🔥 {builderStreak} Day Streak
    </span>

    <span>
      🏆 {achievementProgress.completed} Achievements
    </span>

    <span>
      ⭐ {reputation} Reputation
    </span>
  </div>
</div> 

<div className="builder-journey-progress">
  <p>
    Next Milestone
  </p>

  <strong>
  {nextLevelTitle}
</strong>

  <div className="journey-progress-bar">
    <div
  className="journey-progress-fill"
  style={{
    width: `${journeyProgress}%`,
  }}
/>
  </div>
  {nextRequirements && (
  <div className="journey-requirements">

    <div className="journey-requirement-item">
      <span>⚡ XP</span>

      <strong>
        {nextRequirements.current.xp}
        {" / "}
        {nextRequirements.requirements.xp}

        {nextRequirements.checks.xp
          ? " ✓"
          : ""}
      </strong>
    </div>


    <div className="journey-requirement-item">
  <span>📅 Active Days</span>

  <strong>
    {nextRequirements.current.activeDays}
    {" / "}
    {nextRequirements.requirements.activeDays}

    {nextRequirements.checks.activeDays
      ? " ✓"
      : ""}
  </strong>

  {!nextRequirements.checks.activeDays && (
    <small className="journey-requirement-note">
      {activeDaysRemaining} more active days needed
    </small>
  )}
</div>


    <div className="journey-requirement-item">
      <span>🏆 Achievements</span>

      <strong>
        {nextRequirements.current.achievements}
        {" / "}
        {nextRequirements.requirements.achievements}

        {nextRequirements.checks.achievements
          ? " ✓"
          : ""}
      </strong>
    </div>


    <div className="journey-requirement-item">
      <span>🔥 Longest Streak</span>

      <strong>
        {nextRequirements.current.longestStreak}
        {" / "}
        {nextRequirements.requirements.streak}

        {nextRequirements.checks.streak
          ? " ✓"
          : ""}
      </strong>
    </div>


    <div className="journey-requirement-item">
      <span>⭐ Reputation</span>

      <strong>
        {nextRequirements.current.reputation}
        {" / "}
        {nextRequirements.requirements.reputation}

        {nextRequirements.checks.reputation
          ? " ✓"
          : ""}
      </strong>
    </div>

  </div>
)}
</div>


{nextRequirements && (
  <div className="builder-next-objective">
    <div className="builder-next-objective-icon">
      🎯
    </div>

    <div>
      <span>NEXT OBJECTIVE</span>

      <strong>
        {activeDaysRemaining > 0
          ? `Build on ${activeDaysRemaining} more active ${
              activeDaysRemaining === 1 ? "day" : "days"
            }`
          : "Complete your remaining Builder requirements"}
      </strong>

      <p>
        Keep completing meaningful Builder actions
        to reach {nextJourneyStage}.
      </p>
    </div>
  </div>
)}


      <div className="builder-activity-summary">
  <div>
    <strong>
      {activitySummary.totalActivities}
    </strong>

    <span>
      Activities
    </span>
  </div>

  <div>
  <strong>
    +{activitySummary.totalXP}
  </strong>

  <span>
    Activity XP
  </span>
</div>
</div>

      <div className="builder-activity-list">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="builder-activity-item"
          >
            <div className="builder-activity-icon">
              {activity.icon}
            </div>

            <div className="builder-activity-content">
              <h3>{activity.title}</h3>

              <p>{activity.description}</p>

              <small>{activity.date}</small>
              {activity.txHash && (
  <a
    href={`https://sepolia.basescan.org/tx/${activity.txHash}`}
    target="_blank"
    rel="noreferrer"
    className="activity-tx-link"
  >
    View Transaction ↗
  </a>
)}
            </div>

            <strong>
             +{activity.xp || 0} XP
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuilderActivityFeed;