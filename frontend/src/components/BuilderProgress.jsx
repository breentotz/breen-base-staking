import {
  getVerifiedBuilderLevel,
  getVerifiedBuilderTier,
  getNextLevelRequirementStatus,
} from "../services/builderEngine";

function BuilderProgress({ wallet }) {
  const verifiedLevel =
    getVerifiedBuilderLevel(wallet);

  const verifiedTier =
    getVerifiedBuilderTier(wallet);

  const nextLevelData =
    getNextLevelRequirementStatus(wallet);

  const status = nextLevelData?.status;

  const completed =
    status?.completedRequirements ?? 0;

  const total =
    status?.totalRequirements ?? 0;

  const progress =
    total > 0
      ? Math.min(
          (completed / total) * 100,
          100
        )
      : 100;

  return (
    <div className="builder-progress">

      <div className="builder-progress-header">
        <h3>📈 Builder Progress</h3>

        <span>
          Level {verifiedLevel}
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

        <span>
          {status
            ? `${completed} / ${total} requirements`
            : "Current level complete"}
        </span>

        <span>
          {verifiedTier}
        </span>

      </div>

    </div>
  );
}

export default BuilderProgress;