import "./BuilderReputation.css";
import { useEffect, useState } from "react";

import {
  getBuilderSummary,
  getOpenSourceProofHistory,
  getBuilderIdentity,
  saveBuilderGitHubIdentity,
  getGitHubVerificationMessage,
  verifyAndSaveGitHubIdentity,
  getGitHubPullRequestProofStatus,
  verifyGitHubPullRequest,
  claimGitHubOpenSourceProof,
  getCommunityXProofStatus,
  claimCommunityXProof,
  saveBuilderXIdentity,
  getXVerificationMessage,
  getXVerificationPostStatus,
} from "../services/builderEngine";

function BuilderReputation({ wallet }) {

  const summary = getBuilderSummary(wallet);

  const openSourceProofHistory =
  getOpenSourceProofHistory(wallet);

  const [githubUsername, setGithubUsername] =
  useState("");

  const [xUsername, setXUsername] =
  useState("");

const [xIdentityStatus, setXIdentityStatus] =
  useState(null);

const [editingX, setEditingX] =
  useState(false);

const [
  xSubmittedVerificationUrl,
  setXSubmittedVerificationUrl,
] = useState("");

const [
  xVerificationPostStatus,
  setXVerificationPostStatus,
] = useState(null);


const [identityStatus, setIdentityStatus] =
  useState(null);


const builderIdentity =
  getBuilderIdentity(wallet);

const verificationMessage =
  getGitHubVerificationMessage(wallet);

const xVerificationMessage =
  getXVerificationMessage(wallet);  

const xVerificationPostUrl =
  xVerificationMessage
    ? `https://x.com/intent/post?text=${encodeURIComponent(
        xVerificationMessage
      )}`
    : "";
    
    

  function saveGitHubIdentity() {
  const result =
    saveBuilderGitHubIdentity(
      wallet,
      githubUsername
    );

  setIdentityStatus(result);

if (result.saved) {
  setEditingGitHub(false);
  setOpenProofPanel("github");
}
}


async function checkXVerificationPost() {
  const localResult =
    getXVerificationPostStatus(
      wallet,
      xSubmittedVerificationUrl
    );

  setXVerificationPostStatus(
    localResult
  );

  if (!localResult.valid) {
    return;
  }

  try {
    const response = await fetch(
      "/api/verify-x",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
  postId:
    localResult.postId,

  expectedUsername:
    builderIdentity.xUsername,

  expectedMessage:
    xVerificationMessage,
}),
      }
    );

    const result =
      await response.json();

    setXVerificationPostStatus({
      ...localResult,
      ...result,
    });
  } catch (error) {
    console.error(
      "X verification request failed:",
      error
    );

    setXVerificationPostStatus({
      ...localResult,
      contentVerified: false,
      reason: "x_verification_request_failed",
    });
  }
}


function saveXIdentity() {
  const result =
    saveBuilderXIdentity(
      wallet,
      xUsername
    );

  setXIdentityStatus(result);

  if (result.saved) {
    setEditingX(false);
  }
}

const [editingGitHub, setEditingGitHub] =
  useState(false);

const [githubClaimStatus, setGithubClaimStatus] =
  useState(null);


async function verifyGitHubIdentity() {
  setIdentityStatus({
    checking: true,
  });

  const result =
    await verifyAndSaveGitHubIdentity(
      wallet
    );

  setIdentityStatus(result);

  if (result.verified) {
    setEditingGitHub(false);
    setOpenProofPanel("github");
  }
}

  const [githubPrUrl, setGithubPrUrl] =
  useState("");

const [githubProofStatus, setGithubProofStatus] =
  useState(null);

  const [communityPostUrl, setCommunityPostUrl] =
  useState("");

const [communityProofStatus, setCommunityProofStatus] =
  useState(null);

const [communityClaimStatus, setCommunityClaimStatus] =
  useState(null);

const [openProofPanel, setOpenProofPanel] =
  useState(null);

