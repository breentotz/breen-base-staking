import { useEffect, useState } from "react";
import { formatEther, parseEther, concat } from "ethers";
import { getContracts } from "../utils/contract";
import { VAULT_ADDRESS } from "../contracts/addresses";
import { showNotification } from "../services/notificationService";
import { awardXP } from "../services/builderEngine";
import { formatTokenAmount } from "../utils/format";
import { addActivity } from "../utils/activity";
import { BUILDER_DATA_SUFFIX } from "../utils/builderCode";

function StakingPage({
  wallet,
  showNotification,
  refreshActivities,
}) {
function handleMax() {
  setAmount(tokenBalance);
}  
  const [tokenBalance, setTokenBalance] = useState("0");
  const [stakedBalance, setStakedBalance] = useState("0");
  const [totalStaked, setTotalStaked] = useState("0");
  const [amount, setAmount] = useState("");
  const depositAmount = Number(amount) || 0;

const previewAvailable =
  Math.max(Number(tokenBalance) - depositAmount, 0);

const previewStaked =
  Number(stakedBalance) + depositAmount;
  const [loading, setLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] =
    useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [message, setMessage] = useState("");  
  const [transactionHash, setTransactionHash] = useState("");
  const [transactionStep, setTransactionStep] = useState(0);

  async function loadStakingData() {
    try {
      setLoading(true);

      const { token, vault } = await getContracts();

      const tokenBal = await token.balanceOf(wallet);
      const myStake = await vault.getMyBalance();
      const total = await vault.totalStaked();

      setTokenBalance(formatEther(tokenBal));
      setStakedBalance(formatEther(myStake));
      setTotalStaked(formatEther(total));
    } catch (err) {
      console.error("Staking page error:", err);
      alert(err.shortMessage || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (wallet) {
      loadStakingData();
    } else {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage("");
  }, 4000);

  return () => clearTimeout(timer);
}, [message]);

  async function approveTokens() {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid BREEN amount.");
      return;
    }

    try {
      setTransactionLoading(true);
      setTransactionStatus("Waiting for MetaMask...");
      setTransactionHash("");
      setTransactionStep(1);

      const { token, signer } = await getContracts();

const txRequest =
  await token.approve.populateTransaction(
    VAULT_ADDRESS,
    parseEther(amount)
  );

txRequest.data = concat([
  txRequest.data,
  BUILDER_DATA_SUFFIX,
]);

const tx = await signer.sendTransaction(txRequest);
      setTransactionStep(2);

      setTransactionStatus("Transaction pending on Base...");

      await tx.wait();
      setTransactionStep(3);

      setTransactionStatus("");

      setMessage("✅ BREEN approval successful!");
      setTransactionStep(5);
      showNotification(
  "success",
  "✅",
  "BREEN Approved",
  `${amount} BREEN approved for staking.`
);
    } catch (err) {
  console.error("Approval error:", err);

  setTransactionStep(0);
  setTransactionStatus("");

  const isUserRejected =
    err.code === 4001 ||
    err.code === "ACTION_REJECTED" ||
    err?.info?.error?.code === 4001 ||
    err.message?.toLowerCase().includes("user rejected");

  if (isUserRejected) {
    setMessage("Wallet request rejected.");
  } else {
    setMessage(err.shortMessage || err.message);
  }
} finally {
  setTransactionLoading(false);
}
  }

  async function depositTokens() {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid BREEN amount.");
      return;
    }

    try {
      setTransactionLoading(true);
      setTransactionStatus("Waiting for MetaMask...");
      setTransactionHash("");
      setTransactionStep(1);

      const { vault, signer } = await getContracts();

const txRequest =
  await vault.deposit.populateTransaction(
    parseEther(amount)
  );

txRequest.data = concat([
  txRequest.data,
  BUILDER_DATA_SUFFIX,
]);

const tx = await signer.sendTransaction(txRequest);
      setTransactionStep(2);

      setTransactionStatus("Transaction pending on Base...");

      const receipt = await tx.wait();
      setTransactionStep(3);
      setTransactionStatus("");
      console.log("Transaction Hash:", tx.hash);
      setTransactionHash(tx.hash);

     await loadStakingData();
     setTransactionStep(4);

setMessage("✅ BREEN deposited successfully!");
addActivity(
  "staking",
  "BREEN Deposited",
  `${amount} BREEN deposited into the vault.`
);
refreshActivities();


setTransactionStep(5);

showNotification(
  `⬆️ ${amount} BREEN deposited into the vault.`,
  "success"
);

const xpResult = awardXP("STAKE_BREEN");

showNotification(
  `⭐ +${xpResult.earnedXP} Builder XP earned!`,
  "achievement"
);

setAmount("");
    } catch (err) {
  console.error("Deposit error:", err);

  setTransactionStep(0);
  setTransactionStatus("");

  const isUserRejected =
    err.code === 4001 ||
    err.code === "ACTION_REJECTED" ||
    err?.info?.error?.code === 4001 ||
    err.message?.toLowerCase().includes("user rejected");

  if (isUserRejected) {
    setMessage("Wallet request rejected.");
  } else {
    setMessage(err.shortMessage || err.message);
  }
} finally {
  setTransactionLoading(false);
}
  }

  async function withdrawTokens() {
  if (!amount || Number(amount) <= 0) {
    alert("Please enter a valid BREEN amount.");
    return;
  }

  try {
    setTransactionLoading(true);
    setTransactionStatus("Waiting for MetaMask...");
    setTransactionHash("");
    setTransactionStep(1);

    const { vault, signer } = await getContracts();

const txRequest =
  await vault.withdraw.populateTransaction(
    parseEther(amount)
  );

txRequest.data = concat([
  txRequest.data,
  BUILDER_DATA_SUFFIX,
]);

const tx = await signer.sendTransaction(txRequest);
    setTransactionStep(2);

    setTransactionStatus("Transaction pending on Base...");

    await tx.wait();
    setTransactionStep(3);
    setTransactionStatus("");

    setMessage("✅ BREEN unstaked successfully!");

    addActivity(
  "staking",
  "BREEN Unstaked",
  `${amount} BREEN withdrawn from the vault.`
);

refreshActivities();

    showNotification(
  "success",
  "⬇️",
  "BREEN Unstaked",
  `${amount} BREEN withdrawn from the vault.`
);

    setAmount("");

    setTimeout(async () => {
  await loadStakingData();
  setTransactionStep(4);
  setTransactionStep(5);
}, 1000);
 } catch (err) {
  console.error("Withdraw error:", err);

  setTransactionStep(0);
  setTransactionStatus("");

  const isUserRejected =
    err.code === 4001 ||
    err.code === "ACTION_REJECTED" ||
    err?.info?.error?.code === 4001 ||
    err.message?.toLowerCase().includes("user rejected");

  if (isUserRejected) {
    setMessage("Wallet request rejected.");
  } else {
    setMessage(err.shortMessage || err.message);
  }
} finally {
  setTransactionLoading(false);
}
}

  if (!wallet) {
    return (
      <div className="page-card">
        <h2>🏦 BREEN Staking</h2>

        <p>
          Connect your wallet to access Breen staking.
        </p>
      </div>
    );
  }

  return (
  <div className="page-layout dashboard staking-page">
      <div className="dashboard-title">
        <h2>🏦 BREEN Staking</h2>

        <p>
          Approve and stake BREEN tokens in the
          Breen Vault.
        </p>
      </div>

      {loading ? (
        <p className="loading">
          Loading staking data...
        </p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Available BREEN</span>

              <h3>{formatTokenAmount(tokenBalance)}</h3>

              <small>BREEN</small>
            </div>

            <div className="stat-card">
              <span>My Staked Balance</span>

              <h3>{formatTokenAmount(stakedBalance)}</h3>

              <small>BREEN</small>
            </div>

            <div className="stat-card">
              <span>Total Staked</span>

              <h3>{formatTokenAmount(totalStaked)}</h3>

              <small>BREEN</small>
            </div>
          </div>

          <div className="staking-card staking-action-panel">
            <h2>Stake BREEN</h2>
            <div className="staking-step-badge">
             Base Sepolia Vault
            </div>

            <p>
              First approve the amount, then click
              Deposit to stake it in the vault.
            </p>

            <div className="vault-info-row">
  <span className="vault-status">
    🟢 Vault Active
  </span>

  <span className="vault-network">
    Base Sepolia
  </span>
</div>

            {transactionStatus && (
           <p className="transaction-status">
             ⏳ {transactionStatus}
           </p>
          )}

          {transactionStep > 0 && (
  <div className="transaction-timeline">
    <div className={transactionStep >= 1 ? "timeline-step active" : "timeline-step"}>
      <span>1</span>
      <p>Wallet Signature</p>
    </div>

    <div className={transactionStep >= 2 ? "timeline-step active" : "timeline-step"}>
      <span>2</span>
      <p>Transaction Sent</p>
    </div>

    <div className={transactionStep >= 3 ? "timeline-step active" : "timeline-step"}>
      <span>3</span>
      <p>Base Confirmation</p>
    </div>

    <div className={transactionStep >= 4 ? "timeline-step active" : "timeline-step"}>
      <span>4</span>
      <p>Balances Updated</p>
    </div>

    <div className={transactionStep >= 5 ? "timeline-step complete" : "timeline-step"}>
      <span>✓</span>
      <p>Complete</p>
    </div>
  </div>
)}

            {message && (
           <p className="transaction-message">
             {message}
             </p>
          )}

          {transactionHash && (
  <a
    href={`https://sepolia.basescan.org/tx/${transactionHash}`}
    target="_blank"
    rel="noreferrer"
    className="transaction-link"
  >
    View on Basescan →
  </a>
)}

<div className="staking-mini-card">
  <small>Available</small>

  <strong>
  {depositAmount > 0
    ? formatTokenAmount(previewAvailable)
    : formatTokenAmount(tokenBalance)}{" "}
  BREEN
</strong>
</div>

<div className="staking-mini-card">
  <small>After Deposit</small>

  <strong>
  {depositAmount > 0
    ? formatTokenAmount(previewStaked)
    : formatTokenAmount(stakedBalance)}{" "}
  BREEN
</strong>
</div>


<div className="amount-input-wrapper">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter BREEN amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              disabled={transactionLoading}
            />

            <button
  type="button"
  className="max-button"
  onClick={handleMax}
>
  MAX
</button>
</div>

            <div className="staking-actions">
              <button
                onClick={approveTokens}
                className="secondary-button"
                disabled={transactionLoading}
              >
                {transactionLoading
                  ? "Processing..."
                  : "1. Approve"}
              </button>

              <button
                onClick={depositTokens}
                className="primary-button"
                disabled={transactionLoading}
              >
                {transactionLoading
                  ? "Processing..."
                  : "2. Deposit"}
              </button>

             <button
               onClick={withdrawTokens}
               className="primary-button"
               disabled={transactionLoading}
            >
               {transactionLoading
                  ? "Processing..."
                  : "3. Unstake"}
            </button>

            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StakingPage;