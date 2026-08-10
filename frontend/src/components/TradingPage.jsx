import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContracts } from "../utils/contract";
import PortfolioSummary from "./PortfolioSummary";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function TradingPage() {

  const [balance, setBalance] = useState(() => {
  return Number(
    localStorage.getItem("breenBalance")
  ) || 10000;
});

useEffect(() => {
  localStorage.setItem(
    "breenBalance",
    balance
  );
}, [balance]);

const [amount, setAmount] = useState("");

const [coin, setCoin] = useState("Bitcoin");

const [marketData, setMarketData] = useState([]);

const [chartData, setChartData] = useState([]);

const [chartDays, setChartDays] = useState(7);

const [walletAddress, setWalletAddress] = useState("");

const [walletConnected, setWalletConnected] = useState(false);

const [networkName, setNetworkName] = useState("");

const [tokenBalance, setTokenBalance] = useState("0");

const [stakedBalance, setStakedBalance] = useState("0");

const [watchlist, setWatchlist] = useState(() => {
  const saved = localStorage.getItem("breenWatchlist");

  return saved ? JSON.parse(saved) : [];
});

const [averageCost, setAverageCost] = useState(() => {
  const saved = localStorage.getItem("breenAverageCost");

  return saved ? JSON.parse(saved) : {};
});

const [history, setHistory] = useState(() => {
  const savedHistory = localStorage.getItem(
    "breenHistory"
  );

  return savedHistory
    ? JSON.parse(savedHistory)
    : [];
});

const [holdings, setHoldings] = useState(() => {
  const savedHoldings = localStorage.getItem(
    "breenHoldings"
  );

  return savedHoldings
    ? JSON.parse(savedHoldings)
    : {};
});




const coinPrices = {
  Bitcoin:
    marketData.find(c => c.id === "bitcoin")?.current_price ?? 118000,

  Ethereum:
    marketData.find(c => c.id === "ethereum")?.current_price ?? 4200,

  Solana:
    marketData.find(c => c.id === "solana")?.current_price ?? 210,

  Aerodrome:
    marketData.find(c => c.id === "aerodrome-finance")?.current_price ?? 1.25,

  Brett:
    marketData.find(c => c.id === "based-brett")?.current_price ?? 0.18,
};

// ✅ NOW holdings exists
useEffect(() => {
  localStorage.setItem(
    "breenHoldings",
    JSON.stringify(holdings)
  );
}, [holdings]);

useEffect(() => {
  localStorage.setItem(
    "breenHistory",
    JSON.stringify(history)
  );
}, [history]);

useEffect(() => {
  localStorage.setItem(
    "breenWatchlist",
    JSON.stringify(watchlist)
  );
}, [watchlist]);

useEffect(() => {
  async function loadMarketData() {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,aerodrome-finance,based-brett&sparkline=false"
      );

      const data = await response.json();

      setMarketData(data);

      console.log("Live Market Data:", data);

    } catch (err) {
      console.error(err);
    }
  }

  loadMarketData();
}, []);

