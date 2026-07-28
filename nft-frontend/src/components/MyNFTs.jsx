import { useEffect, useState } from "react";
import { getNFTContract } from "../utils/contract";
import genesis from "../assets/genesis.png";

function MyNFTs({ address }) {
  const [myNFTs, setMyNFTs] = useState([]);

  useEffect(() => {
    if (address) {
      loadNFTs();
    } else {
      setMyNFTs([]);
    }
  }, [address]);

  async function loadNFTs() {
    try {
      const contract = await getNFTContract();

      const totalMinted = Number(await contract.nextTokenId());

	console.log("Connected wallet:", address);
	console.log("Total Minted:", totalMinted);

      let owned = [];

      for (let i = 0; i < totalMinted; i++) {
        const owner = await contract.ownerOf(i);
	console.log("Token", i, "Owner:", owner);

        if (owner.toLowerCase() === address.toLowerCase()) {
          owned.push(i);
        }
      }

      setMyNFTs(owned);

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <h2>My NFTs</h2>

      {!address ? (
        <p>Connect your wallet to view your NFTs.</p>
      ) : myNFTs.length === 0 ? (
        <p>You don't own any NFTs yet.</p>
      ) : (
        myNFTs.map((id) => (
          <div
            key={id}
            style={{
              border: "1px solid #444",
              borderRadius: "10px",
              padding: "15px",
              marginTop: "15px",
              background: "#222"
            }}
          >
           <img
  src={genesis}
  alt="Genesis NFT"
  style={{
    width: "220px",
    borderRadius: "12px",
    marginBottom: "15px",
  }}
/>

<h3>Breen Genesis NFT</h3>

<p>Token #{id}</p>

<p
  style={{
    color: "#00D4FF",
    fontWeight: "bold",
  }}
>
  ✔ Owned
</p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyNFTs;