import { useEffect, useState } from "react";
import { formatEther } from "ethers";
import { getContracts } from "../utils/contract";

function TokenPage({ wallet }) {
  const [balance, setBalance] = useState("0");
  const [tokenName, setTokenName] = useState("Breen Token");
  const [symbol, setSymbol] = useState("BREEN");
  const [loading, setLoading] = useState(true);

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

  if (!wallet) {
    return (
      <div className="page-card">
        <h2>🪙 BREEN Token</h2>

        <p>
          Connect your wallet to view your BREEN balance.
        </p>
      </div>
    );
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
              Your Balance
            </span>

            <h1>
              {balance} {symbol}
            </h1>
          </div>

          <div className="token-wallet">
            <span>Connected Wallet</span>

            <p>{wallet}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TokenPage;