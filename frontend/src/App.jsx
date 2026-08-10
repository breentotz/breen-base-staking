import { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import Dashboard from "./components/Dashboard";
import BuilderReputation from "./components/BuilderReputation";
import TokenPage from "./components/TokenPage";
import StakingPage from "./components/StakingPage";
import NFTPage from "./components/NFTPage";
import PortfolioPage from "./components/PortfolioPage";
import BreenAI from "./components/BreenAI";
import SettingsPage from "./components/SettingsPage";
import ActivityPage from "./components/ActivityPage";
import MarketsPage from "./components/MarketsPage";
import TradingPage from "./components/TradingPage";
import BuilderPassport from "./components/BuilderPassport";
import BuilderAchievements from "./components/BuilderAchievements";
import BuilderTimeline from "./components/BuilderTimeline";
import BuilderActivityFeed from "./components/BuilderActivityFeed";
import Notifications from "./components/Notifications";
import { showNotification } from "./services/notificationService";
import { getActivities } from "./utils/activity";
import "./styles/layout.css";
import "./App.css";

function App() {
  const [wallet, setWallet] = useState("");
  const [notification, setNotification] = useState(null);

  const [activities, setActivities] = useState(() => {
    return getActivities();
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("breenTheme") || "dark";
  });

  const [activePage, setActivePage] = useState("Dashboard");

  function refreshActivities() {
    setActivities(getActivities());
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed.");
        return;
      }

      const provider = new BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      const address = await signer.getAddress();

      console.log("Connected:", address);

      setWallet(address);

    } catch (err) {
      console.error("Wallet Error:", err);
      alert(err.message);
    }
  }
    function toggleTheme() {
  setTheme((currentTheme) =>
    currentTheme === "dark"
      ? "light"
      : "dark"
  );
}

useEffect(() => {
  if (wallet) {
    showNotification(
      "🔵 Wallet Connected — Welcome back to Breen Web3!",
      "success"
    );
  }
}, [wallet]);

function showCustomNotification(
  type,
  icon,
  title,
  message,
  txHash = null
) {

  setNotification({
    type,
    icon,
    title,
    message,
  });

  setActivities((previous) => [
    {
      icon,
      title,
      message,
      time: new Date().toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
}),
txHash,
    },
    ...previous,
  ]);

}

function disconnectWallet() {

  setWallet("");
  localStorage.setItem(
  "breenWalletDisconnected",
  "true"
);

  showNotification(
  "Wallet disconnected successfully.",
  "info"
);

}
  useEffect(() => {
  localStorage.setItem("breenTheme", theme);
}, [theme]);

