import { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";

const NFT_ADDRESS =
  "0x356f5183D56787272d4d146d6a29aB1aae866161";

const NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function nextTokenId() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

function NFTPage({ wallet }) {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectionName, setCollectionName] =
    useState("Breen Genesis NFT");

  useEffect(() => {
    if (wallet) {
      loadNFTs();
    } else {
      setNfts([]);
      setLoading(false);
    }
  }, [wallet]);

  async function loadNFTs() {
    try {
      setLoading(true);

      const provider = new BrowserProvider(
        window.ethereum
      );

      const contract = new Contract(
        NFT_ADDRESS,
        NFT_ABI,
        provider
      );

      const name = await contract.name();

      setCollectionName(name);

      const totalMinted = Number(
        await contract.nextTokenId()
      );

      const ownedNFTs = [];

      for (let i = 0; i < totalMinted; i++) {
        const owner = await contract.ownerOf(i);

        if (
          owner.toLowerCase() ===
          wallet.toLowerCase()
        ) {
          ownedNFTs.push(i);
        }
      }

      setNfts(ownedNFTs);
    } catch (err) {
      console.error("NFT page error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (!wallet) {
    return (
      <div className="page-card">
        <h2>🖼️ Breen Genesis NFTs</h2>

        <p>
          Connect your wallet to view your NFT
          collection.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h2>🖼️ Breen Genesis NFTs</h2>

        <p>
          Your Genesis NFT collection on Base Sepolia.
        </p>
      </div>

      {loading ? (
        <p className="loading">
          Loading your NFTs...
        </p>
      ) : nfts.length === 0 ? (
        <div className="page-card">
          <h2>No NFTs found</h2>

          <p>
            This connected wallet does not own a
            Breen Genesis NFT yet.
          </p>
        </div>
      ) : (
        <div className="nft-grid">
          {nfts.map((id) => (
            <div
              className="nft-card"
              key={id}
            >
              <div className="nft-image">
                <img
                  src="/genesis.png"
                  alt={`Breen Genesis NFT #${id}`}
                />
              </div>

              <h3>{collectionName}</h3>

              <p>Token #{id}</p>

              <span className="owned-badge">
                ✔ Owned
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NFTPage;