import { useState } from "react";
import "./App.css";
import Wallet from "./components/Wallet";
import MintCard from "./components/MintCard";
import MyNFTs from "./components/MyNFTs";

function App() {
  const [walletAddress, setWalletAddress] = useState("");

  return (
    <div style={{ paddingTop: "50px", textAlign: "center" }}>
      <h1>🚀 Breen Genesis NFT</h1>

      <h3>Built on Base Sepolia</h3>

      <div className="card">
        <Wallet
          address={walletAddress}
          setAddress={setWalletAddress}
        />
      </div>

      <div className="card">
        <MintCard />
      </div>

      <div className="card">
        <MyNFTs address={walletAddress} />
      </div>
    </div>
  );
}

export default App;