import { useEffect, useState } from "react";
import {
  concat,
  formatEther,
  parseEther,
} from "ethers";
import { getContracts } from "../utils/contract";
import {
  BUILDER_DATA_SUFFIX,
} from "../utils/builderCode";
import {
  addActivity,
} from "../utils/activity";


function TokenPage({ wallet }) {
  const [balance, setBalance] = useState("0");
  const [tokenName, setTokenName] = useState("Breen Token");
  const [symbol, setSymbol] = useState("BREEN");
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [lastTxHash, setLastTxHash] =
  useState("");

useEffect(() => {
  setMessage("");
  setRecipient("");
  setAmount("");
}, [wallet]);


useEffect(() => {
  setLastTxHash("");
  setMessage("");
}, [wallet]);


  useEffect(() => {
    if (!wallet) {
      setLoading(false);
      return;
    }

    async function loadTokenData() {
      try {
        setLoading(true);

        const { token } = await getContracts();

        const tokenBalance = await token.balanceOf(wallet);

        setBalance(formatEther(tokenBalance));

        /* These are optional contract calls.
           The fallback values remain if unavailable. */
        try {
          const name = await token.name();
          setTokenName(name);
        } catch {
          console.log("Token name not available.");
        }

        try {
          const tokenSymbol = await token.symbol();
          setSymbol(tokenSymbol);
        } catch {
          console.log("Token symbol not available.");
        }
      } catch (err) {
        console.error("Token page error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTokenData();
  }, [wallet]);

  async function sendBreen() {

if (!wallet) {
  setMessage(
    "Connect your wallet to send BREEN."
  );
  return;
}

  try {
    if (!recipient) {
      setMessage("Enter a recipient wallet address.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setMessage("Enter a valid BREEN amount.");
      return;
    }

    if (Number(amount) > Number(balance)) {
      setMessage("Insufficient BREEN balance.");
      return;
    }

    setSending(true);
    setMessage("Waiting for MetaMask confirmation...");

    const { token } = await getContracts();

    const txRequest =
  await token.transfer.populateTransaction(
    recipient,
    parseEther(amount)
  );

txRequest.data = concat([
  txRequest.data,
  BUILDER_DATA_SUFFIX,
]);

const tx =
  await token.runner.sendTransaction(
    txRequest
  );

    setMessage("Transaction pending on Base Sepolia...");

    const receipt = await tx.wait();

const txHash =
  receipt.hash || tx.hash;

  addActivity(
  "token",
  "BREEN Sent",
  `${amount} BREEN sent to ${recipient}.`,
  0,
  txHash,
  wallet
);

setMessage(
  `✅ ${amount} BREEN sent successfully.`
);

setLastTxHash(txHash);

    const newBalance = await token.balanceOf(wallet);

    setBalance(formatEther(newBalance));

    setRecipient("");
    setAmount("");
  } catch (err) {
    console.error("BREEN transfer error:", err);

    const rejected =
      err.code === 4001 ||
      err.code === "ACTION_REJECTED";

    if (rejected) {
      setMessage("Transaction rejected in MetaMask.");
    } else {
      setMessage(
        err.shortMessage ||
        err.message ||
        "Unable to send BREEN."
      );
    }
  } finally {
    setSending(false);
  }
}


  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h2>🪙 BREEN Token</h2>

        <p>
          View your BREEN Token information and balance.
        </p>
      </div>

      {loading ? (
        <p className="loading">
          Loading token data...
        </p>
      ) : (
        <div className="token-page-card">

<div className="token-transfer">
  <h2>Send BREEN</h2>

  <label>
    Recipient Address
  </label>

  <input
    type="text"
    placeholder="0x..."
    value={recipient}
    onChange={(event) =>
      setRecipient(event.target.value)
    }
    disabled={!wallet || sending}
  />

  <label>
    Amount
  </label>

  <input
    type="number"
    min="0"
    step="0.01"
    placeholder="Enter BREEN amount"
    value={amount}
    onChange={(event) =>
      setAmount(event.target.value)
    }
    disabled={!wallet || sending}
  />

  <button
  type="button"
  onClick={sendBreen}
  disabled={!wallet || sending}
>
  {!wallet
    ? "Connect Wallet to Send"
    : sending
      ? "Sending..."
      : "Send BREEN"}
</button>

  {message && (
    <p className="token-message">
      {message}
    </p>
  )}
  {lastTxHash && (
  <a
    href={`https://sepolia.basescan.org/tx/${lastTxHash}`}
    target="_blank"
    rel="noreferrer"
    className="token-tx-link"
  >
    View on BaseScan ↗
  </a>
)}
</div>

          <div>
            <span className="token-label">
              Token Name
            </span>

            <h2>{tokenName}</h2>
          </div>

          <div>
            <span className="token-label">
              Symbol
            </span>

            <h2>{symbol}</h2>
          </div>

          <div>
  <span className="token-label">
    Network
  </span>

  <h2>Base Sepolia</h2>
</div>



          <div>
            <span className="token-label">
              Your Balance
            </span>

            <h1>
  {wallet
    ? `${balance} ${symbol}`
    : `— ${symbol}`}
</h1>
          </div>

          <div className="token-wallet">
  <span>
    {wallet
      ? "Connected Wallet"
      : "Wallet Status"}
  </span>

  <p>
    {wallet
      ? wallet
      : "Not Connected"}
  </p>
</div>
        </div>
      )}
    </div>
  );
}



export default TokenPage;