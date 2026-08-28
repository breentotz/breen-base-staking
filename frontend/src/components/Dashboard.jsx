import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { getContracts } from "../utils/contract";

import {
  VAULT_ADDRESS,
  ACTIVE_CHAIN_ID,
  BUILDER_NFT_ADDRESS,
} from "../contracts/addresses";

import {
  getBuilderSummary,
  getVerifiedBuilderLevel,
  getVerifiedBuilderTier,
  getNextLevelRequirementStatus,
} from "../services/builderEngine";

import { BrowserProvider, Contract } from "ethers";
import { formatTokenAmount } from "../utils/format";
import AnalyticsCard from "./AnalyticsCard";
import "./Dashboard.css";
import {
  verifyCounterDeployment,
} from "../services/deploymentProof";

import {
  processVerifiedDeployment,
} from "../services/deploymentMilestone";

import {
  ChartNoAxesCombined,
  Star,
  Landmark,
  Image,
  ScrollText,
  Bot,
  Zap,
  UserRound,
  Medal,
  Trophy,
  Flame,
  Sparkles,
  Crown,
  Flag,
  Coins,
  ChartPie,
  WalletCards,
  LockKeyhole,
  Layers3,
  Settings as SettingsIcon,
  ArrowUpRight,
} from "lucide-react";

