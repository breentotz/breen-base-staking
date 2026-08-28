const hre = require("hardhat");

async function main() {
  const BreenBuilderNFT =
    await hre.ethers.getContractFactory(
      "BreenBuilderNFT"
    );

  const nft =
    await BreenBuilderNFT.deploy();

  await nft.waitForDeployment();

  console.log(
    "BreenBuilderNFT deployed to:",
    await nft.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});