const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BreenGenesisNFT...");

  const NFT = await ethers.getContractFactory("BreenGenesisNFT");

  const nft = await NFT.deploy();

  await nft.waitForDeployment();

  console.log("====================================");
  console.log("✅ BreenGenesisNFT deployed!");
  console.log("Contract Address:", await nft.getAddress());
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});