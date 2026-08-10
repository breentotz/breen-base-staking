import { getBuilderSummary } from "../services/builderEngine";

function BuilderReputation({ wallet }) {

    const summary = getBuilderSummary();

  return (
    <div className="builder-reputation-page">
      <div className="reputation-header">
        <h2>🏅 Builder Reputation</h2>

        <p>
          Earn recognition by building,
          contributing, and helping the Base community.
        </p>
      </div>

      <div className="reputation-card">
        <h3>
  ⭐ {summary.tier}
</h3>

<h1>
  {summary.reputation} / 100
</h1>

<div className="reputation-progress">
  <div
    className="reputation-progress-fill"
    style={{
      width: `${summary.reputation}%`,
    }}
  />
</div>

<p>
  Overall Builder Reputation
</p>

<hr />

<p>
  Next Rank
</p>

<h3>
  💻 {summary.nextRank}
</h3>

<p>
  {summary.reputationNeeded} Reputation Needed
</p>

{wallet && (
  <small>
    Builder: {wallet.slice(0, 6)}
    ...
    {wallet.slice(-4)}
  </small>
)}
      </div>

    <div className="reputation-grid">

  <div className="reputation-item">
    <span>🏗 Build</span>
    <strong>{summary.reputationBreakdown.build}</strong>
  </div>

  <div className="reputation-item">
    <span>🤝 Community</span>
   <strong>{summary.reputationBreakdown.community}</strong>
  </div>

  <div className="reputation-item">
    <span>📚 Learning</span>
    <strong>{summary.reputationBreakdown.learning}</strong>
  </div>

  <div className="reputation-item">
    <span>💻 Open Source</span>
    <strong>{summary.reputationBreakdown.openSource}</strong>
  </div>

  <div className="reputation-insight">
  <span>🤖 AI Reputation Insight</span>

  <h3>
    Strongest Area: Learning
  </h3>

  <p>
    Your Learning reputation is currently your
    strongest category. Your next opportunity is
    improving Open Source contributions.
  </p>

  <strong>
    Suggested Goal: Publish or contribute to
    one open-source Base project.
  </strong>
</div>

</div>

    </div>
  );
}

export default BuilderReputation;