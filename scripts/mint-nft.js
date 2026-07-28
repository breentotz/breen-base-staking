const { ethers } = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0x356f5183D56787272d4d146d6a29aB1aae866161";

    const nft = await ethers.getContractAt(
        "BreenGenesisNFT",
        CONTRACT_ADDRESS
    );

    const [owner] = await ethers.getSigners();

    console.log("Minting NFT to:", owner.address);

    const tx = await nft.mint(owner.address);

    await tx.wait();

    console.log("✅ NFT Minted Successfully!");
    console.log("Owner:", owner.address);

    console.log(
        "Next Token ID:",
        (await nft.nextTokenId()).toString()
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});