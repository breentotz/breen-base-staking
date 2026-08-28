import {
  verifyDeploymentProof,
} from "./deploymentProof";

import {
  awardXP,
} from "./builderEngine";


/* ========================================
   VERIFIED BASE DEPLOYMENT MILESTONE
======================================== */

 export async function processVerifiedDeployment(
  wallet = null,
  proofPath = "/deployments/counter-latest.json",
  deploymentKey = "counter"
) {
  if (!wallet) {
    return {
      verified: false,
      awarded: false,
      earnedXP: 0,
      reason: "wallet_required",
    };
  }

  /* ========================================
     VERIFY ONCHAIN DEPLOYMENT
  ======================================== */

  const verification =
  await verifyDeploymentProof(
    wallet,
    proofPath
  );

  if (!verification.verified) {
    return {
      verified: false,
      awarded: false,
      earnedXP: 0,
      reason:
        verification.reason ||
        "deployment_not_verified",

      verification,
    };
  }


  /* ========================================
     DETERMINE NETWORK ACTION
  ======================================== */

  const chainId =
    verification.proof?.chainId;

  let action = null;

  if (chainId === "84532") {
    action =
      "DEPLOY_CONTRACT_SEPOLIA";
  }

  if (chainId === "8453") {
    action =
      "DEPLOY_CONTRACT_MAINNET";
  }

  if (!action) {
    return {
      verified: true,
      awarded: false,
      earnedXP: 0,
      reason: "unsupported_network",

      verification,
    };
  }


  /* ========================================
     AWARD VERIFIED BUILDER XP
  ======================================== */

 const xpResult =
  awardXP(
    action,
    wallet,
    deploymentKey
  );


  /* ========================================
     RESULT
  ======================================== */

  return {
    verified: true,

    awarded:
      xpResult.earnedXP > 0,

    earnedXP:
      xpResult.earnedXP,

    totalXP:
      xpResult.totalXP,

    reason:
      xpResult.reason,

    action,

    unlockedAchievements:
      xpResult.unlockedAchievements ||
      [],

    proof:
      verification.proof,
  };
}