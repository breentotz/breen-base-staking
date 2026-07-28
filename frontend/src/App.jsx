import { useState } from "react";
import { BrowserProvider } from "ethers";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [wallet, setWallet] = useState("");

  async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }

    console.log("Ethereum:", window.ethereum);

    const provider = new BrowserProvider(window.ethereum);

    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();

    const address = await signer.getAddress();

    console.log("Connected:", address);

    setWallet(address);

  } catch (err) {
    console.error("Wallet Error:", err);
    alert(err.message);
  }
}

  return (
    <div className="app">
      <h1>🚀 Breen Base Staking</h1>

      <p>Build on Base • Powered by BreenToken</p>

      {!wallet ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <button>
            {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </button>

          <Dashboard wallet={wallet} />
        </>
      )}
    </div>
  );
}

export default App;