useEffect(() => {
  if (!window.ethereum) {
    return;
  }

  async function restoreWallet() {
    const disconnected =
  localStorage.getItem(
    "breenWalletDisconnected"
  );

if (disconnected === "true") {
  return;
}
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        setWallet(accounts[0]);

        showNotification("Wallet connected successfully.", "success");
      }
    } catch (error) {
      console.error(
        "Wallet restore error:",
        error
      );
    }
  }


  function handleAccountsChanged(accounts) {
    if (accounts.length > 0) {
      setWallet(accounts[0]);
    } else {
      setWallet("");
    }
  }

  restoreWallet();

  window.ethereum.on(
    "accountsChanged",
    handleAccountsChanged
  );

  return () => {
    window.ethereum.removeListener(
      "accountsChanged",
      handleAccountsChanged
    );
  };
}, []);

  function renderPage() {
  if (activePage === "Token") {
    return <TokenPage wallet={wallet} />;
  }
  if (activePage === "Staking") {
  return (
    <StakingPage
      wallet={wallet}
      showNotification={showNotification}
      refreshActivities={refreshActivities}
    />
  );
}
  if (activePage === "NFTs") {
  return (
    <NFTPage
      wallet={wallet}
      showNotification={showNotification}
    />
  );
}

if (activePage === "Builder Passport") {
  return (
    <BuilderPassport
      wallet={wallet}
    />
  );
}

if (activePage === "Portfolio") {
  return (
    <PortfolioPage
      wallet={wallet}
      showNotification={showNotification}
    />
  );
}
if (activePage === "AI") {
  return <BreenAI wallet={wallet} />;
}
  if (activePage === "Dashboard") {
    
      return wallet ? (
  <Dashboard
    wallet={wallet}
    activities={activities}
    onOpenToken={() => setActivePage("Token")}
    onOpenStaking={() => setActivePage("Staking")}
    onOpenNFTs={() => setActivePage("NFTs")}
    onOpenPortfolio={() => setActivePage("Portfolio")}
  />
) : (
        <div className="welcome-card">
          <h2>Welcome to Breen Web3</h2>

          <p>
            Connect your MetaMask wallet to access your
            BREEN Token, staking, and Web3 tools.
          </p>

        </div>
      );
    }

    if (activePage === "Portfolio") {
      return (
        <div className="page-card">
          <h2>📊 Portfolio</h2>

          <p>
            Your Web3 assets and balances will appear here.
          </p>

          <p className="coming-soon">
            Coming soon 🚀
          </p>
        </div>
      );
    }

    if (activePage === "Markets") {
   return <MarketsPage />;
    }

    if (activePage === "Trading") {
  return <TradingPage />;
}

   if (activePage === "Breen AI") {
  return (
    <BreenAI
      wallet={wallet}
      showNotification={showNotification}
    />
  );
}
if (activePage === "Activity") {
  return (
    <ActivityPage
  activities={activities}
/>
  );
}
    if (activePage === "Settings") {
  return (
    <SettingsPage
      wallet={wallet}
      onDisconnect={disconnectWallet}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}

if (activePage === "Builder Reputation") {
  return (
    <BuilderReputation
      wallet={wallet}
    />
  );
}

if (activePage === "Builder Achievements") {
  return (
    <BuilderAchievements
      wallet={wallet}
    />
  );
}

if (activePage === "Builder Timeline") {
  return (
    <BuilderTimeline
      wallet={wallet}
    />
  );
}

if (activePage === "Builder Activity") {
  return (
    <BuilderActivityFeed />
  );
}

    return (
      <div className="page-card">
        <h2>{activePage}</h2>

        <p>
          This section is under development.
        </p>
      </div>
    );
  }

  return (
    <div className={`web3-app ${theme}`}>
      <Notifications
  notification={notification}
  clearNotification={() =>
    setNotification(null)
  }
/>
      <aside className="sidebar">
        <div className="brand">
          <h2>BREEN WEB3</h2>

          <p>Build on Base</p>
        </div>

        <nav className="nav-menu">
          <button
            className={activePage === "Dashboard" ? "active" : ""}
            onClick={() => setActivePage("Dashboard")}
          >
            🏠 Dashboard
          </button>

          <button
             className={
                activePage === "Builder Passport"
                ? "active"
                : ""
          }
              onClick={() =>
                   setActivePage("Builder Passport")
          }
>
               👤 Builder Passport
              </button>

              <button
  className={
    activePage === "Builder Reputation"
      ? "active"
      : ""
  }
  onClick={() =>
    setActivePage("Builder Reputation")
  }
>
  🏅 Builder Reputation
</button>

<button
  className={
    activePage === "Builder Achievements"
      ? "active"
      : ""
  }
  onClick={() =>
    setActivePage("Builder Achievements")
  }
>
  🏆 Builder Achievements
</button>

<button
  className={
    activePage === "Builder Timeline"
      ? "active"
      : ""
  }
  onClick={() =>
    setActivePage("Builder Timeline")
  }
>
  📜 Builder Timeline
</button>

<button
  className={
    activePage === "Builder Activity"
      ? "active"
      : ""
  }
  onClick={() =>
    setActivePage("Builder Activity")
  }
>
  📋 Builder Journey
</button>

          <button
            className={activePage === "Token" ? "active" : ""}
            onClick={() => setActivePage("Token")}
          >
            🪙 BREEN Token
          </button>

          <button
            className={activePage === "Staking" ? "active" : ""}
            onClick={() => setActivePage("Staking")}
          >
            🏦 Staking
          </button>

          <button
            className={activePage === "NFTs" ? "active" : ""}
            onClick={() => setActivePage("NFTs")}
          >
            🖼️ NFTs
          </button>

          <button
            className={activePage === "Portfolio" ? "active" : ""}
            onClick={() => setActivePage("Portfolio")}
          >
            📊 Portfolio
          </button>

          <button
             className={activePage === "Markets" ? "active" : ""}
             onClick={() => setActivePage("Markets")}
          >
             📈 Markets
            </button>

            <button
              className={activePage === "Trading" ? "active" : ""}
             onClick={() => setActivePage("Trading")}
            >
             💹 Trading
          </button>

          <button
            className={activePage === "Breen AI" ? "active" : ""}
            onClick={() => setActivePage("Breen AI")}
          >
            🤖 Breen AI
          </button>

          <button
             className={activePage === "Activity" ? "active" : ""}
              onClick={() => setActivePage("Activity")}
          >
            📜 Recent Activity
          </button>

          <button
            className={activePage === "Settings" ? "active" : ""}
            onClick={() => setActivePage("Settings")}
          >
            ⚙️ Settings
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{activePage}</h1>

            <p>Breen Web3 Dashboard • Base Sepolia</p>
          </div>

          {!wallet ? (
            <button onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <button
  className="wallet-button"
  onClick={disconnectWallet}
  title="Disconnect Wallet"
>
  {wallet.slice(0, 6)}...{wallet.slice(-4)}
</button>
          )}
        </header>

        <section className="content-area">
          {renderPage()}
        </section>
         <Notifications />
      </main>
    </div>
  );
}
export default App;