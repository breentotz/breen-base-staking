import { getBuilderSummary } from "../services/builderEngine";

function BuilderPassport({
  wallet,
  builderLevel = 5,
  builderXP = 1500,
}) {


  const summary = getBuilderSummary();

  return (
    <div className="builder-passport-page">
      <div className="passport-header">
        <h2>👤 Builder Passport</h2>

        <p className="passport-tagline">
          Build your reputation. Not just your portfolio.
        </p>
      </div>

      <div className="builder-passport-card">
        <p className="passport-subtitle">
          Your verified identity as a builder on Base.
        </p>

        <div className="passport-hero">
          <div className="passport-avatar">
            🏆
          </div>

          <h1>{summary.name}</h1>

          <div className="passport-tier-badge">
            👑 {summary.tier}
          </div>

          <h2>
            ⭐ Level {summary.level}
          </h2>
          <div className="passport-level-progress">
  <div
    className="passport-level-progress-fill"
    style={{
      width: `${summary.levelProgress.progress}%`,
    }}
  />
</div>

<small>
  {summary.xp} / {summary.levelProgress.nextLevelXP} XP
</small>

        <div className="passport-stats-grid">

          <div className="passport-stat">
            <span>🛡 Builder Score</span>

            <strong>{summary.builderScore} / 100</strong>
          </div>

          <div className="passport-stat">
            <span>🌐 Network</span>

           <strong>{summary.network}</strong>
          </div>

          <div className="passport-stat">
            <span>📅 Builder Since</span>

            <strong>{summary.builderSince}</strong>
          </div>

          </div>

          <div className="passport-journey">
            <span>🎯 Current Journey</span>

            <h3>
              {summary.currentJourney}
            </h3>

            <p>
              Complete your Builder Passport and prepare
              for your first Base Mainnet milestone.
            </p>
          </div>

          <div className="passport-recommendation">
            <span>🤖 Builder Recommendation</span>

            <h3>
              {summary.recommendation}
            </h3>

            <p>
              Continue your Builder Journey by deploying
              your first smart contract on Base Mainnet.
            </p>

            <strong>
             Reward: +{summary.recommendationReward} Lifetime XP
            </strong>
          </div>

          <p>
            Building publicly. Learning continuously.
            Growing on Base.
          </p>

          <div className="passport-stat">
             <span>🔥 Builder Streak</span>

         <strong>
               {summary.streak.current} Days
         </strong>

         <small>
           {summary.streakStatus}
        </small>
        </div>

          {wallet && (
            <small>
              Wallet: {wallet.slice(0, 6)}
              ...
              {wallet.slice(-4)}
            </small>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuilderPassport;