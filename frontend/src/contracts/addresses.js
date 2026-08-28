export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

export const NETWORKS = {
  [BASE_SEPOLIA_CHAIN_ID]: {
    name: "Base Sepolia",
    chainId: BASE_SEPOLIA_CHAIN_ID,

    tokenAddress:
      "0x8FC91854c16e199A019533941e958C128E442768",

    vaultAddress:
      "0x243ed6c89F6633311CF5FE193Ff8881C71aa14D2",

    builderNftAddress:
       "0xE693324728c40b1dDa64051b49AbEaB73B89c496",  

    explorerUrl:
      "https://sepolia.basescan.org",
  },

  [BASE_MAINNET_CHAIN_ID]: {
    name: "Base Mainnet",
    chainId: BASE_MAINNET_CHAIN_ID,

    // Add these only after we deploy
    // BREEN contracts to Base Mainnet.
    tokenAddress: null,
    vaultAddress: null,
    builderNftAddress: null,

    explorerUrl:
      "https://basescan.org",
  },
};


// Current working network
export const ACTIVE_CHAIN_ID =
  BASE_SEPOLIA_CHAIN_ID;


// Backward-compatible exports.
// These keep the existing Breen Web3 code working
// while we migrate it to network-aware configuration.
export const TOKEN_ADDRESS =
  NETWORKS[ACTIVE_CHAIN_ID].tokenAddress;

export const VAULT_ADDRESS =
  NETWORKS[ACTIVE_CHAIN_ID].vaultAddress;

export const BUILDER_NFT_ADDRESS =
  NETWORKS[ACTIVE_CHAIN_ID].builderNftAddress;  


export function getNetworkConfig(chainId) {
  return NETWORKS[Number(chainId)] || null;
}