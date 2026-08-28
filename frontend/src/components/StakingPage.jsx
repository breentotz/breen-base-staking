import { useEffect, useState } from "react";
import { formatEther, parseEther, concat } from "ethers";
import { getContracts } from "../utils/contract";
import {
  VAULT_ADDRESS,
  ACTIVE_CHAIN_ID,
} from "../contracts/addresses";
import { showNotification } from "../services/notificationService";
import { awardXP } from "../services/builderEngine";
import { formatTokenAmount } from "../utils/format";
import { addActivity } from "../utils/activity";
import { BUILDER_DATA_SUFFIX } from "../utils/builderCode";
import "./StakingPage.css";

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
  const [approvedBalance, setApprovedBalance] = useState("0");
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
  const [wrongNetwork, setWrongNetwork] = useState(false);

  async function loadStakingData() {
  if (!wallet) {
    setLoading(false);
    return;
  }

  try {
    setLoading(true);

    const { token, vault } =
      await getContracts();

    const tokenBal =
      await token.balanceOf(wallet);

    const approved =
      await token.allowance(
        wallet,
        VAULT_ADDRESS
      );

    const myStake =
      await vault.getMyBalance();

    const total =
      await vault.totalStaked();

    setTokenBalance(
      formatEther(tokenBal)
    );

    setApprovedBalance(
      formatEther(approved)
    );

    setStakedBalance(
      formatEther(myStake)
    );

    setTotalStaked(
      formatEther(total)
    );
  } catch (err) {
    console.error(
      "Staking page error:",
      err
    );
  } finally {
    setLoading(false);
  }
}

 async function switchToBaseSepolia() {
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }

    const baseSepoliaChainId = "0x14a34";

    // Check the dapp's current network first.
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });


    // Already on Base Sepolia.
    if (
      parseInt(currentChainId, 16) ===
      ACTIVE_CHAIN_ID
    ) {
      setWrongNetwork(false);
      setMessage("✅ Connected to Base Sepolia.");

      if (wallet) {
        await loadStakingData();
      }

      return;
    }

    try {
      // First attempt to switch.
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: baseSepoliaChainId,
          },
        ],
      });
    } catch (switchError) {
      const unknownChain =
        switchError?.code === 4902 ||
        String(switchError?.message || "")
          .toLowerCase()
          .includes("unrecognized chain");

      if (!unknownChain) {
        throw switchError;
      }


      // Add Base Sepolia.
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: baseSepoliaChainId,
            chainName: "Base Sepolia",
            nativeCurrency: {
              name: "Ether",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [
              "https://sepolia.base.org",
            ],
            blockExplorerUrls: [
              "https://sepolia.basescan.org",
            ],
          },
        ],
      });

      // IMPORTANT:
      // Explicitly switch after adding the network.
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: baseSepoliaChainId,
          },
        ],
      });
    }

    // Verify what network the dapp actually received.
    const finalChainId =
      await window.ethereum.request({
        method: "eth_chainId",
      });


    const isBaseSepolia =
      parseInt(finalChainId, 16) ===
      ACTIVE_CHAIN_ID;

    setWrongNetwork(!isBaseSepolia);

    if (!isBaseSepolia) {
      setMessage(
        "⚠️ Network switch did not complete. Please select Base Sepolia for this dapp in MetaMask."
      );
      return;
    }

    setMessage("✅ Connected to Base Sepolia.");

    if (wallet) {
      await loadStakingData();
    }
  } catch (err) {
    console.error(
      "Network switch error:",
      err
    );

    const rejected =
      err?.code === 4001 ||
      err?.code === "ACTION_REJECTED";

    if (rejected) {
      setMessage(
        "Network switch request was rejected."
      );
    } else {
      setMessage(
        err?.shortMessage ||
          err?.message ||
          "Unable to switch to Base Sepolia."
      );
    }
  }
}


  useEffect(() => {
  if (!window.ethereum) {
    setLoading(false);
    return;
  }

  async function checkNetwork() {
    try {
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      });

      const chainId = parseInt(chainIdHex, 16);
      const isWrong = chainId !== ACTIVE_CHAIN_ID;

      setWrongNetwork(isWrong);

      if (isWrong) {
        setLoading(false);
        setTransactionHash("");
        setTransactionStep(0);
        setTransactionStatus("");
        setTokenBalance("0");
        setApprovedBalance("0");
setStakedBalance("0");
setTotalStaked("0");
        setMessage(
          "⚠️ Wrong network. Please switch MetaMask to Base Sepolia."
        );
        return;
      }

      if (wallet) {
        await loadStakingData();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Network check error:", err);
      setLoading(false);
    }
  }

  function handleChainChanged(chainIdHex) {
    const chainId = parseInt(chainIdHex, 16);
    const isWrong = chainId !== ACTIVE_CHAIN_ID;

    setWrongNetwork(isWrong);

    if (isWrong) {
      setLoading(false);
      setTransactionHash("");
      setTransactionStep(0);
      setTransactionStatus("");
      setTokenBalance("0");
      setApprovedBalance("0");
setStakedBalance("0");
setTotalStaked("0");
      setMessage(
        "⚠️ Wrong network. Please switch MetaMask to Base Sepolia."
      );
    } else if (wallet) {
      loadStakingData();
    }
  }

  checkNetwork();

  window.ethereum.on("chainChanged", handleChainChanged);

  return () => {
    window.ethereum.removeListener(
      "chainChanged",
      handleChainChanged
    );
  };
}, [wallet]);


  useEffect(() => {
  if (!message) return;

  const timer = setTimeout(() => {
    setMessage("");
  }, 4000);

  return () => clearTimeout(timer);
}, [message]);

  async function approveTokens() {
  if (!wallet) {
    setMessage(
      "Connect your wallet to use BREEN staking."
    );
    return;
  }

  if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid BREEN amount.");
      return;
    }

    if (Number(amount) > Number(tokenBalance)) {
  alert("Amount exceeds your available BREEN balance.");
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

// First immediate refresh
await loadStakingData();

// Small second refresh for RPC/provider propagation
setTimeout(async () => {
  await loadStakingData();
}, 800);

setTransactionStep(3);
setTransactionStatus("");


setTransactionHash(tx.hash);

setMessage("✅ BREEN approval successful!");

const xpResult = awardXP(
  "APPROVE_BREEN",
  wallet
);

addActivity(
  "approval",
  "BREEN Approved",
  `${amount} BREEN approved for staking.`,
  xpResult.earnedXP,
  tx.hash,
  wallet
);

refreshActivities();

setTransactionStep(5);

if (xpResult.earnedXP > 0) {
  showNotification(
    `✅ ${amount} BREEN approved. ⭐ +${xpResult.earnedXP} Builder XP earned!`,
    "achievement"
  );
} else if (xpResult.reason === "already_rewarded") {
  showNotification(
    `✅ ${amount} BREEN approved. 🛡️ Approval XP already claimed for this wallet.`,
    "info"
  );
}

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
  if (!wallet) {
    setMessage(
      "Connect your wallet to use BREEN staking."
    );
    return;
  }

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
      setTransactionHash(tx.hash);

     await loadStakingData();
     setTransactionStep(4);

setMessage("✅ BREEN staked successfully!");

const xpResult = awardXP(
  "STAKE_BREEN",
  wallet
);

addActivity(
  "staking",
  "BREEN Staked",
  `${amount} BREEN staked in the Breen Vault.`,
  xpResult.earnedXP,
  tx.hash,
  wallet
);

refreshActivities();

setTransactionStep(5);

showNotification(
  `⬆️ ${amount} BREEN staked in the vault.`,
  "success"
);


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
  if (!wallet) {
    setMessage(
      "Connect your wallet to use BREEN staking."
    );
    return;
  }

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

const xpResult = awardXP(
  "UNSTAKE_BREEN",
  wallet
);

addActivity(
  "staking",
  "BREEN Unstaked",
  `${amount} BREEN withdrawn from the vault.`,
  xpResult.earnedXP,
  tx.hash,
  wallet
);

refreshActivities();

showNotification(
  `⬇️ ${amount} BREEN withdrawn from the vault.`,
  "success"
);

showNotification(
  `⭐ +${xpResult.earnedXP} Builder XP earned!`,
  "achievement"
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

  return (
  <div className="page-layout dashboard staking-page">
      <div className="dashboard-title">
        <h2>🏦 BREEN Staking</h2>

        <p>
          Approve and stake BREEN tokens in the
          Breen Vault.
        </p>
      </div>

     {wrongNetwork && (
  <div className="network-warning">
    <strong>⚠️ Wrong Network</strong>

    <p>
      BREEN staking currently runs on Base Sepolia.
    </p>

    <button
      type="button"
      onClick={switchToBaseSepolia}
      className="primary-button"
    >
      Switch to Base Sepolia
    </button>
  </div>
)}

{loading ? (
  <p className="loading">
    Loading staking data...
  </p>
) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span>Available BREEN</span>

              <h3>
  {!wallet || wrongNetwork
    ? "—"
    : formatTokenAmount(tokenBalance)}
</h3>

              <small>BREEN</small>
            </div>

            <div className="stat-card">
               <span>Approved for Staking</span>

               <h3>
  {!wallet || wrongNetwork
    ? "—"
    : formatTokenAmount(approvedBalance)}
</h3>

             <small>BREEN</small>
            </div>

            <div className="stat-card">
              <span>My Staked Balance</span>

              <h3>
  {!wallet || wrongNetwork
    ? "—"
    : formatTokenAmount(stakedBalance)}
</h3>

              <small>BREEN</small>
            </div>

            <div className="stat-card">
              <span>Protocol Total Staked</span>

              <h3>
  {!wallet || wrongNetwork
    ? "—"
    : formatTokenAmount(totalStaked)}
</h3>

              <small>BREEN</small>
            </div>
          </div>


          <div className="staking-card staking-action-panel">

  <div className="staking-panel-info">
    <h2>Stake BREEN</h2>

    <div className="staking-step-badge">
      Base Sepolia Vault
    </div>

    <p>
  Approve your BREEN, then stake it in the vault.
</p>

    <div className="vault-info-row">
      <span className="vault-status">
        🟢 Vault Active
      </span>

      <span className="vault-network">
        Base Sepolia
      </span>
    </div>
  </div>

  <div className="staking-panel-controls">

</div>
            {(
  transactionStep > 0 ||
  transactionStatus ||
  message ||
  transactionHash
) && (
  <div className="staking-transaction-overlay">

    {transactionStatus && (
      <p className="transaction-status">
        ⏳ {transactionStatus}
      </p>
    )}

    {transactionStep > 0 && (
      <div className="transaction-timeline">

        <div
          className={
            transactionStep >= 1
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>1</span>
          <p>Wallet</p>
        </div>

        <div
          className={
            transactionStep >= 2
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>2</span>
          <p>Sent</p>
        </div>

        <div
          className={
            transactionStep >= 3
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>3</span>
          <p>Base</p>
        </div>

        <div
          className={
            transactionStep >= 4
              ? "timeline-step active"
              : "timeline-step"
          }
        >
          <span>4</span>
          <p>Updated</p>
        </div>

        <div
          className={
            transactionStep >= 5
              ? "timeline-step complete"
              : "timeline-step"
          }
        >
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
        View on BaseScan ↗
      </a>
    )}

  </div>
)}

<div className="staking-mini-card">
  <small>Available</small>

  <strong>
  {!wallet
    ? "— BREEN"
    : `${
        depositAmount > 0
          ? formatTokenAmount(previewAvailable)
          : formatTokenAmount(tokenBalance)
      } BREEN`}
</strong>
</div>

<div className="staking-mini-card">
 <small>After Stake</small>

  <strong>
  {!wallet
    ? "— BREEN"
    : `${
        depositAmount > 0
          ? formatTokenAmount(previewStaked)
          : formatTokenAmount(stakedBalance)
      } BREEN`}
</strong>
</div>


<div className="amount-input-wrapper">
           <input
  type="number"
  value={amount}
  min="0"
  max={tokenBalance}
  step="any"
  disabled={!wallet || transactionLoading || wrongNetwork}
  onChange={(e) => {
    const value = e.target.value;

    if (value === "") {
      setAmount("");
      return;
    }

    const numericValue = Number(value);
    const maxBalance = Number(tokenBalance);

    if (numericValue < 0) {
      return;
    }

    if (numericValue > maxBalance) {
      setAmount(tokenBalance);
      return;
    }

    setAmount(value);
  }}
  placeholder="Enter BREEN amount"
/>

            <button
  type="button"
  className="max-button"
  onClick={handleMax}
  disabled={!wallet || transactionLoading || wrongNetwork}
>
  MAX
</button>
</div>

            <div className="staking-actions">
              <button
                onClick={approveTokens}
                className="secondary-button"
                disabled={!wallet || transactionLoading || wrongNetwork}
              >
                {!wallet
  ? "Connect Wallet"
  : transactionLoading
    ? "Processing..."
    : "1. Approve"}
              </button>

              <button
                onClick={depositTokens}
                className="primary-button"
                disabled={!wallet || transactionLoading || wrongNetwork}
              >
                {!wallet
  ? "Connect Wallet"
  : transactionLoading
    ? "Processing..."
    : "2. Stake"}
              </button>

             <button
               onClick={withdrawTokens}
               className="primary-button"
               disabled={!wallet || transactionLoading || wrongNetwork}
            >
               {!wallet
  ? "Connect Wallet"
  : transactionLoading
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