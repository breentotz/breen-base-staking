import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { getContracts } from "../utils/contract";
import { VAULT_ADDRESS } from "../contracts/addresses";
import { getBuilderSummary } from "../services/builderEngine";
import { BrowserProvider, Contract } from "ethers";
import { formatTokenAmount } from "../utils/format";
import AnalyticsCard from "./AnalyticsCard";
import BuilderProgress from "./BuilderProgress";

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
  const summary = getBuilderSummary();
  const [nftCount, setNftCount] = useState(0);
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

   const nextBuilderRank =
  roundedBuilderScore >= 90
    ? "Maximum rank reached"
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
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }


async function loadNFTCount() {
  try {
    const provider = new BrowserProvider(window.ethereum);

    const nftContract = new Contract(
      "0x356f5183D56787272d4d146d6a29aB1aae866161",
      [
        "function nextTokenId() view returns (uint256)",
        "function ownerOf(uint256 tokenId) view returns (address)",
      ],
      provider
    );

    const totalMinted = Number(
      await nftContract.nextTokenId()
    );

    let ownedCount = 0;

    for (let i = 0; i < totalMinted; i++) {
      const owner = await nftContract.ownerOf(i);

      if (
        owner.toLowerCase() ===
        wallet.toLowerCase()
      ) {
        ownedCount += 1;
      }
    }

    setNftCount(ownedCount);
  } catch (err) {
    console.error("Dashboard NFT count error:", err);
    setNftCount(0);
  }
}

  useEffect(() => {
  if (wallet) {
    loadData();
    loadNFTCount();
  }
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

  return (
    <div className="page-layout dashboard">
      <div className="dashboard-title">
        <h2>Wallet Overview</h2>

        <p>
          Your BREEN Token and staking information.
        </p>
      </div>

      <div className="dashboard-hero">

         <h1>
    👋 Welcome back, {summary.name}
  </h1>

  <p>
    Continue your Builder Journey on Base.
  </p>

       <div className="dashboard-summary">
  <div className="summary-card">
    <span>👤 Level</span>
    <h2>{summary.level}</h2>
  </div>

  <div className="summary-card">
    <span>🏅 Reputation</span>
    <h2>{summary.reputation}</h2>
  </div>

  <div className="summary-card">
    <span>🏆 Achievements</span>

    <h2>
      {summary.achievementProgress.completed}
      /
      {summary.achievementProgress.total}
    </h2>
  </div>

  <div className="summary-card">
    <span>🔥 Streak</span>

    <h2>{summary.streak.current}</h2>

    <small>Days</small>
  </div>
</div>

<div className="builder-analytics">
  <h3>📊 Builder Analytics</h3>

  <div className="analytics-grid">

  <AnalyticsCard
    title="Builder XP"
    value={`${summary.xp} XP`}
    icon="⭐"
    color="#FFD54F"
  />

  <AnalyticsCard
    title="Total Staked"
    value={`${formatTokenAmount(vaultBalance)} BREEN`}
    icon="🏦"
    color="#4CAF50"
  />

  <AnalyticsCard
    title="NFTs"
    value={nftCount}
    icon="🖼️"
    color="#AB47BC"
  />

  <AnalyticsCard
  title="Recent Actions"
  value={activities?.length || 0}
  icon="📜"
  color="#38BDF8"
/>

<AnalyticsCard
  title={builderScoreLabel}
  value={`${roundedBuilderScore}/100`}
  subtitle={nextBuilderRank}
  icon="⚡"
  color="#22C55E"
  progress={roundedBuilderScore}
/>

</div>
</div>

<BuilderProgress
  level={summary.level}
  xp={summary.xp}
  nextLevelXP={2000}
/>


<div className="dashboard-feature-grid">
  <div className="latest-event-card">
    <span>📜 Latest Event</span>

    <h3>{summary.latestEvent.title}</h3>

    <p>{summary.latestEvent.description}</p>

    <small>{summary.latestEvent.date}</small>
  </div>

  <div className="dashboard-coach">
    <span>🤖 Today’s Builder Advice</span>

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
  <span>🔥 Builder Streak</span>

  <h2>
    {summary.streak.current} Days
  </h2>

  <strong>
  {summary.streakStatus}
  </strong>

  <small>
    Longest: {summary.streak.longest} Days
  </small>

  <p>
  Weekly Activity
  </p>

  <div className="streak-week-inline">

   {summary.streak.weekly[0] ? "🔥" : "•"}

  {summary.streak.weekly[1] ? "🔥" : "•"}

  {summary.streak.weekly[2] ? "🔥" : "•"}

  {summary.streak.weekly[3] ? "🔥" : "•"}

  {summary.streak.weekly[4] ? "🔥" : "•"}

  {summary.streak.weekly[5] ? "🔥" : "•"}

  {summary.streak.weekly[6] ? "🔥" : "•"}

</div>

</div>


<div className="streak-week">
  {summary.streak.weekly.map((active, index) => (
    <div
      key={index}
      className={
        active
          ? "streak-day active"
          : "streak-day"
      }
      title={
        active
          ? "Builder activity completed"
          : "No builder activity"
      }
    >
      {active ? "🔥" : "•"}
    </div>
  ))}
</div>

</div>

      {loading ? (
        <p className="loading">
          Loading blockchain data...
        </p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>BREEN Balance</span>

              <h3>{formatTokenAmount(tokenBalance)}</h3>

              <small>BREEN</small>
            </div>

            <div className="stat-card">
              <span>My Staked Balance</span>

              <h3>{formatTokenAmount(vaultBalance)}</h3>

              <small>BREEN</small>
            </div>

            <div className="stat-card">
              <span>Total Staked</span>

              <h3>{formatTokenAmount(totalDeposits)}</h3>

              <small>BREEN</small>
            </div>
          </div>

<div className="quick-actions">

  <h3>⚡ Quick Actions</h3>

  <div className="quick-actions-grid">

  <button
    className="quick-action-card"
    onClick={onOpenToken}
  >
    <span className="quick-action-icon">🪙</span>

    <div>
      <strong>BREEN Token</strong>
    <small>{formatTokenAmount(tokenBalance)} BREEN</small>
    </div>

    <span className="quick-action-arrow">→</span>
  </button>

  <button
    className="quick-action-card"
    onClick={onOpenStaking}
  >
    <span className="quick-action-icon">🏦</span>

    <div>
      <strong>Staking</strong>
      <small>{formatTokenAmount(vaultBalance)} BREEN staked</small>
    </div>

    <span className="quick-action-arrow">→</span>
  </button>

  <button
    className="quick-action-card"
    onClick={onOpenNFTs}
  >
    <span className="quick-action-icon">🖼️</span>

    <div>
      <strong>NFTs</strong>
      <small>
  {nftCount} Genesis NFT{nftCount === 1 ? "" : "s"}
</small>
    </div>

    <span className="quick-action-arrow">→</span>
  </button>

  <button
    className="quick-action-card"
    onClick={onOpenPortfolio}
  >
    <span className="quick-action-icon">📈</span>

    <div>
      <strong>Portfolio</strong>
      <small>Track your onchain assets</small>
    </div>

    <span className="quick-action-arrow">→</span>
  </button>

</div>

  </div>

          <div className="staking-summary-card">
  <div>
    <span>🏦 Staking Summary</span>

    <h3>{formatTokenAmount(vaultBalance)} BREEN Staked</h3>

    <p>Vault status: Active</p>
  </div>

  <button onClick={onOpenStaking}>
  Open Staking
</button>

</div>
        </>
      )}
    </div>
  );
}