import { useEffect, useState } from "react";
import { formatEther } from "ethers";
import { getContracts } from "../utils/contract";
import { getNFTContract } from "../utils/nftContract";

function BreenAI({
  wallet,
  showNotification,
}) {
  const [message, setMessage] = useState("");
  const [dailyInsight, setDailyInsight] = useState("");

  const [snapshotData, setSnapshotData] =
  useState(null);

  const [builderLevel, setBuilderLevel] =
  useState(1);

  const [builderProgress, setBuilderProgress] =
  useState(0);

  const [achievementCount, setAchievementCount] =
  useState(0);

  const [nextGoal, setNextGoal] =
  useState("");

  const [missions, setMissions] =
  useState([]);
  const [coachMessage, setCoachMessage] =
  useState("");

  const [builderXP, setBuilderXP] =
  useState(0);

  const [builderScore, setBuilderScore] = useState(0);
  const [builderRankLabel, setBuilderRankLabel] =
  useState("🌱 New Builder");

  const [nextLevelXP, setNextLevelXP] =
  useState(1500);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I am Breen AI. I can help you explore your Breen Web3 Dashboard.",
    },
  ]);

  async function getWalletData() {
    try {
      const { signer, token, vault } =
        await getContracts();

      const address =
        await signer.getAddress();

      const tokenBalance =
        await token.balanceOf(address);

      const stakedBalance =
        await vault.getMyBalance();

        const nftContract =
  await getNFTContract();

const totalMinted =
  Number(
    await nftContract.nextTokenId()
  );

let nftCount = 0;

for (
  let tokenId = 0;
  tokenId < totalMinted;
  tokenId++
) {
  const owner =
    await nftContract.ownerOf(
      tokenId
    );

  if (
    owner.toLowerCase() ===
    address.toLowerCase()
  ) {
    nftCount++;
  }
}

      return {
  address,
  tokenBalance:
    formatEther(tokenBalance),
  stakedBalance:
    formatEther(stakedBalance),
  totalBreenHoldings: (
    Number(formatEther(tokenBalance)) +
    Number(formatEther(stakedBalance))
  ).toString(),
  stakingRatio: (
  (
    Number(formatEther(stakedBalance)) /
    (
      Number(formatEther(tokenBalance)) +
      Number(formatEther(stakedBalance))
    )
  ) * 100
).toFixed(2),
builderProgress:
  Number(formatEther(tokenBalance)) > 0 &&
  Number(formatEther(stakedBalance)) > 0 &&
  nftCount > 0
    ? 100
    : 0,

builderRank:
  builderScore >= 95
    ? "👑 Legendary Builder"
    : builderScore >= 75
    ? "💎 Elite Builder"
    : builderScore >= 50
    ? "🚀 Base Builder"
    : builderScore >= 25
    ? "⚡ Active Builder"
    : "🌱 New Builder",
  nftCount,
};
    } catch (error) {
      console.error(
        "Breen AI blockchain error:",
        error
      );

      return null;
    }
  }

  async function sendMessage(customMessage = "") {
    const userMessage =
  customMessage || message.trim();

    if (!userMessage) {
      return;
    }

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        text: userMessage,
      },
    ];

    setMessages(updatedMessages);
    setMessage("");

    const question =
      userMessage.toLowerCase();

      if (!dailyInsight) {
  const data = await getWalletData();

  if (data) {
    const insight =
  `🏆 ${data.builderRank}

📈 Staking Ratio: ${data.stakingRatio}%

🖼️ NFTs: ${data.nftCount}

💙 Keep building on Base!`;

    setDailyInsight(insight);
    setSnapshotData(data);
    setMissions([
  {
    title: "Connect Wallet",
    completed: Boolean(data.address),
  },
  {
    title: "Hold BREEN",
    completed: Number(data.tokenBalance) > 0,
  },
  {
    title: "Stake BREEN",
    completed: Number(data.stakedBalance) > 0,
  },
  {
    title: "Own a Genesis NFT",
    completed: Number(data.nftCount) > 0,
  },
  {
    title: "Reach Top Staker",
    completed: Number(data.stakedBalance) >= 100,
  },
  {
    title: "Reach Whale Holder",
    completed: Number(data.tokenBalance) >= 500000,
  },
]);
    let achievements = 0;

if (data.address) achievements++;

if (Number(data.stakedBalance) > 0)
  achievements++;

if (Number(data.nftCount) > 0)
  achievements++;

if (Number(data.stakedBalance) >= 100)
  achievements++;

if (Number(data.tokenBalance) >= 500000)
  achievements++;

if (
  Number(data.tokenBalance) > 0 &&
  Number(data.stakedBalance) > 0 &&
  Number(data.nftCount) > 0
) {
  achievements++;
}

setAchievementCount(
  achievements
);

const xp =
  (data.address ? 50 : 0) +
  (Number(data.tokenBalance) > 0 ? 100 : 0) +
  (Number(data.stakedBalance) > 0 ? 200 : 0) +
  (Number(data.nftCount) > 0 ? 150 : 0) +
  (Number(data.stakedBalance) >= 100 ? 250 : 0) +
  (Number(data.tokenBalance) >= 500000 ? 250 : 0) +
  (
    Number(data.tokenBalance) > 0 &&
    Number(data.stakedBalance) > 0 &&
    Number(data.nftCount) > 0
      ? 500
      : 0
  );

setBuilderXP(xp);

const calculatedBuilderScore = Math.round(
  Math.min(
    100,
    20 +
      achievements * 8 +
      Number(data.nftCount) * 3 +
      (Number(data.stakedBalance) > 0 ? 10 : 0)
  )
);

setBuilderScore(calculatedBuilderScore);

const rankLabel =
  calculatedBuilderScore >= 95
    ? "👑 Legendary Builder"
    : calculatedBuilderScore >= 75
      ? "💎 Elite Builder"
      : calculatedBuilderScore >= 50
        ? "🚀 Base Builder"
        : calculatedBuilderScore >= 25
          ? "⚡ Active Builder"
          : "🌱 New Builder";

setBuilderRankLabel(rankLabel);

const calculatedLevel =
  Math.min(
    5,
    Math.floor(xp / 250) + 1
  );

setBuilderLevel(calculatedLevel);

console.log("Builder Score:", calculatedBuilderScore);
console.log("Builder Level:", calculatedLevel);

const maxXP =
  (calculatedLevel + 1) * 250;

setNextLevelXP(maxXP);

setBuilderProgress(
  Math.round(
    (achievements / 6) * 100
  )
);
let coachText = "";

if (achievements === 6) {
  coachText =
    "You have completed every current Builder achievement. Your next milestone is starting your Base Mainnet journey.";
} else if (Number(data.stakedBalance) === 0) {
  coachText =
    "Your wallet holds BREEN, but you have not started staking yet. Stake your first BREEN to unlock more Builder progress.";
} else if (Number(data.nftCount) === 0) {
  coachText =
    "Your staking journey has started. Mint a Breen Genesis NFT to strengthen your Builder profile.";
} else {
  coachText =
    "Your Builder profile is progressing well. Continue completing missions and expanding your onchain activity.";
}

setCoachMessage(coachText);
if (achievements === 6) {
  setNextGoal(
    "Deploy or connect your first Base Mainnet feature."
  );
} else if (Number(data.stakedBalance) < 100) {
  setNextGoal(
    "Stake at least 100 BREEN to unlock Top Staker."
  );
} else if (Number(data.nftCount) === 0) {
  setNextGoal(
    "Mint your first Breen Genesis NFT."
  );
} else if (Number(data.tokenBalance) < 500000) {
  setNextGoal(
    "Hold at least 500,000 BREEN to unlock Whale Holder."
  );
} else {
  setNextGoal(
    "Complete the remaining Builder achievements."
  );
}
  }
}

    let reply;

