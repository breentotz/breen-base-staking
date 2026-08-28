import "../styles/BuilderPassport.css";

import {
  getBuilderSummary,
  getVerifiedBuilderLevel,
  getVerifiedBuilderTier,
  getNextLevelRequirementStatus,
} from "../services/builderEngine";

function BuilderPassport({
  wallet,
  builderLevel = 5,
  builderXP = 1500,
}) {


  const summary = getBuilderSummary(wallet);

const verifiedLevel =
  getVerifiedBuilderLevel(wallet);

const verifiedTier =
  getVerifiedBuilderTier(wallet);

const nextLevelData =
  getNextLevelRequirementStatus(wallet);

const nextRequirementStatus =
  nextLevelData?.status;

const verifiedProgress =
  nextRequirementStatus
    ? Math.round(
        (
          nextRequirementStatus.completedRequirements /
          nextRequirementStatus.totalRequirements
        ) * 100
      )
    : 0;  

  return (
  <div className="builder-passport-page">

    <div className="passport-compact-card">

      <div className="passport-compact-topbar">
        <span className="passport-brand">
          BREEN BUILDER PASSPORT
        </span>

        <span className="passport-status">
          VERIFIED
        </span>
      </div>


      <div className="passport-compact-main">

        <div className="passport-compact-identity">

          <div className="passport-compact-avatar">
            BN
          </div>

          <div>
            <h2>{summary.name}</h2>

            {wallet && (
              <p>
                {wallet.slice(0, 6)}
                ...
                {wallet.slice(-4)}
              </p>
            )}
          </div>

        </div>


        <div className="passport-compact-rank">

          <span>
            LEVEL {verifiedLevel}
          </span>

          <strong>
            {verifiedTier}
          </strong>

        </div>

      </div>


      <div className="passport-compact-progress">

        <div className="passport-compact-progress-head">
          <span>
            Progress to next level
          </span>

          <strong>
            {nextRequirementStatus
              ? `${nextRequirementStatus.completedRequirements}/${nextRequirementStatus.totalRequirements}`
              : "Complete"}
          </strong>
        </div>

        <div className="passport-level-progress">
          <div
            className="passport-level-progress-fill"
            style={{
              width: `${verifiedProgress}%`,
            }}
          />
        </div>

      </div>


      <div className="passport-compact-stats">

        <div>
          <span>Score</span>
          <strong>{summary.builderScore}</strong>
        </div>

        <div>
          <span>Reputation</span>
          <strong>{summary.reputation}</strong>
        </div>

        <div>
          <span>Streak</span>
          <strong>
            {summary.streak.current}d
          </strong>
        </div>

      </div>


      <div className="passport-compact-footer">

        <span>
          {summary.network}
        </span>

        <span>
          Builder since {summary.builderSince}
        </span>

      </div>

    </div>

  </div>
);
}

export default BuilderPassport;