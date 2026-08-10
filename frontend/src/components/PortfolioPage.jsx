import { useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { getContracts } from "../utils/contract";

const NFT_ADDRESS =
  "0x356f5183D56787272d4d146d6a29aB1aae866161";

const NFT_ABI = [
  "function nextTokenId() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

function PortfolioPage({ wallet }) {
  const [tokenBalance, setTokenBalance] = useState("0");
  const [stakedBalance, setStakedBalance] = useState("0");
  const [totalStaked, setTotalStaked] = useState("0");
  const [totalBreenHoldings, setTotalBreenHoldings] = useState("0");
  const [stakingRatio, setStakingRatio] = useState("0");
  const [availableRatio, setAvailableRatio] = useState("0");
  const [walletStatus, setWalletStatus] = useState("Checking...");
  const [builderProgress, setBuilderProgress] = useState(0);
  const [builderRank, setBuilderRank] = useState("Beginner");
  const [nftCount, setNftCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wallet) {
      loadPortfolio();
    } else {
      setLoading(false);
    }
  }, [wallet]);

  async function loadPortfolio() {
    try {
      console.log("Loading Portfolio...");
      console.log("Wallet:", wallet);
      setLoading(true);

      // Load BREEN Token and Breen Vault data
      const { token, vault } = await getContracts();

      const tokenBal = await token.balanceOf(wallet);

      const myStake = await vault.getMyBalance();

      const total = await vault.totalStaked();

      setTokenBalance(
        formatEther(tokenBal)
      );

      setStakedBalance(
        formatEther(myStake)
      );

      setTotalBreenHoldings(
      (
      Number(formatEther(tokenBal)) +
      Number(formatEther(myStake))
       ).toString()
      );

      const holdings =
       Number(formatEther(tokenBal)) +
       Number(formatEther(myStake));

      setStakingRatio(
      holdings > 0
         ? ((Number(formatEther(myStake)) / holdings) * 100).toFixed(2)
         : "0.00"
      );

      setAvailableRatio(
      holdings > 0
         ? ((Number(formatEther(tokenBal)) / holdings) * 100).toFixed(2)
         : "0.00"
         );

         if (Number(formatEther(myStake)) > 0) {
         console.log("Status: Staking Active");
         setWalletStatus("🟢 Staking Active");
      } else if (Number(formatEther(tokenBal)) > 0) {
        console.log("Status: Active");
           setWalletStatus("🟢 Active");
      } else {
        console.log("Status: Empty Wallet");
         setWalletStatus("⚪ Empty Wallet");
      }

      setTotalStaked(
        formatEther(total)
      );

      // Load Breen Genesis NFT data
      const provider = new BrowserProvider(
        window.ethereum
      );

      const nftContract = new Contract(
        NFT_ADDRESS,
        NFT_ABI,
        provider
      );

      const totalMinted = Number(
        await nftContract.nextTokenId()
      );

      let ownedNFTs = 0;

      for (
        let i = 0;
        i < totalMinted;
        i++
      ) {
        const owner =
          await nftContract.ownerOf(i);

        if (
          owner.toLowerCase() ===
          wallet.toLowerCase()
        ) {
          ownedNFTs++;
        }
      }

      setNftCount(ownedNFTs);

      let progress = 0;

if (wallet) progress += 20;
if (Number(formatEther(tokenBal)) > 0) progress += 20;
if (Number(formatEther(myStake)) > 0) progress += 20;
if (ownedNFTs > 0) progress += 20;
if (holdings > 0) progress += 20;

setBuilderProgress(progress);

      if (progress === 100) {
  setBuilderRank("🏆 Base Builder");
} else if (progress >= 80) {
  setBuilderRank("🚀 Advanced Builder");
} else if (progress >= 60) {
  setBuilderRank("🛠️ Builder");
} else if (progress >= 40) {
  setBuilderRank("🌱 Contributor");
} else {
  setBuilderRank("🔰 Explorer");
}

    } catch (err) {
      console.error(
        "Portfolio error:",
        err
      );
    } finally {
      setLoading(false);
    }
  }

  if (!wallet) {
    return (
      <div className="page-card">
        <h2>📊 Portfolio</h2>

        <p>
          Connect your wallet to view your
          Breen Web3 portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-title">
        <h2>📊 Portfolio</h2>

        <p>
          Your Breen Web3 assets in one place.
        </p>
      </div>

      {loading ? (
        <p className="loading">
          Loading your portfolio...
        </p>
      ) : (
        <>
          <div className="portfolio-grid">

            <div className="portfolio-card">
               <span>💰 Total BREEN Holdings</span>

                <h2>
               {totalBreenHoldings}
                </h2>

            <small>
              Wallet balance plus staked BREEN
           </small>
          </div>

            <div className="portfolio-card">
              <span>🪙 BREEN Wallet</span>

              <h2>
                {tokenBalance}
              </h2>

              <small>BREEN available</small>
            </div>

            <div className="portfolio-card">
              <span>🏦 BREEN Staked</span>

              <h2>
                {stakedBalance}
              </h2>

              <small>BREEN in your vault</small>
            </div>

            <div className="portfolio-card">
              <span>📈 Total Staked</span>

              <h2>
                {totalStaked}
              </h2>

              <small>
                BREEN across the vault
              </small>
            </div>

            <div className="portfolio-card">
  <span>📊 Staking Ratio</span>

  <h2>
    {String(stakingRatio)}%
  </h2>

  <small>
    Percentage of your BREEN currently staked
  </small>
</div>

<div className="portfolio-card">
  <span>💼 Available Ratio</span>

  <h2>
    {availableRatio}%
  </h2>

  <small>
    Percentage of your BREEN available in wallet
  </small>
</div>

            <div className="portfolio-card">
              <span>🖼️ Genesis NFTs</span>

              <h2>
                {nftCount}
              </h2>

              <small>
                NFTs owned by this wallet
              </small>
            </div>

          </div>

            <div className="portfolio-card">
           <span>🚀 Builder Progress</span>

               <h2>
                 {builderProgress}% Complete
             </h2>

             <small>
                 Your Breen Web3 ecosystem completion
             </small>
          </div>

        <div className="portfolio-card">
        <span>🏆 Builder Rank</span>

            <h2>
               {builderRank}
           </h2>

             <small>
                Your current Breen Web3 builder level
             </small>
            </div>

          <div className="portfolio-summary">

            <div className="portfolio-card">
           <span>🟢 Wallet Status</span>

            <h2>
             {Number(stakedBalance) > 0
           ? "🟢 Staking Active"
             : Number(tokenBalance) > 0
             ? "🟢 Active"
             : "⚪ Empty Wallet"}
           </h2>

           <small>
                 Current status of your Breen Web3 wallet
            </small>
          </div>

            <h2>
              Breen Web3 Summary
            </h2>

            <p className="builder-badge">
             🎖 Achievement Unlocked:{" "}
             <strong>{builderRank}</strong>
            </p>

            <p>
               Your wallet currently holds{" "}
             <strong>
                {totalBreenHoldings} BREEN
             </strong>
               , with{" "}
             <strong>
               {stakedBalance} BREEN
             </strong>{" "}
                 staked and{" "}
            <strong>
                {nftCount}
             </strong>{" "}
                Breen Genesis NFT
               {nftCount !== 1 ? "s" : ""}.
               {" "}Your current staking ratio is{" "}
            <strong>
               {stakingRatio}%
            </strong>.
            {" "}Your available balance represents{" "}
            <strong>
               {availableRatio}%
            </strong>{" "}
                of your total BREEN holdings.
            </p>

          </div>
        </>
      )}
    </div>
  );
}

export default PortfolioPage;