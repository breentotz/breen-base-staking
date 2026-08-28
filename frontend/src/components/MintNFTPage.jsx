import { useEffect, useState } from "react";
import "../styles/MintNFTPage.css";
import {
  BrowserProvider,
  Contract,
} from "ethers";

import {
  BUILDER_DATA_SUFFIX,
} from "../utils/builderCode";

import {
  BUILDER_NFT_ADDRESS,
  ACTIVE_CHAIN_ID,
} from "../contracts/addresses";

import {
  unlockAchievement,
  awardXP,
} from "../services/builderEngine";

import { addActivity } from "../utils/activity";

import {
  getBuilderNFTRarity,
} from "../utils/nftRarity";

const BUILDER_NFT_ABI = [
  "function mint()",
  "function hasMinted(address) view returns (bool)",
  "function nextTokenId() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
];

const MINT_COLLECTION = [
  {
    id: "genesis",
    name: "Genesis",
    title: "Breen Genesis NFT",
    image: "/genesis.png",
    type: "genesis",
  },
  {
    id: "common",
    name: "Common",
    title: "Builder Spark",
    image: "/builder-common.png",
    type: "builder",
  },
  {
    id: "rare",
    name: "Rare",
    title: "Base Pioneer",
    image: "/builder-rare.png",
    type: "builder",
  },
  {
    id: "epic",
    name: "Epic",
    title: "Onchain Architect",
    image: "/builder-epic.png",
    type: "builder",
  },
  {
    id: "legendary",
    name: "Legendary",
    title: "Genesis Builder",
    image: "/builder-legendary.png",
    type: "builder",
  },
];


