import { BrowserProvider, Contract } from "ethers";

import tokenArtifact from "../contracts/BreenToken.json";
import vaultArtifact from "../contracts/BreenTokenVault.json";

import {
  ACTIVE_CHAIN_ID,
  getNetworkConfig,
} from "../contracts/addresses";

export async function getContracts() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  console.log("isMetaMask:", window.ethereum.isMetaMask);
  console.log("providers:", window.ethereum.providers);

  const provider = new BrowserProvider(window.ethereum);

  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  const networkConfig = getNetworkConfig(chainId);

  if (!networkConfig) {
    throw new Error(
      "Unsupported network. Please switch MetaMask to Base Sepolia."
    );
  }

  if (chainId !== ACTIVE_CHAIN_ID) {
    throw new Error(
      "Wrong network. Please switch MetaMask to Base Sepolia."
    );
  }

  if (
    !networkConfig.tokenAddress ||
    !networkConfig.vaultAddress
  ) {
    throw new Error(
      `${networkConfig.name} contracts are not configured yet.`
    );
  }

  const signer = await provider.getSigner();

  console.log("Chain ID:", network.chainId.toString());
  console.log("Network:", network);
  console.log(
    "Token Address:",
    networkConfig.tokenAddress
  );

  const code = await provider.getCode(
    networkConfig.tokenAddress
  );

  console.log("Token Contract Code:", code);

  if (code === "0x") {
    throw new Error(
      `BREEN token contract not found on ${networkConfig.name}.`
    );
  }

  const token = new Contract(
    networkConfig.tokenAddress,
    tokenArtifact.abi,
    signer
  );

  const vault = new Contract(
    networkConfig.vaultAddress,
    vaultArtifact.abi,
    signer
  );

  console.log(
    "Deposit Fragment:",
    vault.interface.fragments.find(
      (f) => f.name === "deposit"
    )
  );

  return {
    provider,
    signer,
    token,
    vault,
  };
}