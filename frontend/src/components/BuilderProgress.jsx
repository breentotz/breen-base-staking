import { formatTokenAmount } from "../utils/format";

function BuilderProgress({
  level,
  xp,
  nextLevelXP,
}) {
  const progress = Math.min(
    (xp / nextLevelXP) * 100,
    100
  );

  return (
    <div className="builder-progress">

      <div className="builder-progress-header">
        <h3>📈 Builder Progress</h3>

        <span>
          Level {level}
        </span>
      </div>

      <div className="progress-bar">

        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <div className="builder-progress-footer">

        <span>{formatTokenAmount(xp)} XP</span>
<span>{formatTokenAmount(nextLevelXP)} XP</span>

      </div>

    </div>
  );
}

export default BuilderProgress;