function MintNFTPage({ wallet }) {
  const [hasMinted, setHasMinted] =
    useState(false);

  const [nextTokenId, setNextTokenId] =
    useState(0);

  const [maxSupply, setMaxSupply] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [minting, setMinting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [selectedNFT, setSelectedNFT] =
  useState(null);  

  const [builderTokenId, setBuilderTokenId] =
  useState(null);

const [builderRarity, setBuilderRarity] =
  useState(null);

  async function loadMintData() {
    if (!wallet || !window.ethereum) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const provider =
        new BrowserProvider(
          window.ethereum
        );

      const network =
        await provider.getNetwork();

      if (
        Number(network.chainId) !==
        ACTIVE_CHAIN_ID
      ) {
        setMessage(
          "⚠️ Switch to Base Sepolia."
        );

        return;
      }

      const contract =
        new Contract(
          BUILDER_NFT_ADDRESS,
          BUILDER_NFT_ABI,
          provider
        );

      const [
        minted,
        nextId,
        supply,
      ] = await Promise.all([
        contract.hasMinted(wallet),
        contract.nextTokenId(),
        contract.MAX_SUPPLY(),
      ]);


for (let i = 0; i < Number(nextId); i++) {
  try {
    const owner = await contract.ownerOf(i);

    console.log(
      `Token #${i}`,
      "Owner:",
      owner,
      "Matches connected wallet:",
      owner.toLowerCase() === wallet.toLowerCase()
    );
  } catch (err) {
    console.log(`Token #${i} unavailable`);
  }
}

console.log("=======================================");

      setHasMinted(minted);

      setNextTokenId(
        Number(nextId)
      );

      setMaxSupply(
        Number(supply)
      );

      if (minted) {
  let ownedTokenId = null;

  for (let i = 0; i < Number(nextId); i++) {
    try {
      const owner =
        await contract.ownerOf(i);

      if (
        owner.toLowerCase() ===
        wallet.toLowerCase()
      ) {
        ownedTokenId = i;
        break;
      }
    } catch {
      // Ignore nonexistent/burned token IDs.
    }
  }

  if (ownedTokenId !== null) {
    setBuilderTokenId(ownedTokenId);

    setBuilderRarity(
      getBuilderNFTRarity(
        ownedTokenId
      )
    );
  }
} else {
  setBuilderTokenId(null);
  setBuilderRarity(null);
}

      setMessage("");
    } catch (err) {
      console.error(
        "Mint NFT load error:",
        err
      );

      setMessage(
        err?.shortMessage ||
        err?.message ||
        "Unable to load mint data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMintData();
  }, [wallet]);

  async function mintNFT() {
    if (!wallet) {
      return;
    }

    try {
      setMinting(true);
      setMessage(
        "Waiting for wallet confirmation..."
      );

      const provider =
        new BrowserProvider(
          window.ethereum
        );

      const signer =
        await provider.getSigner();

      const contract =
        new Contract(
          BUILDER_NFT_ADDRESS,
          BUILDER_NFT_ABI,
          signer
        );

      const txRequest =
  await contract.mint.populateTransaction();

txRequest.data =
  txRequest.data + BUILDER_DATA_SUFFIX.slice(2);

const tx =
  await signer.sendTransaction(txRequest);

      setMessage(
        "Transaction pending on Base..."
      );

      await tx.wait();

const achievementResult =
  unlockAchievement(2, wallet);

const xpResult =
  awardXP(
    "MINT_BUILDER_NFT",
    wallet
  );


if (achievementResult.unlocked) {
  console.log(
    "🏆 Achievement unlocked:",
    achievementResult.achievement.title
  );
}


addActivity(
  "nft",
  "Builder NFT Minted",
  "Minted a Breen Builder NFT on Base Sepolia.",
  xpResult.earnedXP,
  tx.hash,
  wallet
);

setMessage(
  achievementResult.unlocked
    ? "✅ NFT minted! 🏆 First NFT achievement unlocked!"
    : "✅ Breen Builder NFT minted!"
);

await loadMintData();
    } catch (err) {
      console.error(
        "Mint NFT error:",
        err
      );

      const rejected =
        err?.code === 4001 ||
        err?.code ===
          "ACTION_REJECTED";

      setMessage(
        rejected
          ? "Wallet request rejected."
          : err?.shortMessage ||
              err?.message ||
              "Mint failed."
      );
    } finally {
      setMinting(false);
    }
  }

  if (!wallet) {
    return (
      <div className="page-card">
        <h2>✨ Mint Builder NFT</h2>

        <p>
          Connect your wallet to mint your
          Breen Builder NFT.
        </p>
      </div>
    );
  }

  return (
  <div className="mint-nft-page">

    <div className="mint-page-header">
      <div>
        <span className="mint-page-eyebrow">
          BREEN NFT COLLECTION
        </span>

        <h2>Mint Breen NFT</h2>

        <p>
          Explore the Breen NFT collection and mint your Builder identity.
        </p>
      </div>

      <div className="mint-network-badge">
        Base Sepolia
      </div>
    </div>


    {loading ? (
      <div className="mint-loading-card">
        Loading mint status...
      </div>
    ) : (
      <>
        <div className="mint-collection-grid">

          {MINT_COLLECTION.map((item) => (
            <div
              className={`mint-collection-item ${item.id}`}
              key={item.id}
            >

              <div
                className={`mint-collection-card rarity-${item.id}`}
              >
                <span className="mint-collection-type">
                  {item.name}
                </span>

                <img
                  src={item.image}
                  alt={item.title}
                />
              </div>


              <div className="mint-collection-info">
                <strong>{item.title}</strong>

                <div className="mint-card-actions">

  <button
    type="button"
    className="mint-details-button"
    onClick={() =>
      setSelectedNFT(item)
    }
  >
    {item.type === "genesis"
      ? "VIEW DETAILS →"
      : "RARITY DETAILS →"}
  </button>

</div>
              </div>

            </div>
          ))}

        </div>

        <div className="builder-mint-action">

  <div className="builder-mint-action-copy">

    <span className="mint-small-label">
      BUILDER NFT
    </span>

    {hasMinted ? (
      <>
        <h3>
          Builder NFT Claimed
        </h3>

        <p>
          Your Builder identity has already been
          minted on Base Sepolia.
        </p>
      </>
    ) : (
      <>
        <h3>
          Discover Your Builder Rarity
        </h3>

        <p>
          Mint one Builder NFT to reveal your
          Common, Rare, Epic, or Legendary rarity.
        </p>
      </>
    )}

  </div>


  {hasMinted ? (
    <div className="builder-minted-result">

      <span className="builder-minted-check">
        ✓
      </span>

      <div>
        <strong>
          {builderRarity?.name ||
            "Builder NFT"}
        </strong>

        <span>
          {builderTokenId !== null
            ? `Token #${builderTokenId}`
            : "Onchain Builder NFT"}
        </span>
      </div>

    </div>
  ) : (
    <button
      type="button"
      className="builder-single-mint-button"
      onClick={mintNFT}
      disabled={minting}
    >
      {minting
        ? "MINTING ON BASE..."
        : "MINT BUILDER NFT"}
    </button>
  )}

</div>


        {selectedNFT && (
          <div className="mint-details-panel">

            <div className="mint-details-preview">
              <img
                src={selectedNFT.image}
                alt={selectedNFT.title}
              />
            </div>


            <div className="mint-details-content">

              <div className="mint-details-top">
                <div>
                  <span className="mint-small-label">
                    {selectedNFT.name.toUpperCase()}
                  </span>

                  <h3>{selectedNFT.title}</h3>
                </div>

                <button
                  type="button"
                  className="mint-details-close"
                  onClick={() =>
                    setSelectedNFT(null)
                  }
                >
                  ×
                </button>
              </div>


              {selectedNFT.type === "genesis" ? (
                <>
                  <p>
                    The original Breen Genesis NFT collection.
                  </p>

                  <div className="mint-details-note">
                    Genesis NFTs belong to the original Breen collection
                    and are separate from the Builder NFT mint contract.
                  </div>
                </>
              ) : (
                <>
                  <p>
                    {selectedNFT.name} is one of the possible rarity
                    tiers in the Breen Builder NFT collection.
                  </p>

                  <div className="mint-details-stats">

                    <div>
                      <span>Minted</span>
                      <strong>{nextTokenId}</strong>
                    </div>

                    <div>
                      <span>Max Supply</span>
                      <strong>{maxSupply}</strong>
                    </div>

                    <div>
                      <span>Limit</span>
                      <strong>1 / Wallet</strong>
                    </div>

                  </div>


                  {hasMinted ? (
                    <div className="mint-claimed-box">
                      <strong>
                        ✓ Builder NFT Claimed
                      </strong>

                      <span>
                        This wallet has already minted its Builder NFT.
                      </span>
                    </div>
                  ) : (
                    <button
                      className="mint-main-button"
                      onClick={mintNFT}
                      disabled={minting}
                    >
                      {minting
                        ? "Minting..."
                        : "Mint Builder NFT"}
                    </button>
                  )}
                </>
              )}


              {message && (
                <div className="mint-message">
                  {message}
                </div>
              )}

            </div>

          </div>
        )}

      </>
    )}

  </div>
);
}

export default MintNFTPage;