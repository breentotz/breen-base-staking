import {
  JsonRpcProvider,
} from "ethers";


/* ========================================
   VERIFY BASE DEPLOYMENT PROOF
======================================== */

export async function verifyDeploymentProof(
  wallet = null,
  proofPath = "/deployments/counter-latest.json"
) {
  if (!wallet) {
    return {
      verified: false,
      reason: "wallet_required",
    };
  }


  try {
    /* ========================================
       LOAD DEPLOYMENT RECORD
    ======================================== */

   const response =
  await fetch(
    proofPath
  );

    if (!response.ok) {
      return {
        verified: false,
        reason: "deployment_record_missing",
      };
    }

    const proof =
      await response.json();


    /* ========================================
       CONNECT TO BASE
    ======================================== */

    let rpcUrl = null;

if (proof.chainId === "84532") {
  rpcUrl =
    "https://sepolia.base.org";
}

if (proof.chainId === "8453") {
  rpcUrl =
    "https://base-rpc.publicnode.com";
}

if (!rpcUrl) {
  return {
    verified: false,
    reason: "unsupported_network",
    proof,
  };
}

const provider =
  new JsonRpcProvider(
    rpcUrl
  );

const network =
  await provider.getNetwork();

const connectedChainId =
  network.chainId.toString();


    /* ========================================
       NETWORK CHECK
    ======================================== */

    if (
      proof.chainId !==
      connectedChainId
    ) {
      return {
        verified: false,
        reason: "wrong_network",
        proof,
      };
    }


    /* ========================================
       WALLET / DEPLOYER CHECK
    ======================================== */

    if (
      proof.deployer.toLowerCase() !==
      wallet.toLowerCase()
    ) {
      return {
        verified: false,
        reason: "wallet_not_deployer",
        proof,
      };
    }


       /* ========================================
       RECEIPT CHECK
       Primary onchain deployment proof
    ======================================== */

    console.log(
      "VERIFYING_TX_HASH",
      proof.txHash
    );

    let receipt = null;

try {
  receipt =
    await provider.getTransactionReceipt(
      proof.txHash
    );

  console.log(
    "DEPLOYMENT_RECEIPT",
    receipt
  );
} catch (err) {
  console.error(
    "RECEIPT_RPC_ERROR",
    err
  );

  throw err;
}

    if (!receipt) {
      return {
        verified: false,
        reason: "receipt_not_found",
        proof,
      };
    }

    if (Number(receipt.status) !== 1) {
      return {
        verified: false,
        reason: "transaction_failed",
        proof,
      };
    }


    /* ========================================
       DEPLOYER CHECK
       Receipt contains deployment sender
    ======================================== */

    if (
      !receipt.from ||
      receipt.from.toLowerCase() !==
        proof.deployer.toLowerCase()
    ) {
      return {
        verified: false,
        reason: "transaction_deployer_mismatch",
        proof,
      };
    }


    /* ========================================
       OPTIONAL FULL TRANSACTION
       Some public RPCs may not retain it
    ======================================== */

    let transaction = null;

    try {
      transaction =
        await provider.getTransaction(
          proof.txHash
        );
    } catch (err) {
      console.warn(
        "Full transaction unavailable:",
        err?.message
      );
    }

    if (
      transaction?.from &&
      transaction.from.toLowerCase() !==
        proof.deployer.toLowerCase()
    ) {
      return {
        verified: false,
        reason: "transaction_deployer_mismatch",
        proof,
      };
    }


    /* ========================================
       CONTRACT ADDRESS CHECK
    ======================================== */

    if (
      !receipt.contractAddress ||
      receipt.contractAddress.toLowerCase() !==
        proof.address.toLowerCase()
    ) {
      return {
        verified: false,
        reason: "contract_address_mismatch",
        proof,
      };
    }


    /* ========================================
       CONTRACT CODE CHECK
    ======================================== */

    let code = null;

try {
  code =
    await provider.getCode(
      proof.address
    );
} catch (err) {
  console.warn(
    "Primary RPC getCode failed. Trying fallback..."
  );

  if (proof.chainId === "84532") {
    const fallbackProvider =
      new JsonRpcProvider(
        "https://base-sepolia-rpc.publicnode.com"
      );

    code =
      await fallbackProvider.getCode(
        proof.address
      );
  } else {
    throw err;
  }
}

console.log(
  "DEPLOYMENT_CODE_CHECK",
  code
);

    if (
      !code ||
      code === "0x"
    ) {
      return {
        verified: false,
        reason: "contract_code_missing",
        proof,
      };
    }


    /* ========================================
       VERIFIED
    ======================================== */

    return {
      verified: true,
      reason: "verified",
      proof,
      transaction,
      receipt,
    };

  } catch (err) {
  return {
    verified: false,
    reason: "verification_error",

    error: {
      message:
        err?.message || null,

      shortMessage:
        err?.shortMessage || null,

      code:
        err?.code || null,

      info:
        err?.info || null,

      payload:
        err?.payload || null,

      raw:
        String(err),
    },
  };
}
}

export async function verifyCounterDeployment(
  wallet = null
) {
  return verifyDeploymentProof(
    wallet,
    "/deployments/counter-latest.json"
  );
}

