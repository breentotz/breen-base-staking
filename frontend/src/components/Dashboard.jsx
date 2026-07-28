import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { getContracts } from "../utils/contract";
import { VAULT_ADDRESS } from "../contracts/addresses";

export default function Dashboard({ wallet }) {
  const [tokenBalance, setTokenBalance] = useState("0");
  const [vaultBalance, setVaultBalance] = useState("0");
  const [totalDeposits, setTotalDeposits] = useState("0");

  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!wallet) return;

    async function loadData() {
      try {
        const { signer, token, vault } = await getContracts();

        const address = await signer.getAddress();

	alert(address);

        const tokenBal = await token.balanceOf(address);
        const vaultBal = await vault.getMyBalance();
        const total = await vault.totalStaked();

	console.log("Wallet:", address);
	console.log("Token:", formatEther(tokenBal));
	console.log("Vault:", formatEther(vaultBal));
	console.log("Total:", formatEther(total));

        setTokenBalance(formatEther(tokenBal));
        setVaultBalance(formatEther(vaultBal));
        setTotalDeposits(formatEther(total));

      } catch (err) {
        console.error("Dashboard Error:", err);
        alert(err.message);
      }
    }

    loadData();
  }, [wallet]);

async function approveTokens() {
  try {
    const { token } = await getContracts();

    const tx = await token.approve(
      "0x243ed6c89F6633311CF5FE193Ff8881C71aa14D2",
      parseEther(amount)
    );

    await tx.wait();

    alert("Approval successful!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

async function depositTokens() {
  try {
    const { vault } = await getContracts();

    const tx = await vault.deposit(
      parseEther(amount)
    );

    await tx.wait();

    alert("Deposit successful!");

    setAmount("");

    const { signer, token } = await getContracts();

    const address = await signer.getAddress();

    const tokenBal = await token.balanceOf(address);
    const vaultBal = await vault.getMyBalance();
    const total = await vault.totalStaked();

    setTokenBalance(formatEther(tokenBal));
    setVaultBalance(formatEther(vaultBal));
    setTotalDeposits(formatEther(total));

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Dashboard</h2>

      <p>
        <strong>Wallet:</strong>
        <br />
        {wallet}
      </p>

      <p>
        <strong>BREEN Balance:</strong> {tokenBalance}
      </p>

      <p>
        <strong>Vault Balance:</strong> {vaultBalance}
      </p>

      <p>
  <strong>Total Deposits:</strong> {totalDeposits}
</p>

<input
  type="number"
  placeholder="Amount"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  style={{
    padding: "10px",
    marginTop: "20px",
    width: "200px",
  }}
/>

<br />
<br />

<button
  onClick={approveTokens}
  style={{ marginRight: "10px" }}
>
  Approve
</button>

<button onClick={depositTokens}>
  Deposit
</button>

</div>
);
}