useEffect(() => {
  // Reset wallet-specific Reputation UI
  // whenever the connected wallet changes.

  setGithubUsername("");
  setXUsername("");

  setIdentityStatus(null);
  setXIdentityStatus(null);

  setEditingGitHub(false);
  setEditingX(false);

  setGithubPrUrl("");
  setGithubProofStatus(null);
  setGithubClaimStatus(null);

  setCommunityPostUrl("");
  setCommunityProofStatus(null);
  setCommunityClaimStatus(null);

  setXSubmittedVerificationUrl("");
  setXVerificationPostStatus(null);

  setOpenProofPanel(null);
}, [wallet]);


async function claimGitHubProof() {
  setGithubClaimStatus({
    claiming: true,
  });

  const result =
    await claimGitHubOpenSourceProof(
      wallet,
      githubPrUrl
    );

  setGithubClaimStatus(result);

  if (result.claimed) {
    setGithubProofStatus((current) => ({
      ...current,

      status: "claimed",
      alreadyClaimed: true,

      reward:
        result.reward || null,

      reputationPoints:
        result.reputationPoints || 0,
    }));
  }
}


function checkCommunityProof() {
  const result =
    getCommunityXProofStatus(
      wallet,
      communityPostUrl
    );

  setCommunityProofStatus(result);
}


