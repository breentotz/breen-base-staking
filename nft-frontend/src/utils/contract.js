import { BrowserProvider, Contract } from "ethers";

export const NFT_ADDRESS =
  "0x356f5183D56787272d4d146d6a29aB1aae866161";

export const NFT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function nextTokenId() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function mint(address to)"
];

export async function getNFTContract() {
  const provider = new BrowserProvider(window.ethereum);

  const signer = await provider.getSigner();

  return new Contract(
    NFT_ADDRESS,
    NFT_ABI,
    signer
  );
}