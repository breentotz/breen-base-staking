import { BrowserProvider } from "ethers";

function Wallet({ address, setAddress }) {

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);

      const accounts = await provider.send(
        "eth_requestAccounts",
        []
      );

      setAddress(accounts[0]);

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <button onClick={connectWallet}>
        {address ? "Wallet Connected" : "Connect Wallet"}
      </button>

      {address && (
        <div className="wallet">
          <div className="label">
            Connected Wallet
          </div>

          <p>{address}</p>
        </div>
      )}
    </div>
  );
}

export default Wallet;