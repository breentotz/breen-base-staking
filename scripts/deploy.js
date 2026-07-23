const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("BreenToken");

  const token = await Token.deploy();

  await token.waitForDeployment();

  console.log("====================================");
  console.log("BreenToken deployed successfully!");
  console.log("Contract Address:", await token.getAddress());
  console.log("====================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});