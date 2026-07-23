const { ethers } = require("hardhat");

async function main() {
  const tokenAddress = "0x8FC91854c16e199A019533941e958C128E442768";

  const Token = await ethers.getContractFactory("BreenToken");
  const token = Token.attach(tokenAddress);

  const [owner] = await ethers.getSigners();

  console.log("Owner:", owner.address);

  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const balance = await token.balanceOf(owner.address);

  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", ethers.formatEther(totalSupply));
  console.log("Owner Balance:", ethers.formatEther(balance));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});