useEffect(() => {
  async function loadChartData() {
    try {
      const coinId =
        coinIdMap[coin] || "bitcoin";

      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${chartDays}`
      );

      const data = await response.json();

      const formatted = data.prices.map(
        (item) => ({
          day: new Date(item[0]).toLocaleDateString(
            "en-US",
            { weekday: "short" }
          ),
          price: item[1],
        })
      );

      setChartData(formatted);

    } catch (err) {
      console.error(err);
    }
  }

  loadChartData();
}, [coin, chartDays]);

useEffect(() => {
  localStorage.setItem(
    "breenAverageCost",
    JSON.stringify(averageCost)
  );
}, [averageCost]);

const coinIdMap = {
  Bitcoin: "bitcoin",
  Ethereum: "ethereum",
  Solana: "solana",
  Aerodrome: "aerodrome-finance",
  Brett: "based-brett",
};

const selectedMarket = marketData.find(
  (item) => item.id === coinIdMap[coin]
);



const price =
  selectedMarket?.current_price ||
  coinPrices[coin];

  const portfolioValue = Object.entries(holdings).reduce(
  (total, [coin, amount]) => {
    return total + amount * (coinPrices[coin] || 0);
  },
  0
);

const netWorth = balance + portfolioValue;

const assetsOwned = Object.keys(holdings).filter(
  (coin) => holdings[coin] > 0
).length;

function toggleWatchlist(name) {

  if (watchlist.includes(name)) {

    setWatchlist(
      watchlist.filter(
        (coin) => coin !== name
      )
    );

  } else {

    setWatchlist([
      ...watchlist,
      name,
    ]);

  }

}

async function stakeBreen() {
  try {
    const { token, vault } = await getContracts();

    const value = ethers.parseUnits(amount, 18);

    const approveTx = await token.approve(vault.target, value);
    await approveTx.wait();

    console.log("Approve complete");

    const stakeTx = await vault.deposit(value);
await stakeTx.wait();

console.log("Stake complete");

const signer = await token.runner.getAddress();
const decimals = await token.decimals();

const newTokenBalance = await token.balanceOf(signer);
const newStakedBalance = await vault.getMyBalance();

setTokenBalance(
  ethers.formatUnits(newTokenBalance, decimals)
);

setStakedBalance(
  ethers.formatUnits(newStakedBalance, decimals)
);

  } catch (error) {
    console.error(error);
  }
}

function buyCoin() {


  if (!amount) return;

  const cost = Number(amount) * price;

  if (cost > balance) {
    alert("Not enough balance.");
    return;
  }

  setBalance(balance - cost);
  setHoldings({

  ...holdings,

  [coin]:
    (holdings[coin] || 0) +
    Number(amount),

});

const previousAmount =
  holdings[coin] || 0;

const previousAverage =
  averageCost[coin] || 0;

const newAmount =
  previousAmount + Number(amount);

const newAverage =
  (
    previousAverage * previousAmount +
    price * Number(amount)
  ) / newAmount;

setAverageCost({

  ...averageCost,

  [coin]: newAverage,

});

  setHistory((prev) => [
  {
    type: "BUY",
    coin,
    amount,
    cost,
  },
  ...prev,
]);

  setAmount("");

}

function sellCoin() {

  if (!amount) return;

  const owned = holdings[coin] || 0;

  if (Number(amount) > owned) {
    alert("You don't own enough of this coin.");
    return;
  }

  const revenue = Number(amount) * price;

  setBalance((prev) => prev + revenue);

  setHoldings((prev) => ({
    ...prev,
    [coin]: prev[coin] - Number(amount),
  }));

  setHistory((prev) => [
    {
      type: "SELL",
      coin,
      amount,
      cost: revenue,
    },
    ...prev,
  ]);

  setAmount("");
}

async function connectWallet() {

  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return;
  }

  try {

    const provider = new ethers.BrowserProvider(window.ethereum);

    const accounts = await provider.send(
      "eth_requestAccounts",
      []
    );

    setWalletAddress(accounts[0]);

    await loadTokenBalance(accounts[0]);

    const network = await provider.getNetwork();

setNetworkName(network.name);

    setWalletConnected(true);

  } catch (error) {

    console.error(error);

  }

}

async function loadTokenBalance(address) {
  try {
    const { token, vault } = await getContracts();

    const balance = await token.balanceOf(address);
    console.log("Raw Balance:", balance.toString());
    const decimals = await token.decimals();

    const staked = await vault.getMyBalance();

console.log("Staked Raw:", staked.toString());

setStakedBalance(ethers.formatUnits(staked, decimals));

    setTokenBalance(
      ethers.formatUnits(balance, decimals)
    );
  } catch (error) {
    console.error(
      "BREEN balance error:",
      error
    );
  }
}

useEffect(() => {
  async function loadConnectedWallet() {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);

    if (accounts.length > 0) {
      setWalletAddress(accounts[0]);
      await loadTokenBalance(accounts[0]);

      const network = await provider.getNetwork();
      setNetworkName(network.name);
      setWalletConnected(true);
    }
  }

  loadConnectedWallet();
}, []);

  return (
    <div className="trading-page">
        <div className="portfolio-summary">


  <div className="summary-card">
  <h4>💰 Cash</h4>
  <h2>${balance.toLocaleString()}</h2>
  <small>Available to trade</small>
</div>

<div className="summary-card">
  <h4>📦 Assets</h4>
  <h2>{assetsOwned}</h2>
  <small>Coins currently owned</small>
</div>

<div className="summary-card">
  <h4>💎 Portfolio</h4>
  <h2>${portfolioValue.toLocaleString()}</h2>
  <small>Current holdings value</small>
</div>

<div className="summary-card">
  <h4>🏆 Net Worth</h4>
  <h2>${netWorth.toLocaleString()}</h2>
  <small>Cash + Portfolio</small>
</div>

<div className="summary-card">
  <h4>📈 Total P/L</h4>

  <div className="summary-card">

  <h4>🪙 BREEN</h4>

  <h2>{Number(tokenBalance).toLocaleString()}</h2>

  <small>Live Token Balance</small>

</div>

<div className="summary-card">

  <h4>🔒 Staked BREEN</h4>

  <h2>{Number(stakedBalance).toLocaleString()}</h2>

  <small>Live Staked Balance</small>

</div>

  <h2
    className={
      portfolioValue >=
      Object.entries(holdings).reduce(
        (total, [coinName, amount]) =>
          total +
          amount *
            (averageCost[coinName] || 0),
        0
      )
        ? "profit"
        : "loss"
    }
  >
    {portfolioValue >=
    Object.entries(holdings).reduce(
      (total, [coinName, amount]) =>
        total +
        amount *
          (averageCost[coinName] || 0),
      0
    )
      ? "🟢 +"
      : "🔴 -"}

    $
    {Math.abs(
      portfolioValue -
        Object.entries(holdings).reduce(
          (total, [coinName, amount]) =>
            total +
            amount *
              (averageCost[coinName] || 0),
          0
        )
    ).toFixed(2)}
  </h2>

  <small>Total Unrealized P/L</small>
</div>

</div>

<div className="chart-card">

  <h3>📈 Portfolio Trend</h3>

  <div className="chart-buttons">

  <button onClick={() => setChartDays(1)}>
    1D
  </button>

  <button onClick={() => setChartDays(7)}>
    7D
  </button>

  <button onClick={() => setChartDays(30)}>
    30D
  </button>

  <button onClick={() => setChartDays(90)}>
    90D
  </button>

  <button onClick={() => setChartDays(365)}>
    1Y
  </button>

</div>

  <ResponsiveContainer
    width="100%"
    height={300}
  >
    <LineChart data={chartData}>

      <XAxis dataKey="day" />

      <YAxis />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="price"
        stroke="#0052ff"
        strokeWidth={3}
      />

    </LineChart>

  </ResponsiveContainer>

</div>

     <div className="page-title">

  <h2>💹 Trading Hub</h2>

  <p>
    Practice trading with virtual funds.
  </p>

  <button
    className="connect-wallet-btn"
    onClick={connectWallet}
  >
    {walletConnected
      ? `🟢 ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "🔵 Connect Wallet"}
  </button>

  {walletConnected && (
  <div className="wallet-info">

    <p>
      🌐 <strong>Network:</strong> {networkName}
    </p>

  </div>
)}

</div>

      <div className="trading-grid">

        <div className="trade-card">

          <h3>💵 Virtual Balance</h3>

          <h1>
            ${balance.toLocaleString()}
          </h1>

          <small>
            Paper Trading Account
          </small>

        </div>

        <div className="trade-card">

         <h3>📈 Buy</h3>

         <div className="watchlist-card">

  <h4>⭐ Favorite Coins</h4>

  {marketData
  .filter((coin) =>
    watchlist.includes(coin.name)
  )
  .map((marketCoin) => (

    <div
      key={marketCoin.id}
      className={
        marketCoin.name === coin
          ? "watchlist-item active-watch"
          : "watchlist-item"
      }
      onClick={() => setCoin(marketCoin.name)}
    >

      <button
        className="watchlist-button"
        onClick={() => toggleWatchlist(marketCoin.name)}
      >
        {watchlist.includes(marketCoin.name) ? "⭐" : "☆"}
      </button>

      <img
        src={marketCoin.image}
        alt={marketCoin.name}
        className="coin-logo"
      />

      <div className="watchlist-info">
        <strong>{marketCoin.name}</strong>

        <small>
          ${marketCoin.current_price.toLocaleString()}
        </small>
      </div>

      <span
        className={
          marketCoin.price_change_percentage_24h >= 0
            ? "profit"
            : "loss"
        }
      >
        {marketCoin.price_change_percentage_24h.toFixed(2)}%
      </span>

    </div>

))}

</div>

<select
  value={coin}
  onChange={(e) =>
    setCoin(e.target.value)
  }
>

  {Object.keys(coinPrices).map(
    (name) => (

      <option
        key={name}
        value={name}
      >
        {watchlist.includes(name) ? "⭐ " : "☆ "}
{name}
      </option>

    )
  )}

</select>

<div className="coin-info-card">

  <div className="coin-header">

    <img
      src={selectedMarket?.image}
      alt={coin}
      className="coin-logo-large"
    />

    <div>

      <h2>{selectedMarket?.name || coin}</h2>

      <small>
        {selectedMarket?.symbol?.toUpperCase()}
      </small>

    </div>

  </div>

  <h1>
    ${price.toLocaleString()}
  </h1>

  <p
    className={
      selectedMarket?.price_change_percentage_24h >= 0
        ? "positive"
        : "negative"
    }
  >
    {selectedMarket?.price_change_percentage_24h?.toFixed(2)}%
  </p>

  <div className="market-stats">

  <div className="market-stat">
    <small>🏦 Market Cap</small>
    <h3>
      $
      {selectedMarket?.market_cap?.toLocaleString()}
    </h3>
  </div>

  <div className="market-stat">
    <small>📊 24h Volume</small>
    <h3>
      $
      {selectedMarket?.total_volume?.toLocaleString()}
    </h3>
  </div>

  <div className="market-stat">
    <small>🏅 Rank</small>
    <h3>
      #{selectedMarket?.market_cap_rank}
    </h3>
  </div>

</div>

</div>

<input
  type="number"
  placeholder="Amount"
  value={amount}
  onChange={(e)=>setAmount(e.target.value)}
/>

<button onClick={buyCoin}>
  Buy
</button>

<button onClick={sellCoin}>
  Sell
</button>

<button onClick={stakeBreen}>
  Stake BREEN
</button>

        </div>

<div className="trade-card">

  <h3>💼 Your Holdings</h3>

  {Object.keys(holdings).length === 0 ? (

    <p>No assets yet.</p>

  ) : (

    Object.entries(holdings).map(
  ([coinName, amount]) => (

    <div
      key={coinName}
      className="holding-item"
    >
      <div>
  <strong>
    {coinName === "Bitcoin" && "₿ "}
    {coinName === "Ethereum" && "Ξ "}
    {coinName === "Aerodrome" && "🛩️ "}
    {coinName === "Degen" && "🎲 "}
    {coinName === "Toshi" && "🐱 "}
    {coinName}
  </strong>
</div>

<div>

  <strong>
    {coinName === "Bitcoin" && "₿ "}
    {coinName === "Ethereum" && "Ξ "}
    {coinName === "Aerodrome" && "🛩️ "}
    {coinName === "Degen" && "🎲 "}
    {coinName === "Toshi" && "🐱 "}
    {coinName === "Brett" && "🐸 "}

    {coinName}
  </strong>

  <p>
    {amount.toLocaleString()} {coinName.toUpperCase()}
  </p>

  <small className="average-price">
    Avg Buy: $
    {(averageCost[coinName] || 0).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 6,
      }
    )}
  </small>

</div>

      <div className="holding-value">
        ${(
          amount *
          (coinPrices[coinName] || 0) 
        ).toLocaleString()}
      </div>
      <p
  className={
    amount * (coinPrices[coinName] || 0) >= 
    amount * (averageCost[coinName] || 0)
      ? "profit"
      : "loss"
  }
>
  {(
  amount *
  (coinPrices[coinName] || 0) - 
  amount *
  (averageCost[coinName] || 0)
) >= 0
  ? "🟢 Profit: +"
  : "🔴 Loss: "}

${Math.abs(
  amount *
    (coinPrices[coinName] || 0) -
    amount *
    (averageCost[coinName] || 0)
).toFixed(2)}
</p>
    </div>

  )
)

  )}

</div>

        <div className="trade-card">

  <h3>📜 Trade History</h3>

  {history.length === 0 ? (

    <p>No trades yet.</p>

  ) : (

    history.map((trade, index) => (

      <div key={index} className="trade-history-item">

        <p>
          {trade.type === "BUY"
            ? "🟢 BUY"
            : "🔴 SELL"}{" "}
          {trade.amount} {trade.coin}
        </p>

        <small>
          ${trade.cost.toLocaleString()}
        </small>

      </div>

    ))

  )}

        </div>

      </div>

    </div>
  );
}

export default TradingPage;