const { ethers } = require("hardhat");

async function main() {
  // Your deployed BREEN token
  const tokenAddress = "0x8FC91854c16e199A019533941e958C128E442768";

  const Vault = await ethers.getContractFactory("BreenTokenVault");
  const vault = await Vault.deploy(tokenAddress);

  await vault.waitForDeployment();

  console.log("BreenTokenVault deployed to:", await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});