export default function Dashboard({
   wallet,
   activities,
  onOpenToken,
  onOpenStaking,
  onOpenNFTs,
  onOpenPortfolio,
}) {
  const [tokenBalance, setTokenBalance] = useState("0");
  const [vaultBalance, setVaultBalance] = useState("0");
  const [totalDeposits, setTotalDeposits] = useState("0");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const summary = getBuilderSummary(wallet);
  const verifiedLevel =
  getVerifiedBuilderLevel(wallet);

const verifiedTier =
  getVerifiedBuilderTier(wallet);

const nextLevelData =
  getNextLevelRequirementStatus(wallet);

const nextRequirementStatus =
  nextLevelData?.status;
  const [nftCount, setNftCount] = useState(0);
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [genesisNftCount, setGenesisNftCount] =
  useState(0);

const [builderNftCount, setBuilderNftCount] =
  useState(0);
  const builderScore = Math.min(
  100,
  20 +
    Number(summary.reputation || 0) * 0.4 +
    Number(summary.achievementProgress.completed || 0) * 5 +
    Number(nftCount || 0) * 3 +
    Number(activities?.length || 0) * 2
);
const roundedBuilderScore = Math.round(builderScore);
  const builderScoreLabel =
  roundedBuilderScore >= 90
    ? "Elite Builder"
    : roundedBuilderScore >= 75
      ? "Trusted Builder"
      : roundedBuilderScore >= 50
        ? "Active Builder"
        : "New Builder";

   const builderScoreStatus =
  roundedBuilderScore >= 90
    ? "Top Builder Score"
    : roundedBuilderScore >= 75
    ? `${90 - roundedBuilderScore} points to Elite Builder`
    : roundedBuilderScore >= 50
    ? `${75 - roundedBuilderScore} points to Trusted Builder`
    : `${50 - roundedBuilderScore} points to Active Builder`;    

  async function loadData() {
    try {
      setLoading(true);

      const { signer, token, vault } = await getContracts();

      const address = await signer.getAddress();

      const tokenBal = await token.balanceOf(address);
      const vaultBal = await vault.getMyBalance();
      const total = await vault.totalStaked();

      console.log("Wallet:", address);
      console.log("Token:", formatEther(tokenBal));
      console.log("Vault:", formatEther(vaultBal));
      console.log("Total:", formatEther(total));

      setTokenBalance(formatEther(tokenBal));
      setVaultBalance(formatEther(vaultBal));
      setTotalDeposits(formatEther(total));
   } catch (err) {
  console.error("Dashboard Error:", err);

  setTokenBalance("0");
  setVaultBalance("0");
  setTotalDeposits("0");
} finally {
  setLoading(false);
}
  }


  async function loadNFTCount() {
  if (!wallet || !window.ethereum) {
  setGenesisNftCount(0);
  setBuilderNftCount(0);
  setNftCount(0);
  return;
}

  try {
    const provider =
      new BrowserProvider(window.ethereum);

    // Genesis NFT contract
    const genesisContract =
      new Contract(
        "0x356f5183D56787272d4d146d6a29aB1aae866161",
        [
          "function nextTokenId() view returns (uint256)",
          "function ownerOf(uint256 tokenId) view returns (address)",
        ],
        provider
      );

    const totalGenesisMinted =
      Number(
        await genesisContract.nextTokenId()
      );

    let genesisOwned = 0;

    for (
      let i = 0;
      i < totalGenesisMinted;
      i++
    ) {
      try {
        const owner =
          await genesisContract.ownerOf(i);

        if (
          owner.toLowerCase() ===
          wallet.toLowerCase()
        ) {
          genesisOwned += 1;
        }
      } catch (err) {
        console.warn(
          `Unable to read Genesis NFT #${i}`,
          err
        );
      }
    }

    // Builder NFT contract
    const builderContract =
      new Contract(
        BUILDER_NFT_ADDRESS,
        [
          "function hasMinted(address) view returns (bool)",
        ],
        provider
      );

    const ownsBuilderNFT =
      await builderContract.hasMinted(wallet);

    const builderOwned =
      ownsBuilderNFT ? 1 : 0;

    // Genesis NFTs + Builder NFT
    const totalOwnedNFTs =
  genesisOwned + builderOwned;

setGenesisNftCount(genesisOwned);
setBuilderNftCount(builderOwned);
setNftCount(totalOwnedNFTs);

    console.log(
      "🖼️ Breen NFT Analytics:",
      {
        genesisOwned,
        builderOwned,
        totalOwnedNFTs,
      }
    );
  } catch (err) {
    console.error(
      "Dashboard NFT count error:",
      err
    );

    setGenesisNftCount(0);
setBuilderNftCount(0);
setNftCount(0);
  }
}


  useEffect(() => {
  if (!window.ethereum) return;

  async function checkNetwork() {
    try {
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      const chainId = parseInt(chainIdHex, 16);
      const isWrong = chainId !== ACTIVE_CHAIN_ID;

      setWrongNetwork(isWrong);

      if (isWrong) {
        setTokenBalance("0");
        setVaultBalance("0");
        setTotalDeposits("0");
        setGenesisNftCount(0);
setBuilderNftCount(0);
setNftCount(0);
        return;
      }

      if (wallet) {
        await loadData();
        await loadNFTCount();
      }
    } catch (err) {
      console.error("Dashboard network check error:", err);
    }
  }

  function handleChainChanged(chainIdHex) {
    const chainId = parseInt(chainIdHex, 16);
    const isWrong = chainId !== ACTIVE_CHAIN_ID;

    setWrongNetwork(isWrong);

    if (isWrong) {
      setTokenBalance("0");
      setVaultBalance("0");
      setTotalDeposits("0");
      setGenesisNftCount(0);
setBuilderNftCount(0);
setNftCount(0);
    } else if (wallet) {
      loadData();
      loadNFTCount();
    }
  }

  checkNetwork();

  window.ethereum.on(
    "chainChanged",
    handleChainChanged
  );

  return () => {
    window.ethereum.removeListener(
      "chainChanged",
      handleChainChanged
    );
  };
}, [wallet]);

  async function approveTokens() {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid BREEN amount.");
      return;
    }

    try {
      const { token } = await getContracts();

      const tx = await token.approve(
        VAULT_ADDRESS,
        parseEther(amount)
      );

      await tx.wait();

      alert("Approval successful!");
    } catch (err) {
      console.error("Approval Error:", err);
      alert(err.shortMessage || err.message);
    }
  }

  async function depositTokens() {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid BREEN amount.");
      return;
    }

    try {
      const { vault } = await getContracts();

      const tx = await vault.deposit(
        parseEther(amount)
      );

      await tx.wait();

      alert("Deposit successful!");

      setAmount("");

      await loadData();
    } catch (err) {
      console.error("Deposit Error:", err);
      alert(err.shortMessage || err.message);
    }
  }


  useEffect(() => {
  if (!wallet) {
    return;
  }

  async function testVerifiedDeploymentMilestone() {
    const result =
      await processVerifiedDeployment(
  wallet,
  "/deployments/breen-token-vault-latest.json",
  "breen-token-vault"
);

    console.log(
      "VERIFIED_DEPLOYMENT_MILESTONE",
      result
    );
  }

  testVerifiedDeploymentMilestone();
}, [wallet]);

  return (
    <div className="page-layout dashboard">
      <div className="dashboard-title">
        <h2>Wallet Overview</h2>

        <p>
          Your BREEN Token and staking information.
        </p>
      </div>

      {wrongNetwork && (
  <div className="network-warning">
    ⚠️ Wrong Network — switch MetaMask to Base Sepolia to load BREEN dashboard data.
  </div>
)}

      <div className="dashboard-hero">

  <div className="dashboard-hero-heading">
    <div className="dashboard-hero-icon">
      <Sparkles size={25} strokeWidth={1.8} />
    </div>

    <div>
      <h1>
        Welcome back, {summary.name}
      </h1>

      <p>
        Continue your Builder Journey on Base.
      </p>
    </div>
  </div>

       
       <div className="dashboard-summary">

  <div className="summary-card">
    <span className="summary-card-label">
      <UserRound size={17} />
      Level
    </span>

    <h2>{verifiedLevel}</h2>
  </div>


  <div className="summary-card">
    <span className="summary-card-label">
      <Medal size={17} />
      Reputation
    </span>

    <h2>{summary.reputation}</h2>
  </div>


  <div className="summary-card">
    <span className="summary-card-label">
      <Trophy size={17} />
      Achievements
    </span>

    <h2>
      {summary.achievementProgress.completed}
      /
      {summary.achievementProgress.total}
    </h2>
  </div>


  <div className="summary-card">
    <span className="summary-card-label">
      <Flame size={17} />
      Streak
    </span>

    <h2>{summary.streak.current}</h2>

    <small>Days</small>
  </div>

</div>
</div>


<div className="dashboard-feature-grid">

  <div className="latest-event-card">

    <div className="dashboard-feature-label">
      <div className="dashboard-feature-icon">
        <ScrollText size={18} strokeWidth={1.8} />
      </div>

      <span>Latest Event</span>
    </div>

    {summary.latestEvent ? (
      <>
        <h3>{summary.latestEvent.title}</h3>

        <p>{summary.latestEvent.description}</p>

        <small>{summary.latestEvent.date}</small>
      </>
    ) : (
      <>
        <h3>No activity yet</h3>

        <p>
          Complete your first Breen Web3 action
          to begin your Builder journey.
        </p>

        <small>Ready when you are.</small>
      </>
    )}

  </div>


  <div className="dashboard-coach">

    <div className="dashboard-feature-label">
      <div className="dashboard-feature-icon">
        <Bot size={18} strokeWidth={1.8} />
      </div>

      <span>Today&apos;s Builder Advice</span>
    </div>

    <h3>{summary.recommendation}</h3>

    <p>
      You have completed{" "}
      {summary.achievementProgress.completed} of{" "}
      {summary.achievementProgress.total} achievements.
    </p>

    <strong>
      Estimated Reward: +{summary.recommendationReward} XP
    </strong>

  </div>

</div>


<div className="summary-card streak-summary-card">

  {/* LEFT — CURRENT STREAK */}
  <div className="streak-main">
    <div className="streak-card-heading">
      <Flame size={18} strokeWidth={1.8} />
      <span>Builder Streak</span>
    </div>

    <div className="streak-current">
      {summary.streak.current}{" "}
      {summary.streak.current === 1 ? "Day" : "Days"}
    </div>

    <strong className="streak-status">
      🌱 {summary.streakStatus}
    </strong>

    <small className="streak-longest">
      Longest: {summary.streak.longest}{" "}
      {summary.streak.longest === 1 ? "Day" : "Days"}
    </small>

<div className="journey-xp-progress">

  <div className="journey-xp-header">

    <span>
      Level {verifiedLevel} Progress
    </span>

    <strong>
      {nextRequirementStatus
        ? `${nextRequirementStatus.completedRequirements} / ${nextRequirementStatus.totalRequirements}`
        : "Complete"}
    </strong>

  </div>

  <div className="journey-xp-track">

    <div
      className="journey-xp-fill"
      style={{
        width: `${
          nextRequirementStatus
            ? Math.min(
                (
                  nextRequirementStatus.completedRequirements /
                  nextRequirementStatus.totalRequirements
                ) * 100,
                100
              )
            : 100
        }%`,
      }}
    />

  </div>

  <small>
    {nextRequirementStatus
      ? `${nextRequirementStatus.completedRequirements} of ${nextRequirementStatus.totalRequirements} requirements completed`
      : "Current level requirements completed"}
  </small>

</div>

  </div>


  {/* CENTER — NEXT MILESTONE */}
  <div className="streak-center">

    <div className="streak-milestone">

{summary.completedStreakMilestones?.length > 0 && (
  <div className="completed-streak-milestone">

    <div className="completed-milestone-label">
      ✓ Completed Milestone
    </div>

    {(() => {
      const completed =
        summary.completedStreakMilestones[
          summary.completedStreakMilestones.length - 1
        ];





      return (
        <>
          <strong className="completed-milestone-title">
            {completed.title} ✓
          </strong>

          <span className="completed-milestone-detail">
            {completed.days}-Day Builder Streak
          </span>

          <span className="completed-milestone-reward">
            +{completed.xp} XP earned
          </span>
        </>
      );
    })()}

  </div>
)}

      {summary.streakMilestone.complete ? (
        <>
          <div className="streak-milestone-label">
            <Crown size={17} strokeWidth={1.8} />
            <span>Streak Milestone</span>
          </div>

          <strong>
            {summary.streakMilestone.title}
          </strong>

          <small>
            Milestone journey complete
          </small>
        </>
      ) : (
        <>
          <div className="streak-milestone-label">
            <Flag size={17} strokeWidth={1.8} />
            <span>Next Milestone</span>
          </div>

          <strong>
  {summary.streakMilestone.title}
</strong>

          <small>
            {summary.streak.current} /{" "}
            {summary.streakMilestone.days} Days
          </small>
        </>
      )}
    </div>

    <p className="streak-message">
      {summary.streakMessage}
    </p>

  </div>


  {/* RIGHT — WEEKLY ACTIVITY */}
  <div className="streak-week">

    <span className="streak-week-title">
      Weekly Activity
    </span>

    <div className="streak-week-inline">
      {summary.streak.weekly.map((active, index) => (
        <span
          key={index}
          className={
            active
              ? "streak-inline-day active"
              : "streak-inline-day"
          }
        >
          <Flame
            size={15}
            strokeWidth={active ? 2.2 : 1.5}
          />
        </span>
      ))}
    </div>

  </div>

</div>

     {loading ? (
  <p className="loading">
    Loading blockchain data...
  </p>
) : (
  <>

    <div className="wallet-snapshot">

      <div className="wallet-snapshot-header">
        <WalletCards size={18} strokeWidth={1.8} />
        <span>Wallet Snapshot</span>
      </div>

      <div className="wallet-snapshot-grid">

        <div className="wallet-snapshot-item">
          <span>BREEN Balance</span>

          <strong>
            {formatTokenAmount(tokenBalance)}
          </strong>

          <small>BREEN</small>
        </div>

        <div className="wallet-snapshot-item">
          <span>Staked</span>

          <strong>
            {formatTokenAmount(vaultBalance)}
          </strong>

          <small>BREEN</small>
        </div>

        <div className="wallet-snapshot-item">
          <span>NFTs</span>

          <strong>
            {nftCount}
          </strong>

          <small>Owned</small>
        </div>

        <div className="wallet-snapshot-item">
          <span>Actions</span>

          <strong>
            {activities?.length || 0}
          </strong>

          <small>Recorded</small>
        </div>

      </div>

    </div>

<div className="quick-actions">

  <h3 className="dashboard-section-title">
    <Zap size={18} />
    <span>Quick Actions</span>
  </h3>

  <div className="quick-actions-grid">

    <button
      className="quick-action-card premium-quick-action"
      onClick={onOpenToken}
    >
      <span className="quick-action-icon">
        <Coins size={24} />
      </span>

      <div>
        <strong>BREEN Token</strong>

        <small>
          {formatTokenAmount(tokenBalance)} BREEN
        </small>
      </div>

      <span className="quick-action-arrow">
        <ArrowUpRight size={18} />
      </span>
    </button>


    <button
      className="quick-action-card premium-quick-action"
      onClick={onOpenStaking}
    >
      <span className="quick-action-icon">
        <Landmark size={24} />
      </span>

      <div>
        <strong>Staking</strong>

        <small>
          {formatTokenAmount(vaultBalance)} BREEN staked
        </small>
      </div>

      <span className="quick-action-arrow">
        <ArrowUpRight size={18} />
      </span>
    </button>


    <button
      className="quick-action-card premium-quick-action"
      onClick={onOpenNFTs}
    >
      <span className="quick-action-icon">
        <Image size={24} />
      </span>

      <div>
        <strong>NFTs</strong>

        <small>
          {nftCount} NFT{nftCount === 1 ? "" : "s"} Owned
        </small>
      </div>

      <span className="quick-action-arrow">
        <ArrowUpRight size={18} />
      </span>
    </button>


    <button
      className="quick-action-card premium-quick-action"
      onClick={onOpenPortfolio}
    >
      <span className="quick-action-icon">
        <ChartPie size={24} />
      </span>

      <div>
        <strong>Portfolio</strong>

        <small>
          Track your onchain assets
        </small>
      </div>

      <span className="quick-action-arrow">
        <ArrowUpRight size={18} />
      </span>
    </button>

  </div>

</div>
        </>
      )}
    </div>
  );
}