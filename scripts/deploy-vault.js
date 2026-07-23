async function main() {
const Vault = await ethers.getContractFactory("BreenVault");
const vault = await Vault.deploy();

await vault.waitForDeployment();

console.log("BreenVault deployed to:", await vault.getAddress());
}

main().catch((error) => {
console.error(error);
process.exitCode = 1;
});
