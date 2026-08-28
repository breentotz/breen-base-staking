import { achievementData } from "../data/achievementData";
import { getCompletedAchievements } from "../services/builderEngine";
import "./BuilderAchievements.css";

function BuilderAchievements({ wallet }) {

  const completedAchievements = getCompletedAchievements(wallet);

  const completedIds = new Set(
    completedAchievements.map((achievement) => achievement.id)
  );

  return (
    <div className="builder-achievements-page">
      <div className="achievements-overview">

  <div className="achievements-overview-copy">
    <h2>🏆 Builder Achievements</h2>

    <p>
      Track the milestones that define your Builder journey.
    </p>
  </div>


  <div className="achievements-overview-stats">

    <div className="achievement-overview-stat">
      <span>Completed</span>

      <strong>
        {completedAchievements.length}
        {" / "}
        {achievementData.length}
      </strong>
    </div>


    <div className="achievement-overview-stat">
      <span>Progress</span>

      <strong>
        {Math.round(
          (completedAchievements.length /
            achievementData.length) *
            100
        )}%
      </strong>
    </div>

  </div>

</div>

      <div className="achievement-grid">

  {achievementData.map((achievement) => {
  const completed = completedIds.has(achievement.id);

  return (
    <div
      key={achievement.id}
      className={
        completed
          ? "achievement-card completed"
          : "achievement-card"
      }
    >

      <div className="achievement-card-top">

  <div className="achievement-icon">
    {achievement.icon}
  </div>

  <div
    className={
      completed
        ? "achievement-status completed-status"
        : "achievement-status locked-status"
    }
  >
    {completed ? "✓" : "🔒"}
  </div>

</div>


<div className="achievement-card-content">

  <h3>
    {achievement.title}
  </h3>

  <p>
    {achievement.description}
  </p>

</div>


<div
  className={
    completed
      ? "achievement-card-label completed-label"
      : "achievement-card-label locked-label"
  }
>
  {completed
    ? "Completed"
    : "Locked"}
</div>

    </div>
  );
})}

</div>
    </div>
  );
}

export default BuilderAchievements;