if (
  question.includes("how am i doing") ||
  question.includes("dashboard summary") ||
  question.includes("my dashboard") ||
  question.includes("overall status")
) {
  const data = await getWalletData();

  if (data) {
    const walletStatus =
      Number(data.stakedBalance) > 0
        ? "🟢 Staking Active"
        : Number(data.tokenBalance) > 0
          ? "🟢 Active"
          : "⚪ Empty Wallet";

    reply =
      `📊 Dashboard Summary

🪙 Total Holdings: ${data.totalBreenHoldings} BREEN
💰 Available: ${data.tokenBalance} BREEN
🏦 Staked: ${data.stakedBalance} BREEN
📈 Staking Ratio: ${data.stakingRatio}%
🖼️ NFTs: ${data.nftCount}
🟢 Wallet Status: ${walletStatus}`;
  } else {
    reply =
      "I could not load your dashboard summary. Please check that MetaMask is connected to Base Sepolia.";
  }


} else if (
  question.includes("builder level") ||
  question.includes("my level")
) {
  const data = await getWalletData();

  if (data) {
    const xp =
      (data.address ? 50 : 0) +
      (Number(data.tokenBalance) > 0 ? 100 : 0) +
      (Number(data.stakedBalance) > 0 ? 200 : 0) +
      (Number(data.nftCount) > 0 ? 150 : 0) +
      (Number(data.stakedBalance) >= 100 ? 250 : 0) +
      (Number(data.tokenBalance) >= 500000 ? 250 : 0) +
      (
        Number(data.tokenBalance) > 0 &&
        Number(data.stakedBalance) > 0 &&
        Number(data.nftCount) > 0
          ? 500
          : 0
      );

    const level = Math.min(
      5,
      Math.floor(xp / 250) + 1
    );

    const achievementsNow =
  (data.address ? 1 : 0) +
  (Number(data.stakedBalance) > 0 ? 1 : 0) +
  (Number(data.nftCount) > 0 ? 1 : 0) +
  (Number(data.stakedBalance) >= 100 ? 1 : 0) +
  (Number(data.tokenBalance) >= 500000 ? 1 : 0) +
  (
    Number(data.tokenBalance) > 0 &&
    Number(data.stakedBalance) > 0 &&
    Number(data.nftCount) > 0
      ? 1
      : 0
  );

const scoreNow = Math.round(
  Math.min(
    100,
    20 +
      achievementsNow * 8 +
      Number(data.nftCount) * 3 +
      (Number(data.stakedBalance) > 0 ? 10 : 0)
  )
);

    reply =
      `⭐ Your current Builder Level is ${level}.

⚡ Builder XP: ${xp}
💎 Rank: ${
  scoreNow >= 95
    ? "👑 Legendary Builder"
    : scoreNow >= 75
      ? "💎 Elite Builder"
      : scoreNow >= 50
        ? "🚀 Base Builder"
        : scoreNow >= 25
          ? "⚡ Active Builder"
          : "🌱 New Builder"
}

Keep completing Builder achievements and onchain activity to strengthen your profile.`;
  } else {
    reply =
      "I could not load your Builder Level. Please check that your wallet is connected.";
  }

  } else if (
  question.includes("improve my builder score") ||
  question.includes("improve builder score") ||
  question.includes("builder score")
) {
  const data = await getWalletData();

  if (data) {
    let achievementsNow = 0;

if (data.address) achievementsNow++;
if (Number(data.stakedBalance) > 0) achievementsNow++;
if (Number(data.nftCount) > 0) achievementsNow++;
if (Number(data.stakedBalance) >= 100) achievementsNow++;
if (Number(data.tokenBalance) >= 500000) achievementsNow++;

if (
  Number(data.tokenBalance) > 0 &&
  Number(data.stakedBalance) > 0 &&
  Number(data.nftCount) > 0
) {
  achievementsNow++;
}

const scoreNow = Math.round(
  Math.min(
    100,
    20 +
      achievementsNow * 8 +
      Number(data.nftCount) * 3 +
      (Number(data.stakedBalance) > 0 ? 10 : 0)
  )
);
   reply =
  `⚡ Your current Builder Score is ${scoreNow}/100.

💎 You are currently an Elite Builder.

Your current Builder achievements are complete.

🚀 Next path:
• Start building on Base Mainnet
• Deploy or connect a Mainnet feature
• Continue real onchain activity
• Keep improving Breen Web3

You are 8 points away from Legendary Builder.`;
  } else {
    reply =
      "I could not load your Builder Score. Please check that your wallet is connected.";
  }

} else if (
  question.includes("next achievement") ||
  question.includes("my next achievement") ||
  question.includes("what achievement should i complete next")
) {
  const data = await getWalletData();

  if (data) {
    let achievementsNow = 0;

    if (data.address) achievementsNow++;
    if (Number(data.stakedBalance) > 0) achievementsNow++;
    if (Number(data.nftCount) > 0) achievementsNow++;
    if (Number(data.stakedBalance) >= 100) achievementsNow++;
    if (Number(data.tokenBalance) >= 500000) achievementsNow++;

    if (
      Number(data.tokenBalance) > 0 &&
      Number(data.stakedBalance) > 0 &&
      Number(data.nftCount) > 0
    ) {
      achievementsNow++;
    }

    if (achievementsNow >= 6) {
      reply =
        `🏆 Achievements: ${achievementsNow}/6

✅ All current achievements completed.

🔵 Next Milestone: Base Mainnet Builder

Deploy or connect your first Breen Web3 feature on Base Mainnet.`;

    } else if (Number(data.stakedBalance) === 0) {
      reply =
        `🏆 Next Achievement: First Staker

Stake your first BREEN.`;

    } else if (Number(data.nftCount) === 0) {
      reply =
        `🏆 Next Achievement: Genesis Holder

Mint your first Breen Genesis NFT.`;

    } else if (Number(data.stakedBalance) < 100) {
      reply =
        `🏆 Next Achievement: Top Staker

Reach at least 100 BREEN staked.`;

    } else if (Number(data.tokenBalance) < 500000) {
      reply =
        `🏆 Next Achievement: Whale Holder

Hold at least 500,000 BREEN.`;
    }

  } else {
    reply =
      "I could not load your achievements.";
  }

} else if (
  question.includes("portfolio") ||
  question.includes("portfolio summary") ||
  question.includes("summarize my portfolio")
) {
  const data = await getWalletData();

  if (data) {
    reply =
 reply =
  `Your Breen Web3 portfolio summary: you hold ${data.totalBreenHoldings} BREEN in total, with ${data.tokenBalance} BREEN available and ${data.stakedBalance} BREEN staked. You also own ${data.nftCount} Breen Genesis NFT${data.nftCount === 1 ? "" : "s"}.`;
  } else {
    reply =
      "I could not load your portfolio data. Please check that MetaMask is connected to Base Sepolia.";
  }
} else if (
  question.includes("what is breen") ||
  question.includes("breen token")
) {
      reply =
        "BREEN is the token used in the Breen Web3 project. You can view your balance and use BREEN in the staking section.";

        } else if (
  question.includes("what should i build next") ||
  question.includes("what should i do next") ||
  question.includes("how can i improve my profile") ||
  question.includes("builder recommendations") ||
  question.includes("recommendations")
) {
  const data = await getWalletData();

  if (data) {
    let suggestions = [];

    if (
  Number(data.stakedBalance) >= 100 &&
  Number(data.nftCount) > 0 &&
  Number(data.tokenBalance) >= 500000
) {
  suggestions.push("🌐 Your Base Sepolia foundation is complete.");
  suggestions.push("🚀 Start preparing Breen Web3 for Base Mainnet.");
  suggestions.push("🔗 Connect your first Mainnet feature.");
  suggestions.push("📊 Track real Mainnet activity.");
  suggestions.push("🏆 Expand your Builder reputation.");
} else {
  if (Number(data.stakedBalance) < 100) {
    suggestions.push("🏦 Reach at least 100 BREEN staked.");
  }

  if (Number(data.nftCount) === 0) {
    suggestions.push("🖼️ Mint your first Breen Genesis NFT.");
  }

  if (Number(data.tokenBalance) < 500000) {
    suggestions.push("🪙 Reach 500,000 BREEN.");
  }

  suggestions.push("💙 Continue completing your Base Sepolia milestones.");
}

    reply =
      `🚀 Builder Recommendations\n\n${suggestions.join("\n")}`;
  } else {
    reply =
      "I couldn't load your Builder Profile. Please check that MetaMask is connected.";
  }

      } else if (
  question.includes("builder rank") ||
  question.includes("my rank") ||
  question.includes("am i a base builder") ||
  question.includes("what is my builder rank")
) {
  const data = await getWalletData();

  if (data) {
    reply =
      reply =
  `💎 Builder Rank: ${builderRankLabel}

⭐ Level: ${builderLevel}
⚡ Builder Score: ${builderScore}/100
🏆 Achievements: ${achievementCount}/6
🎯 Next Goal: ${nextGoal || "Keep building on Base."}`;
  } else {
    reply =
      "I could not load your Builder Profile. Please check that MetaMask is connected to Base Sepolia.";
  }

      } else if (
  question.includes("staking ratio") ||
  question.includes("what percentage is staked") ||
  question.includes("percentage of my breen is staked")
) {
  const data = await getWalletData();

  if (data) {
    reply =
      `Your current staking ratio is ${data.stakingRatio}%. You have ${data.stakedBalance} BREEN staked out of ${data.totalBreenHoldings} BREEN in total.`;
  } else {
    reply =
      "I could not load your staking ratio. Please check that MetaMask is connected to Base Sepolia.";
  }

    } else if (
      question.includes("how much staked") ||
      question.includes("my staked") ||
      question.includes("staked balance") ||
      question.includes("how much breen do i have staked")
    ) {
      const data =
        await getWalletData();

      if (data) {
        reply =
          `You currently have ${data.stakedBalance} BREEN staked in the Breen Vault.`;
      } else {
        reply =
          "I could not load your staked balance. Please check that MetaMask is connected to Base Sepolia.";
      }
    } else if (
      question.includes("balance") ||
      question.includes("how much breen")
    ) {
      const data =
        await getWalletData();

      if (data) {
        reply =
          `Your current BREEN balance is ${data.tokenBalance} BREEN.`;
      } else {
        reply =
          "I could not load your BREEN balance. Please check that MetaMask is connected to Base Sepolia.";
      }
    } else if (
      question.includes("how do i stake") ||
      question.includes("how to stake")
    ) {
      reply =
        "Open the Staking page, enter the amount of BREEN you want to stake, click Approve, confirm the transaction in MetaMask, and then click Deposit.";
    } else if (
      question.includes("what is staking") ||
      question.includes("staking")
    ) {
      reply =
        "Staking means depositing BREEN tokens into the Breen Vault. In this dashboard, you first approve the amount and then deposit it.";
    } else if (
  question.includes("how many nft") ||
  question.includes("how many nfts") ||
  question.includes("my nft") ||
  question.includes("my nfts") ||
  question.includes("nft count")
) {
  const data = await getWalletData();

  if (data) {
    reply =
      `You currently own ${data.nftCount} Breen Genesis NFT${data.nftCount === 1 ? "" : "s"}.`;
  } else {
    reply =
      "I could not load your NFT collection. Please check that MetaMask is connected to Base Sepolia.";
  }
} else if (
  question.includes("what is nft") ||
  question.includes("what are nfts")
) {
  reply =
    "An NFT is a unique blockchain token. Your Breen Genesis NFTs are stored on Base Sepolia and can be viewed in the NFTs section.";
} else if (
      question.includes("wallet") ||
      question.includes("my address")
    ) {
      reply = wallet
        ? `Your connected wallet is ${wallet}.`
        : "No wallet is currently connected.";
    } else if (
      question.includes("hello") ||
      question.includes("hi")
    ) {
      reply =
        "Hello! 👋 I am Breen AI. Ask me about BREEN, staking, NFTs, your wallet, or the Breen Web3 Dashboard.";
    } else {
      reply =
        "I am currently running in Breen AI Local Mode. I can answer basic questions about BREEN, staking, NFTs, and your wallet. A real AI API will be added in a future phase.";
    }

    setMessages([
      ...updatedMessages,
      {
        role: "ai",
        text: reply,
      },
    ]);
  }


  function handleKeyDown(event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <div>
      <h2>🤖 Breen AI</h2>

      <p>
        Your future AI assistant for Web3,
        blockchain, and Breen tools.
      </p>

      <div className="ai-card">
        <div className="ai-header">
          <div>
            <h2>Breen AI Assistant</h2>

            <span>
              ● Local Blockchain Mode
            </span>
          </div>

          {wallet && (
            <small>
              {wallet.slice(0, 6)}
              ...
              {wallet.slice(-4)}
            </small>
          )}
        </div>
        <div className="ai-welcome-card">
  <div>
    <span className="ai-welcome-label">
      🤖 Builder Assistant
    </span>

    <h2>
      {wallet
        ? "Welcome back, Breen"
        : "Welcome to Breen AI"}
    </h2>

   <p>
  {wallet
    ? "Ready to continue building on Base today? 🚀"
    : "Connect your wallet to unlock your Builder profile."}
</p>

<div className="ai-builder-info">
  ⭐ Level {builderLevel} · ⚡ {builderScore}/100
  <br />
  {builderRankLabel}
</div>

  </div>

  <div className="ai-welcome-status">
    <span
      className={
        wallet
          ? "ai-status-dot connected"
          : "ai-status-dot"
      }
    />

    {wallet ? "Wallet Connected" : "Wallet Offline"}
  </div>
</div>

<div className="chat-input">
          <input
            type="text"
            placeholder="Ask Breen AI something..."
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
          />

          <button
  onClick={() => sendMessage()}
>
  Send
</button>
        </div>

        <div className="quick-actions">
 
<button
  onClick={() =>
    sendMessage("What is my Builder Level?")
  }
>
  ⭐ What is my Builder Level?
</button>

<button
  onClick={() =>
    sendMessage("How can I improve my Builder Score?")
  }
>
  ⚡ Improve my Builder Score
</button>

<button
  onClick={() =>
    sendMessage("What achievement should I complete next?")
  }
>
  🏆 My Next Achievement
</button>

<button
  onClick={() =>
    sendMessage("What should I build next on Base?")
  }
>
  🚀 What Should I Build Next?
</button>
</div>

        {false && dailyInsight && (
  <div className="ai-insight-card">
    <h3>🚀 Builder Snapshot</h3>

    <div className="ai-insight-text">
  <div className="builder-badge">
    {builderRankLabel}
  </div>

  <div className="builder-level">
  ⭐ Level {builderLevel}
</div>

<div className="builder-score">
  ⚡ Builder Score: {builderScore}/100
</div>

<div className="builder-progress">
  <div
    className="builder-progress-fill"
    style={{
      width: `${builderProgress}%`,
    }}
  />
</div>

<small className="builder-progress-text">
  {builderProgress}% Complete • {achievementCount}/6 Achievements
</small>

<div className="builder-xp">
  <span>⚡ Builder XP</span>

  <strong>
    {builderXP} / {nextLevelXP} XP
  </strong>
</div>

{nextGoal && (
  <div className="builder-next-goal">
    <span>🎯 Next Goal</span>

    <p>{nextGoal}</p>
  </div>
)}

{coachMessage && (
  <div className="builder-coach">
    <h4>🤖 AI Coach</h4>

    <p>{coachMessage}</p>
  </div>
)}

  <div className="builder-metrics">

  <div className="builder-metric-card">
    <small>📈 Staking Ratio</small>

    <h2>
      {dailyInsight
        .split("\n")[2]
        .split(": ")[1]}
    </h2>
  </div>

  <div className="builder-metric-card">
    <small>🖼 Genesis NFTs</small>

    <h2>
      {dailyInsight
  .split("\n")[4]
  .split(": ")[1]}
    </h2>
  </div>

</div>

<p className="builder-message">
  💙 Keep building on Base!
</p>

<div className="builder-achievements">

  <h4>🏅 Achievements</h4>

  <div className="achievement-list">

    <div
  className={
    snapshotData?.address
      ? "achievement unlocked"
      : "achievement locked"
  }
>
  {snapshotData?.address
    ? "✅ First Wallet Connected"
    : "🔒 First Wallet Connected"}
</div>

    <div
  className={
    Number(snapshotData?.stakedBalance) > 0
      ? "achievement unlocked"
      : "achievement locked"
  }
>
  {Number(snapshotData?.stakedBalance) > 0
    ? "🏦 First Stake"
    : "🔒 First Stake"}
</div>

    <div
  className={
    Number(snapshotData?.nftCount) > 0
      ? "achievement unlocked"
      : "achievement locked"
  }
>
  {Number(snapshotData?.nftCount) > 0
    ? "🖼️ Genesis NFT Holder"
    : "🔒 Genesis NFT Holder"}
</div>

    <div
  className={
    Number(snapshotData?.stakedBalance) >= 100
      ? "achievement unlocked"
      : "achievement locked"
  }
>
  {Number(snapshotData?.stakedBalance) >= 100
    ? "🏆 Top Staker"
    : "🔒 Top Staker"}
</div>

    <div
  className={
    Number(snapshotData?.tokenBalance) >= 500000
      ? "achievement unlocked"
      : "achievement locked"
  }
>
  {Number(snapshotData?.tokenBalance) >= 500000
    ? "🐋 Whale Holder"
    : "🔒 Whale Holder"}
</div>

    <div
  className={
    Number(snapshotData?.tokenBalance) > 0 &&
    Number(snapshotData?.stakedBalance) > 0 &&
    Number(snapshotData?.nftCount) > 0
      ? "achievement unlocked"
      : "achievement locked"
  }
>
  {Number(snapshotData?.tokenBalance) > 0 &&
  Number(snapshotData?.stakedBalance) > 0 &&
  Number(snapshotData?.nftCount) > 0
    ? "🔥 OG Builder"
    : "🔒 OG Builder"}
</div>

{missions.length > 0 && (
  <div className="builder-missions">
    <h4>📋 Builder Missions</h4>

    <div className="mission-list">
      {missions.map((mission, index) => (
        <div
          className={
            mission.completed
              ? "mission completed"
              : "mission pending"
          }
          key={`${mission.title}-${index}`}
        >
          <span>
            {mission.completed ? "✅" : "⬜"}
          </span>

          <p>{mission.title}</p>
        </div>
      ))}
    </div>
  </div>
)}

  </div>

</div>
</div>
  </div>
)}

        <div className="chat-area">
          {messages.map(
            (chat, index) => (
              <div
                key={index}
                className={
                  chat.role === "ai"
                    ? "message ai-message"
                    : "message user-message"
                }
              >
                <strong>
                  {chat.role === "ai"
                    ? "Breen AI"
                    : "You"}
                </strong>

                <p style={{ whiteSpace: "pre-line" }}>
  {chat.text}
</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default BreenAI;