function claimCommunityProof() {
  const result =
    claimCommunityXProof(
      wallet,
      communityPostUrl
    );

  setCommunityClaimStatus(result);

  if (result.claimed) {
    setCommunityProofStatus((current) => ({
      ...current,
      status: "already_used",
    }));
  }
}


 async function checkGitHubProof() {
  if (!wallet) {
    setGithubProofStatus({
      status: "wallet_required",
    });

    return;
  }

  setGithubProofStatus({
    status: "checking",
  });

  const verification =
  await verifyGitHubPullRequest(
    githubPrUrl,
    wallet
  );

  if (!verification.verified) {
    setGithubProofStatus({
      status: "invalid",
      reason:
        verification.reason,
      proofId: null,
    });

    return;
  }

  const proofStatus =
    getGitHubPullRequestProofStatus(
      wallet,
      githubPrUrl
    );

  setGithubProofStatus({
  ...proofStatus,

  githubVerified: true,

  eligible:
    verification.eligible,

  eligibilityReason:
    verification.reason,

  alreadyClaimed:
    proofStatus.status ===
    "already_used",

  title:
    verification.contribution?.title ||
    "",

  author:
    verification.contribution?.author ||
    "",

  state:
    verification.contribution?.state ||
    "",

  merged:
    verification.contribution?.merged ||
    false,

  htmlUrl:
    verification.contribution?.htmlUrl ||
    "",
});
}


  const reputationAreas = {
    Build: summary.reputationBreakdown.build,
    Community: summary.reputationBreakdown.community,
    Learning: summary.reputationBreakdown.learning,
    "Open Source": summary.reputationBreakdown.openSource,
  };

  const strongestArea = Object.entries(
    reputationAreas
  ).reduce((strongest, current) =>
    current[1] > strongest[1]
      ? current
      : strongest
  )[0];

  const weakestArea = Object.entries(
    reputationAreas
  ).reduce((weakest, current) =>
    current[1] < weakest[1]
      ? current
      : weakest
  )[0];

  return (
    <div className="builder-reputation-page">

  <div className="reputation-v2-shell">

    <div className="reputation-v2-heading">
      <div>
        <span className="reputation-v2-eyebrow">
          BUILDER REPUTATION
        </span>

        <h2>Reputation Profile</h2>

        <p>
          Your verified contribution score across Base.
        </p>
      </div>

      <div className="reputation-v2-rank">
        <span>CURRENT RANK</span>
        <strong>{summary.reputationRank}</strong>
      </div>
    </div>


    <div className="reputation-v2-score-row">

      <div className="reputation-v2-score">
        <strong>{summary.reputation}</strong>
        <span>/ 100</span>
      </div>

      <div className="reputation-v2-progress-area">

        <div className="reputation-v2-progress-label">
          <span>Overall Reputation</span>
          <strong>{summary.reputation}%</strong>
        </div>

        <div className="reputation-v2-progress">
          <div
            className="reputation-v2-progress-fill"
            style={{
              width: `${summary.reputation}%`,
            }}
          />
        </div>

      </div>


      <div className="reputation-v2-next">
        <span>NEXT RANK</span>

        <strong>{summary.nextRank}</strong>

        <small>
          {summary.reputationNeeded} reputation needed
        </small>
      </div>

    </div>


    <div className="reputation-v2-metrics">

      <div className="reputation-v2-metric">
        <span>BUILD</span>
        <strong>
          {summary.reputationBreakdown.build}
        </strong>
      </div>

      <div className="reputation-v2-metric">
        <span>COMMUNITY</span>
        <strong>
          {summary.reputationBreakdown.community}
        </strong>
      </div>

      <div className="reputation-v2-metric">
        <span>LEARNING</span>
        <strong>
          {summary.reputationBreakdown.learning}
        </strong>
      </div>

      <div className="reputation-v2-metric">
        <span>OPEN SOURCE</span>
        <strong>
          {summary.reputationBreakdown.openSource}
        </strong>
      </div>

      </div>
</div>


<div className="reputation-proof-hub">

  <div className="reputation-proof-hub-header">
    <div>
      <span>IDENTITY & PROOFS</span>

      <h3>
        Builder Verification Center
      </h3>
    </div>

    <small>
      Manage your reputation sources
    </small>
  </div>


  <div className="reputation-proof-grid">

    <button
      type="button"
      className={
        openProofPanel === "github"
          ? "reputation-proof-card active"
          : "reputation-proof-card"
      }
      onClick={() =>
        setOpenProofPanel(
          openProofPanel === "github"
            ? null
            : "github"
        )
      }
    >
      <div>
        <span>GitHub Identity</span>

        <strong>
          {builderIdentity.githubVerified
            ? "Verified"
            : "Not Verified"}
        </strong>
      </div>

      <small>
        {openProofPanel === "github"
          ? "Close"
          : "Manage"}
      </small>
    </button>


    <button
      type="button"
      className={
        openProofPanel === "x"
          ? "reputation-proof-card active"
          : "reputation-proof-card"
      }
      onClick={() =>
        setOpenProofPanel(
          openProofPanel === "x"
            ? null
            : "x"
        )
      }
    >
      <div>
        <span>X Identity</span>

        <strong>
          {builderIdentity.xVerified
            ? "Verified"
            : "Not Verified"}
        </strong>
      </div>

      <small>
        {openProofPanel === "x"
          ? "Close"
          : "Manage"}
      </small>
    </button>


    <button
      type="button"
      className={
        openProofPanel === "community"
          ? "reputation-proof-card active"
          : "reputation-proof-card"
      }
      onClick={() =>
        setOpenProofPanel(
          openProofPanel === "community"
            ? null
            : "community"
        )
      }
    >
      <div>
        <span>Community Proof</span>

        <strong>
          Reputation Proof
        </strong>
      </div>

      <small>
        {openProofPanel === "community"
          ? "Close"
          : "Manage"}
      </small>
    </button>


    <button
      type="button"
      className={
        openProofPanel === "opensource"
          ? "reputation-proof-card active"
          : "reputation-proof-card"
      }
      onClick={() =>
        setOpenProofPanel(
          openProofPanel === "opensource"
            ? null
            : "opensource"
        )
      }
    >
      <div>
        <span>Open Source</span>

        <strong>
          GitHub PR Proof
        </strong>
      </div>

      <small>
        {openProofPanel === "opensource"
          ? "Close"
          : "Manage"}
      </small>
    </button>

  </div>

</div>
{/* =========================================
    GITHUB IDENTITY
========================================= */}

{openProofPanel === "github" && (
  <div className="reputation-insight">

    <span>🔐 BUILDER IDENTITY</span>

    <h3>Wallet × GitHub</h3>

    <p>
      Link your GitHub account to your connected BREEN wallet.
    </p>

    {builderIdentity.githubUsername && !editingGitHub ? (
      <>
        <p>
          GitHub:{" "}
          <strong>
            @{builderIdentity.githubUsername}
          </strong>
        </p>

        <p>
          Status:{" "}
          <strong>
            {builderIdentity.githubVerified
              ? "Verified ✅"
              : "Unverified"}
          </strong>
        </p>

        <button
          type="button"
          onClick={() => {
            setGithubUsername(
              builderIdentity.githubUsername
            );
            setEditingGitHub(true);
          }}
        >
          Change GitHub
        </button>
      </>
    ) : (
      <>
        <input
          type="text"
          value={githubUsername}
          onChange={(event) =>
            setGithubUsername(event.target.value)
          }
          placeholder="GitHub username"
        />

        <button
          type="button"
          onClick={saveGitHubIdentity}
        >
          Save GitHub
        </button>
      </>
    )}

    {builderIdentity.githubUsername &&
      !builderIdentity.githubVerified && (
        <>
          <p>
            Add this exact message to your GitHub profile bio:
          </p>

          <code>{verificationMessage}</code>

          <button
            type="button"
            onClick={verifyGitHubIdentity}
          >
            Verify GitHub Identity
          </button>
        </>
      )}

    {identityStatus?.checking && (
      <p>Checking GitHub profile...</p>
    )}

    {identityStatus?.reason && (
      <p>
        Status: {identityStatus.reason}
      </p>
    )}

  </div>
)}


{/* =========================================
    X IDENTITY
========================================= */}

{openProofPanel === "x" && (
  <div className="reputation-insight">

    <span>𝕏 BUILDER IDENTITY</span>

    <h3>Wallet × X</h3>

    <p>
      Link your X account to your connected BREEN wallet.
    </p>

    {builderIdentity.xUsername && !editingX ? (
      <>
        <p>
          X:{" "}
          <strong>
            @{builderIdentity.xUsername}
          </strong>
        </p>

        <p>
          Status:{" "}
          <strong>
            {builderIdentity.xVerified
              ? "Verified ✅"
              : "Unverified"}
          </strong>
        </p>

        {!builderIdentity.xVerified &&
          xVerificationMessage && (
            <div>
              <p>
                <strong>
                  X Verification Challenge
                </strong>
              </p>

              <p>
                Post this message from{" "}
                @{builderIdentity.xUsername}:
              </p>

              <p>
                {xVerificationMessage}
              </p>

              <a
                href={xVerificationPostUrl}
                target="_blank"
                rel="noreferrer"
              >
                <button type="button">
                  𝕏 Post Verification
                </button>
              </a>
            </div>
          )}

        <button
          type="button"
          onClick={() => {
            setXUsername(
              builderIdentity.xUsername
            );
            setEditingX(true);
          }}
        >
          Change X
        </button>
      </>
    ) : (
      <>
        <input
          type="text"
          value={xUsername}
          onChange={(event) =>
            setXUsername(event.target.value)
          }
          placeholder="X username"
        />

        <button
          type="button"
          onClick={saveXIdentity}
        >
          Save X
        </button>
      </>
    )}

    {!builderIdentity.xVerified && (
      <div>
        <p>
          After posting the verification message,
          paste the post URL here:
        </p>

        <input
          type="url"
          value={xSubmittedVerificationUrl}
          onChange={(event) =>
            setXSubmittedVerificationUrl(
              event.target.value
            )
          }
          placeholder="https://x.com/username/status/..."
        />

        <button
          type="button"
          onClick={checkXVerificationPost}
        >
          Check Verification Post
        </button>

        {xVerificationPostStatus && (
          <div>
            <p>
              Author Check:{" "}
              {xVerificationPostStatus.valid
                ? "Matched ✅"
                : "Failed ❌"}
            </p>

            {xVerificationPostStatus.reason && (
              <p>
                Reason:{" "}
                {xVerificationPostStatus.reason}
              </p>
            )}
          </div>
        )}
      </div>
    )}

    {xIdentityStatus?.reason && (
      <p>
        Status: {xIdentityStatus.reason}
      </p>
    )}

  </div>
)}

{/* =========================================
    COMMUNITY PROOF
========================================= */}

{openProofPanel === "community" && (
  <div className="reputation-insight">

    <span>🤝 COMMUNITY PROOF</span>

    <h3>
      X Community Contribution
    </h3>

    <p>
      Paste a public X post URL to use it
      as a Community Reputation proof.
    </p>

    <input
      type="url"
      value={communityPostUrl}
      onChange={(event) =>
        setCommunityPostUrl(
          event.target.value
        )
      }
      placeholder="https://x.com/username/status/123..."
    />

    <button
      type="button"
      onClick={checkCommunityProof}
    >
      Check Community Proof
    </button>

    {communityProofStatus && (
      <div>

        <p>
          Status:{" "}
          {communityProofStatus.status}
        </p>

        {communityProofStatus.proofId && (
          <p>
            Proof ID:{" "}
            {communityProofStatus.proofId}
          </p>
        )}

        {communityProofStatus.status ===
          "unverified" && (
          <button
            type="button"
            onClick={claimCommunityProof}
          >
            🤝 Claim Community Proof
          </button>
        )}

        {(
          communityProofStatus.status ===
            "already_used" ||
          communityClaimStatus?.reason ===
            "proof_already_used"
        ) && (
          <p>
            ✅ Community Proof Already Claimed
          </p>
        )}

        {communityProofStatus.reason && (
          <p>
            Reason:{" "}
            {communityProofStatus.reason}
          </p>
        )}

      </div>
    )}

  </div>
)}

{/* =========================================
    OPEN SOURCE PROOF
========================================= */}

{openProofPanel === "opensource" && (
  <div className="reputation-insight">

    <span>🐙 GITHUB OPEN SOURCE PROOF</span>

    <h3>
      Verify a GitHub Pull Request
    </h3>

    <p>
      Paste a public GitHub PR URL to check
      whether it can be used as an Open Source
      reputation proof.
    </p>

    <input
      type="url"
      value={githubPrUrl}
      onChange={(event) =>
        setGithubPrUrl(
          event.target.value
        )
      }
      placeholder="https://github.com/owner/repo/pull/42"
    />

    <button
      type="button"
      onClick={checkGitHubProof}
    >
      Check PR Proof
    </button>

    {githubProofStatus && (
      <div>

        <strong>
  Proof Status:{" "}
  {githubProofStatus.alreadyClaimed ||
  githubClaimStatus?.reason ===
    "proof_already_used" ||
  githubClaimStatus?.claimed
    ? "Claimed ✅"
    : githubProofStatus.githubVerified
    ? githubProofStatus.eligible
      ? "Eligible ✅"
      : "Rejected ❌"
    : githubProofStatus.status}
</strong>

        {githubProofStatus.proofId && (
          <p>
            Proof ID:{" "}
            {githubProofStatus.proofId}
          </p>
        )}

        {githubProofStatus.reason && (
          <p>
            Reason:{" "}
            {githubProofStatus.reason}
          </p>
        )}

        {githubProofStatus.githubVerified && (
          <div>

            <p>
              GitHub PR: Verified
            </p>

            <p>
              Title:{" "}
              {githubProofStatus.title}
            </p>

            <p>
              Author:{" "}
              {githubProofStatus.author}
            </p>

            <p>
              State:{" "}
              {githubProofStatus.state}
            </p>

            <p>
              Merged:{" "}
              {githubProofStatus.merged
                ? "Yes"
                : "No"}
            </p>

            <p>
              Eligibility:{" "}
              {githubProofStatus.eligible
                ? "Eligible"
                : "Not Eligible"}
            </p>

            {githubProofStatus.eligible &&
              !githubProofStatus.alreadyClaimed &&
              githubClaimStatus?.reason !==
                "proof_already_used" && (
                <button
                  type="button"
                  onClick={claimGitHubProof}
                  disabled={
                    githubClaimStatus?.claiming
                  }
                >
                  {githubClaimStatus?.claiming
                    ? "⏳ Claiming..."
                    : "🏆 Claim Open Source Proof"}
                </button>
              )}

            {(
              githubProofStatus.alreadyClaimed ||
              githubClaimStatus?.reason ===
                "proof_already_used"
            ) && (
              <p>
                ✅ Open Source Proof Already Claimed
              </p>
            )}

            {githubClaimStatus?.reason &&
              githubClaimStatus.reason !==
                "proof_already_used" && (
                <p>
                  Claim Status:{" "}
                  {githubClaimStatus.reason}
                </p>
              )}

              {githubClaimStatus?.claimed &&
  githubClaimStatus?.reward && (
    <div className="github-proof-reward">

      <span>
        ✓ VERIFIED CONTRIBUTION RECORDED
      </span>

      <strong>
        +{githubClaimStatus.reward.reputation} Open Source Reputation
      </strong>

      <p>
        This GitHub proof has been permanently linked
        to your Builder reputation.
      </p>

    </div>
  )}

            {!githubProofStatus.eligible && (
              <p>
                Reason:{" "}
                {githubProofStatus
                  .eligibilityReason ===
                "github_author_mismatch"
                  ? "PR author does not match your verified GitHub identity."
                  : githubProofStatus
                      .eligibilityReason ===
                    "github_identity_not_verified"
                  ? "Verify your GitHub identity first."
                  : githubProofStatus
                      .eligibilityReason ===
                    "pull_request_not_merged"
                  ? "PR must be merged."
                  : githubProofStatus
                      .eligibilityReason ||
                    "This PR is not eligible."}
              </p>
            )}

          </div>
        )}



      </div>
    )}

  </div>
)}

{openSourceProofHistory.length > 0 && (
  <div className="verified-open-source-card">

    <span>🏆 VERIFIED OPEN SOURCE</span>

    <h3>
      {openSourceProofHistory.length} Verified{" "}
      {openSourceProofHistory.length === 1
        ? "Contribution"
        : "Contributions"}
    </h3>

    <p>
      Verified GitHub contributions linked to this Builder wallet.
    </p>

    <div className="open-source-proof-history">
      {openSourceProofHistory.map(
  (activity, index) => (
    <div
      key={`${activity.proofId || activity.title}-${index}`}
      className="open-source-proof-history-item"
    >

      <div className="open-source-proof-main">

        <strong>
          ✅ {activity.githubTitle || activity.title}
        </strong>

        <span className="open-source-verified-badge">
          VERIFIED
        </span>

      </div>

      <p>
        {activity.description}
      </p>

      {(activity.owner ||
        activity.repo ||
        activity.number ||
        activity.githubAuthor) && (
        <div className="open-source-proof-meta">

          {activity.owner &&
            activity.repo && (
              <span>
                📦 {activity.owner}/{activity.repo}
              </span>
            )}

          {activity.number && (
            <span>
              PR #{activity.number}
            </span>
          )}

          {activity.githubAuthor && (
            <span>
              👤 @{activity.githubAuthor}
            </span>
          )}

          {activity.merged && (
            <span>
              ✅ Merged
            </span>
          )}

        </div>
      )}

      {activity.githubUrl && (
        <a
          href={activity.githubUrl}
          target="_blank"
          rel="noreferrer"
          className="open-source-github-link"
        >
          View on GitHub ↗
        </a>
      )}

    </div>
  )
)}
    </div>

  </div>
)}


  <div className="reputation-insight">
  <span>🤖 AI Reputation Insight</span>

  <h3>
    Strongest Area: {strongestArea}
  </h3>

  <p>
    Your {strongestArea} reputation is currently
    your strongest category. Your next opportunity
    is improving {weakestArea}.
  </p>

  <strong>
    Suggested Goal: Strengthen your{" "}
{weakestArea} reputation through your next
Builder activity.
  </strong>
</div>

</div>

  );
}

export default BuilderReputation;