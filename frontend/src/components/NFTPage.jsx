import { useEffect, useState } from "react";
import "./NFTPage.css";
import { BrowserProvider, Contract } from "ethers";
import { unlockAchievement } from "../services/builderEngine";
import { BUILDER_NFT_ADDRESS } from "../contracts/addresses";
import {
  getBuilderNFTRarity,
} from "../utils/nftRarity";

const NFT_ADDRESS =
  "0x356f5183D56787272d4d146d6a29aB1aae866161";

const NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function nextTokenId() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

const BUILDER_NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function nextTokenId() view returns (uint256)",
  "function name() view returns (string)",
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

      const builderContract = new Contract(
  BUILDER_NFT_ADDRESS,
  BUILDER_NFT_ABI,
  provider
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
          ownedNFTs.push({
  id: i,
  type: "genesis",
});
        }
      }

       const builderTotalMinted = Number(
  await builderContract.nextTokenId()
);

const ownedBuilderNFTs = [];

for (let i = 0; i < builderTotalMinted; i++) {
  const owner =
    await builderContract.ownerOf(i);

  if (
    owner.toLowerCase() ===
    wallet.toLowerCase()
  ) {
    ownedBuilderNFTs.push({
      id: i,
      type: "builder",
    });
  }
} 



      setNfts([
  ...ownedNFTs,
  ...ownedBuilderNFTs,
]);

const totalOwnedNFTs =
  ownedNFTs.length +
  ownedBuilderNFTs.length;

if (totalOwnedNFTs > 0) {
  unlockAchievement(2, wallet);
}



if (ownedNFTs.length > 0) {
  unlockAchievement(2, wallet);
}
    } catch (err) {
      console.error("NFT page error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ========================================
   NFT COLLECTION SUMMARY DATA
======================================== */

const genesisNFTs =
  nfts.filter(
    (nft) => nft.type === "genesis"
  );

const builderNFTs =
  nfts.filter(
    (nft) => nft.type === "builder"
  );


const builderRarityCounts = {
  Common: 0,
  Rare: 0,
  Epic: 0,
  Legendary: 0,
};


builderNFTs.forEach((nft) => {
  const rarity =
    getBuilderNFTRarity(nft.id);

  if (
    builderRarityCounts[rarity.name] !==
    undefined
  ) {
    builderRarityCounts[rarity.name] += 1;
  }
});


const builderRarityCollection = [
  {
    name: "Common",
    title: "Builder Spark",
    image: "/builder-common.png",
    count: builderRarityCounts.Common,
  },
  {
    name: "Rare",
    title: "Base Pioneer",
    image: "/builder-rare.png",
    count: builderRarityCounts.Rare,
  },
  {
    name: "Epic",
    title: "Onchain Architect",
    image: "/builder-epic.png",
    count: builderRarityCounts.Epic,
  },
  {
    name: "Legendary",
    title: "Genesis Builder",
    image: "/builder-legendary.png",
    count: builderRarityCounts.Legendary,
  },
];


  if (!wallet) {
  return (
    <div className="dashboard nft-guest-page">
      <div className="dashboard-title">
        <h2>🖼️ My Breen NFTs</h2>

        <p>
          View the NFTs owned by your connected wallet.
        </p>
      </div>

      <div className="nft-guest-card">

        <div className="nft-guest-icon">
          🖼️
        </div>

        <div className="nft-guest-content">

          <span className="nft-guest-label">
            WALLET COLLECTION
          </span>

          <h2>
            Connect Wallet to View Your NFTs
          </h2>

          <p>
            Genesis and Builder NFTs owned by your wallet
            will appear here after connecting.
          </p>

          <div className="nft-guest-stats">

            <div>
              <span>Owned NFTs</span>
              <strong>—</strong>
            </div>

            <div>
              <span>Genesis</span>
              <strong>—</strong>
            </div>

            <div>
              <span>Builder</span>
              <strong>—</strong>
            </div>

            <div>
              <span>Network</span>
              <strong>Base Sepolia</strong>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
  

  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h2>🖼️ My Breen NFTs</h2>

<p>
  Your Breen NFT collection on Base Sepolia.
</p>
      </div>

      {wallet && loading ? (
  <p className="loading">
    Loading your NFTs...
  </p>
) : wallet && nfts.length === 0 ? (
        <div className="page-card">
          <h2>No NFTs found</h2>

          <p>
            This connected wallet does not own
            any Breen NFTs yet.
          </p>
        </div>
      ) : (
  <div className="nft-showcase-grid">

  {/* GENESIS */}

  <div className="nft-showcase-item">
    <div
      className={
        genesisNFTs.length > 0
          ? "nft-showcase-card genesis owned"
          : "nft-showcase-card genesis not-owned"
      }
    >
      <span className="nft-showcase-type">
        Genesis
      </span>

      <img
        src="/genesis.png"
        alt="Breen Genesis NFT"
      />
    </div>

    <div className="nft-showcase-details">
      <strong>
        Owned: {genesisNFTs.length}
      </strong>

      <div className="nft-showcase-token-list">
        {genesisNFTs.length > 0 ? (
          genesisNFTs.map((nft) => (
            <span key={nft.id}>
              #{nft.id}
            </span>
          ))
        ) : (
          <span>—</span>
        )}
      </div>
    </div>
  </div>


  {/* COMMON / RARE / EPIC / LEGENDARY */}

  {builderRarityCollection.map((item) => {
    const ownedNFTsOfRarity =
      builderNFTs.filter((nft) => {
        const rarity =
          getBuilderNFTRarity(nft.id);

        return rarity.name === item.name;
      });

    return (
      <div
        className="nft-showcase-item"
        key={item.name}
      >
        <div
          className={
            item.count > 0
              ? `nft-showcase-card rarity-${item.name.toLowerCase()} owned`
              : `nft-showcase-card rarity-${item.name.toLowerCase()} not-owned`
          }
        >
          <span className="nft-showcase-type">
            {item.name}
          </span>

          <img
            src={item.image}
            alt={`${item.name} Breen Builder NFT`}
          />
        </div>

        <div className="nft-showcase-details">
          <strong>
            Owned: {item.count}
          </strong>

          <div className="nft-showcase-token-list">
            {ownedNFTsOfRarity.length > 0 ? (
              ownedNFTsOfRarity.map((nft) => (
                <span key={nft.id}>
                  #{nft.id}
                </span>
              ))
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>
    );
  })}

</div>
)}
    </div>
  );
}

export default NFTPage;