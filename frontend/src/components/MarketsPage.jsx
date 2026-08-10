import { useEffect, useState } from "react";

function MarketsPage() {
  const [coins, setCoins] = useState([]);

const [search, setSearch] = useState("");

const [favorites, setFavorites] = useState(() => {
  const saved = localStorage.getItem("breenFavorites");
  return saved ? JSON.parse(saved) : [];
});
  const gainers = coins.filter(
  (coin) => coin.price_change_percentage_24h > 0
);

const losers = coins.filter(
  (coin) => coin.price_change_percentage_24h < 0
);
const baseTokens = [
  {
    symbol: "AERO",
    id: "aerodrome-finance",
    name: "Aerodrome",
    color: "#3b82f6",
  },
  {
    symbol: "BRETT",
    id: "based-brett",
    name: "Brett",
    color: "#22c55e",
  },
  {
    symbol: "DEGEN",
    id: "degen-base",
    name: "Degen",
    color: "#8b5cf6",
  },
  {
    symbol: "TOSHI",
    id: "toshi",
    name: "Toshi",
    color: "#f59e0b",
  },
  {
    symbol: "cbBTC",
    id: "coinbase-wrapped-btc",
    name: "Coinbase Wrapped BTC",
    color: "#2563eb",
  },
  {
    symbol: "USDC",
    id: "usd-coin",
    name: "USD Coin",
    color: "#06b6d4",
  },
];

  useEffect(() => {
  loadMarkets();
}, []);

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    setFavorites(
      favorites.filter(
        (coin) => coin !== id
      )
    );
  } else {
    setFavorites([
      ...favorites,
      id,
    ]);
  }
}
  useEffect(() => {
  localStorage.setItem(
    "breenFavorites",
    JSON.stringify(favorites)
  );
}, [favorites]);

  async function loadMarkets() {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false"
      );

      const data = await response.json();

      setCoins(data);
    } catch (err) {
      console.error(err);
    }
  }
  function getTokenData(id) {
  return coins.find(
    (coin) => coin.id === id
  );
}
  return (
    <div className="markets-page">

      <div className="page-title">
        <div className="market-overview">

  <div className="overview-card">
    <span>🪙 Coins Loaded</span>
    <h2>{coins.length}</h2>
  </div>

  <div className="overview-card">
    <span>📈 Gainers</span>
    <h2>{gainers.length}</h2>
  </div>

  <div className="overview-card">
    <span>📉 Losers</span>
    <h2>{losers.length}</h2>
  </div>

</div>
        <h2>📈 Crypto Markets</h2>

        <p>
          Live cryptocurrency prices powered by CoinGecko.
        </p>
      </div>
    <div className="base-section">

  <h2>🔵 Base Ecosystem</h2>

  <p>
    Featured assets building on Base.
  </p>

  <div className="base-grid">

    {baseTokens.map((token) => {

  const market = getTokenData(token.id);

  return (
    <div
      key={token.symbol}
      className="base-card"
    >

      <div
        className="base-icon"
        style={{
          background: token.color,
        }}
      >
        {token.symbol[0]}
      </div>

      <h3>{token.symbol}</h3>

      <small>{token.name}</small>

      {market && (
        <>
          <h4>
            ${market.current_price.toLocaleString()}
          </h4>

          <p
            style={{
              color:
                market.price_change_percentage_24h >= 0
                  ? "#22c55e"
                  : "#ef4444",
            }}
          >
            {market.price_change_percentage_24h.toFixed(2)}%
          </p>
        </>
      )}

    </div>
  );

})}

  </div>

</div>
      <>
  <input
    className="market-search"
    type="text"
    placeholder="🔍 Search cryptocurrency..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <div className="markets-grid">

       {coins
  .filter((coin) =>
    coin.name
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    coin.symbol
      .toLowerCase()
      .includes(search.toLowerCase())
  )
  .map((coin) => (

          <div
            key={coin.id}
            className="market-card"
          >

            <img
              src={coin.image}
              alt={coin.name}
              width="40"
            />

            <div className="market-header">

  <h3>
    {coin.symbol.toUpperCase()}
  </h3>

  <button
    className="favorite-btn"
    onClick={() =>
      toggleFavorite(coin.id)
    }
  >
    {favorites.includes(coin.id)
      ? "⭐"
      : "☆"}
  </button>

</div>

            <p>{coin.name}</p>

            <h2>
              $
              {coin.current_price.toLocaleString()}
            </h2>

            <strong
              style={{
                color:
                  coin.price_change_percentage_24h >= 0
                    ? "#22c55e"
                    : "#ef4444",
              }}
            >
              {coin.price_change_percentage_24h
  ? coin.price_change_percentage_24h.toFixed(2)
  : "0.00"}%
            </strong>

          </div>

        ))}

      </div>
</>

    </div>
  );
}

export default MarketsPage;