import { achievementData } from "../data/achievementData";

function BuilderAchievements({ wallet }) {
  return (
    <div className="builder-achievements-page">
      <div className="achievements-header">
        <h2>🏆 Builder Achievements</h2>

        <p>
          Celebrate the milestones that define
          your journey as a builder on Base.
        </p>
      </div>

      <div className="achievements-card">
        <h3>Your Builder Milestones</h3>

<p>
  Every achievement reflects a step
  in your journey as a Base builder.
</p>

        {wallet && (
          <small>
            Builder: {wallet.slice(0, 6)}
            ...
            {wallet.slice(-4)}
          </small>
        )}
      </div>

      <div className="achievement-grid">

  {achievementData.map((achievement) => (

    <div
      key={achievement.id}
      className={
        achievement.completed
          ? "achievement-card completed"
          : "achievement-card"
      }
    >

      <div className="achievement-icon">
        {achievement.icon}
      </div>

      <h3>
        {achievement.title}
      </h3>

      <p>
        {achievement.description}
      </p>

      <strong>
        {achievement.completed
          ? "✅ Completed"
          : "🔒 Locked"}
      </strong>

    </div>

  ))}

</div>
    </div>
  );
}

export default BuilderAchievements;