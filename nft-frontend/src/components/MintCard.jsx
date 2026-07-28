import { useEffect, useState } from "react";
import { getNFTContract } from "../utils/contract";

function MintCard() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [minted, setMinted] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadContract();
  }, []);

  async function loadContract() {
    try {
      const contract = await getNFTContract();

      setName(await contract.name());
      setSymbol(await contract.symbol());
      setMinted((await contract.nextTokenId()).toString());
    } catch (err) {
      console.error(err);
    }
  }

  async function mintNFT() {
    try {
      setLoading(true);

      const contract = await getNFTContract();

      const signer = await contract.runner.getAddress();

      const tx = await contract.mint(signer);

      await tx.wait();

      alert("NFT Minted Successfully!");

      await loadContract();
    } catch (err) {
      console.error(err);
      alert(err.reason || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 40 }}>
      <h2>{name}</h2>

      <p>Symbol: {symbol}</p>

      <p>Total Minted: {minted}</p>

      <button
        onClick={mintNFT}
        disabled={loading}
        style={{
          padding: "12px 30px",
          fontSize: "18px",
          cursor: "pointer",
          borderRadius: "10px"
        }}
      >
        {loading ? "Minting..." : "Mint NFT"}
      </button>
    </div>
  );
}

export default MintCard;