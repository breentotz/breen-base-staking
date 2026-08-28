const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] =
    await ethers.getSigners();

  const network =
    await ethers.provider.getNetwork();

  console.log("Deploying Counter...");
  console.log(
    "Deployer:",
    deployer.address
  );
  console.log(
    "Chain ID:",
    network.chainId.toString()
  );


  /* ========================================
     DEPLOY COUNTER
  ======================================== */

  const Counter =
    await ethers.getContractFactory(
      "Counter"
    );

  const counter =
    await Counter.deploy();

  await counter.waitForDeployment();


  /* ========================================
     DEPLOYMENT INFORMATION
  ======================================== */

  const contractAddress =
    await counter.getAddress();

  const deploymentTx =
    counter.deploymentTransaction();

  const txHash =
    deploymentTx?.hash || null;

  console.log(
    "Counter deployed to:",
    contractAddress
  );

  console.log(
    "Deployment transaction:",
    txHash
  );


  /* ========================================
     CREATE DEPLOYMENT RECORD
  ======================================== */

  const deploymentRecord = {
    contract: "Counter",

    address:
      contractAddress,

    deployer:
      deployer.address,

    chainId:
      network.chainId.toString(),

    network:
      network.chainId === 84532n
        ? "baseSepolia"
        : network.chainId === 8453n
          ? "baseMainnet"
          : "unknown",

    txHash,

    timestamp:
      Date.now(),
  };


  /* ========================================
     DEPLOYMENTS DIRECTORY
  ======================================== */

  const deploymentsDir =
    path.join(
      __dirname,
      "..",
      "deployments"
    );

  if (
    !fs.existsSync(
      deploymentsDir
    )
  ) {
    fs.mkdirSync(
      deploymentsDir,
      {
        recursive: true,
      }
    );
  }


  /* ========================================
     DEPLOYMENT FILES
  ======================================== */

  const latestFilePath =
    path.join(
      deploymentsDir,
      "counter-latest.json"
    );

  const historyFilePath =
    path.join(
      deploymentsDir,
      "counter-history.json"
    );


  /* ========================================
     SAVE LATEST DEPLOYMENT
  ======================================== */

  fs.writeFileSync(
    latestFilePath,

    JSON.stringify(
      deploymentRecord,
      null,
      2
    )
  );

  const frontendDeploymentsDir =
  path.join(
    __dirname,
    "..",
    "frontend",
    "public",
    "deployments"
  );

if (
  !fs.existsSync(
    frontendDeploymentsDir
  )
) {
  fs.mkdirSync(
    frontendDeploymentsDir,
    {
      recursive: true,
    }
  );
}

const frontendLatestFilePath =
  path.join(
    frontendDeploymentsDir,
    "counter-latest.json"
  );

fs.writeFileSync(
  frontendLatestFilePath,
  JSON.stringify(
    deploymentRecord,
    null,
    2
  )
);

console.log(
  "Frontend deployment proof saved:",
  frontendLatestFilePath
);


  /* ========================================
     LOAD DEPLOYMENT HISTORY
  ======================================== */

  let deploymentHistory = [];

  if (
    fs.existsSync(
      historyFilePath
    )
  ) {
    try {
      deploymentHistory =
        JSON.parse(
          fs.readFileSync(
            historyFilePath,
            "utf8"
          )
        );

      if (
        !Array.isArray(
          deploymentHistory
        )
      ) {
        deploymentHistory = [];
      }
    } catch {
      deploymentHistory = [];
    }
  }


  /* ========================================
     ADD NEW DEPLOYMENT
  ======================================== */

  deploymentHistory.push(
    deploymentRecord
  );

  fs.writeFileSync(
    historyFilePath,

    JSON.stringify(
      deploymentHistory,
      null,
      2
    )
  );


  /* ========================================
     COMPLETE
  ======================================== */

  console.log(
    "Latest deployment saved:",
    latestFilePath
  );

  console.log(
    "Deployment history updated:",
    historyFilePath
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});