import { BrowserProvider, Contract } from "ethers";

import tokenArtifact from "../contracts/BreenToken.json";
import vaultArtifact from "../contracts/BreenTokenVault.json";

import {
  TOKEN_ADDRESS,
  VAULT_ADDRESS,
} from "../contracts/addresses";

export async function getContracts() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
}
	console.log("isMetaMask:", window.ethereum.isMetaMask);
	console.log("providers:", window.ethereum.providers);

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const network = await provider.getNetwork();

console.log("Chain ID:", network.chainId.toString());
console.log("Network:", network);
  console.log("Token Address:", TOKEN_ADDRESS);

  const code = await provider.getCode(TOKEN_ADDRESS);
  console.log("Token Contract Code:", code);

  const token = new Contract(
    TOKEN_ADDRESS,
    tokenArtifact.abi,
    signer
  );

  const vault = new Contract(
    VAULT_ADDRESS,
    vaultArtifact.abi,
    signer
  );

console.log(
  "Deposit Fragment:",
  vault.interface.fragments.find(f => f.name === "deposit")
);

  return {
    provider,
    signer,
    token,
    vault,
  };
}