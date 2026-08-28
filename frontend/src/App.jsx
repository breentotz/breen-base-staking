import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import BuilderReputation from "./components/BuilderReputation";
import TokenPage from "./components/TokenPage";
import StakingPage from "./components/StakingPage";
import NFTPage from "./components/NFTPage";
import MintNFTPage from "./components/MintNFTPage";
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
import { addActivity } from "./utils/activity";
import { awardXP } from "./services/builderEngine";
import "./styles/layout.css";
import "./App.css";

import {
  Users,
  CheckCircle2,
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  LogOut,
  Radio,
  Activity,
  Blocks,
  Sparkles,
  Settings as SettingsIcon,
  LayoutDashboard,
  UserRoundCheck,
  Medal,
  Trophy,
  ScrollText,
  Route,
  Coins,
  Landmark,
  Image,
  WalletCards,
  ArrowLeftRight,
  Bot,  
} from "lucide-react";

function App() {
  const [wallet, setWallet] = useState("");
  const [notification, setNotification] = useState(null);
  const [checkInReward, setCheckInReward] = useState(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  const pulseItems = [
  {
    label: "BUILDER SIGNAL",
    title:
      "Builders are shaping the next onchain economy.",
    subtitle:
      "Base ecosystem • Breen Web3 • Builder infrastructure",
  },
  {
    label: "BASE SIGNAL",
    title:
      "Base is becoming infrastructure for the next generation of onchain apps.",
    subtitle:
      "Builders • Agents • Payments • Onchain activity",
  },
  {
    label: "BREEN SIGNAL",
    title:
      "Your Builder reputation grows through real activity.",
    subtitle:
      "XP • Achievements • NFTs • Staking • Onchain identity",
  },
  {
    label: "NETWORK SIGNAL",
    title:
      "Your Builder journey is connected to Base Sepolia.",
    subtitle:
      "Build • Deploy • Stake • Mint • Grow",
  },
];

const [pulseIndex, setPulseIndex] =
  useState(0);

  const [totalBuilders, setTotalBuilders] = useState(() => {
  try {
    const builders = JSON.parse(
      localStorage.getItem("breen_connected_builders") || "[]"
    );

    return builders.length;
  } catch {
    return 0;
  }
});

  const [activities, setActivities] =
  useState([]);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("breenTheme") || "dark";
  });

  const [activePage, setActivePage] = useState("Dashboard");

  const [navOpen, setNavOpen] = useState(() => {
  try {
    const saved =
      localStorage.getItem("breen_nav_open");

    return saved
      ? JSON.parse(saved)
      : {
          builder: true,
          onchain: true,
          explore: true,
          intelligence: true,
        };
  } catch {
    return {
      builder: true,
      onchain: true,
      explore: true,
      intelligence: true,
    };
  }
});


const [sidebarCollapsed, setSidebarCollapsed] =
  useState(() => {
    return (
      localStorage.getItem(
        "breen_sidebar_collapsed"
      ) === "true"
    );
  });

  const [walletMenuOpen, setWalletMenuOpen] =
  useState(false);

function toggleNavSection(section) {
  setNavOpen((current) => {
    const isAlreadyOpen = current[section];

    return {
      builder: false,
      onchain: false,
      explore: false,
      intelligence: false,
      [section]: !isAlreadyOpen,
    };
  });
}

  function refreshActivities() {
  setActivities(
    wallet ? getActivities(wallet) : []
  );
}


function handleDailyCheckIn() {
  if (!wallet) {
    return;
  }

  const xpResult = awardXP(
    "DAILY_LOGIN",
    wallet
  );

  if (xpResult.earnedXP > 0) {
    addActivity(
      "checkin",
      "Daily Builder Check-In",
      `Builder checked in and earned ${xpResult.earnedXP} XP.`,
      xpResult.earnedXP,
      null,
      wallet
    );

    refreshActivities();

    setCheckInReward({
  xp: xpResult.earnedXP,
  wallet,
});

setHasCheckedInToday(true);

showNotification(
      `🔥 Daily Check-In complete! +${xpResult.earnedXP} Builder XP`,
      "achievement"
    );

    return;
  }

  if (
    xpResult.reason ===
    "already_checked_in"
  ) {
    showNotification(
      "✅ You already checked in today. Come back tomorrow!",
      "info"
    );
  }
}

function registerBuilder(address) {
  if (!address) return;

  const normalizedAddress = address.toLowerCase();

  let builders = [];

  try {
    builders = JSON.parse(
      localStorage.getItem("breen_connected_builders") || "[]"
    );
  } catch {
    builders = [];
  }

  const alreadyRegistered = builders.some(
    (builder) => builder.toLowerCase() === normalizedAddress
  );

  if (!alreadyRegistered) {
    builders.push(normalizedAddress);

    localStorage.setItem(
      "breen_connected_builders",
      JSON.stringify(builders)
    );
  }

  setTotalBuilders(builders.length);
}

  async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No wallet account was returned.");
    }

    const address = accounts[0];

    console.log("Connected:", address);

    localStorage.removeItem("breenWalletDisconnected");

    setWallet(address);
registerBuilder(address);

showNotification(
  "Wallet connected successfully.",
  "success"
);

  } catch (err) {
    console.error("Wallet Error:", err);

    const rejected =
      err.code === 4001 ||
      err.code === "ACTION_REJECTED";

    if (rejected) {
      alert("Wallet connection request was rejected.");
    } else {
      alert(err.message || "Unable to connect wallet.");
    }
  }
}
    function toggleTheme() {
  setTheme((currentTheme) =>
    currentTheme === "dark"
      ? "light"
      : "dark"
  );
}



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
  if (!wallet) {
    setHasCheckedInToday(false);
    return;
  }

  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const today = `${year}-${month}-${day}`;

  const normalizedWallet = wallet.toLowerCase();

  const dailyCheckInKey =
    `breen_daily_checkin_${normalizedWallet}`;

  const lastCheckIn =
    localStorage.getItem(dailyCheckInKey);

  setHasCheckedInToday(lastCheckIn === today);
}, [wallet]);

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
  const restoredAddress = accounts[0];

  setWallet(restoredAddress);
  registerBuilder(restoredAddress);
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
    const newAddress = accounts[0];

    console.log("MetaMask account changed:", newAddress);

localStorage.removeItem("breenWalletDisconnected");

setWallet(newAddress);
registerBuilder(newAddress);

refreshActivities();


  } else {
    console.log("MetaMask disconnected.");

    localStorage.setItem(
      "breenWalletDisconnected",
      "true"
    );

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

useEffect(() => {
  if (wallet) {
    setActivities(getActivities(wallet));
  } else {
    setActivities([]);
  }
}, [wallet]);

useEffect(() => {
  localStorage.setItem(
    "breen_nav_open",
    JSON.stringify(navOpen)
  );
}, [navOpen]);

useEffect(() => {
  localStorage.setItem(
    "breen_sidebar_collapsed",
    sidebarCollapsed
  );
}, [sidebarCollapsed]);

useEffect(() => {
  const interval = setInterval(() => {
    setPulseIndex((current) =>
      (current + 1) % pulseItems.length
    );
  }, 6000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  function handleClickOutside(event) {
    const walletMenu =
      document.querySelector(
        ".wallet-menu-wrapper"
      );

    if (
      walletMenuOpen &&
      walletMenu &&
      !walletMenu.contains(event.target)
    ) {
      setWalletMenuOpen(false);
    }
  }

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, [walletMenuOpen]);

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
  return (
    <Dashboard
      wallet={wallet}
      activities={activities}
      onOpenToken={() => setActivePage("Token")}
      onOpenStaking={() => setActivePage("Staking")}
      onOpenNFTs={() => setActivePage("NFTs")}
      onOpenPortfolio={() => setActivePage("Portfolio")}
    />
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
    <ActivityPage wallet={wallet} />
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
    <BuilderActivityFeed wallet={wallet} />
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

if (activePage === "Mint NFT") {
  return (
    <MintNFTPage
      wallet={wallet}
    />
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
      <aside
  className={`sidebar ${
    sidebarCollapsed
      ? "sidebar-collapsed"
      : ""
  }`}
>
        <div className="brand sidebar-brand">
  <div className="sidebar-brand-text">
    <h2>
      {sidebarCollapsed
        ? "B"
        : "BREEN WEB3"}
    </h2>

    {!sidebarCollapsed && (
      <p>Build on Base</p>
    )}
  </div>

  <button
    type="button"
    className="sidebar-collapse-btn"
    onClick={() =>
      setSidebarCollapsed(
        (current) => !current
      )
    }
    title={
      sidebarCollapsed
        ? "Expand sidebar"
        : "Collapse sidebar"
    }
  >
    {sidebarCollapsed ? "›" : "‹"}
  </button>
</div>

        
      <nav className="nav-menu redesigned-nav">

  <div className="nav-section">
    <button
  type="button"
  className="nav-section-toggle"
  onClick={() =>
    toggleNavSection("builder")
  }
>
  <span>BUILDER</span>

  <span className="nav-section-arrow">
  {navOpen.builder ? "⌄" : "›"}
</span>
</button>

{navOpen.builder && (
  <div className="nav-section-items">

    <button
      className={
        activePage === "Dashboard"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Dashboard")
      }
    >
      <span className="nav-icon">
  <LayoutDashboard size={18} strokeWidth={1.8} />
</span>
      <span>Dashboard</span>
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
      <span className="nav-icon">
  <UserRoundCheck size={18} strokeWidth={1.8} />
</span>
      <span>Builder Passport</span>
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
      <span className="nav-icon">
  <Medal size={18} strokeWidth={1.8} />
</span>
      <span>Reputation</span>
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
      <span className="nav-icon">
  <Trophy size={18} strokeWidth={1.8} />
</span>
      <span>Achievements</span>
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
      <span className="nav-icon">
  <ScrollText size={18} strokeWidth={1.8} />
</span>
      <span>Timeline</span>
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
      <span className="nav-icon">
  <Route size={18} strokeWidth={1.8} />
</span>
           <span>Builder Journey</span>
    </button>

  </div>
)}
  </div>


  <div className="nav-section">
    <button
  type="button"
  className="nav-section-toggle"
  onClick={() =>
    toggleNavSection("onchain")
  }
>
  <span>ONCHAIN</span>

  <span className="nav-section-arrow">
    {navOpen.onchain ? "⌄" : "›"}
  </span>
</button>

{navOpen.onchain && (
  <div className="nav-section-items">

    <button
      className={
        activePage === "Token"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Token")
      }
    >
      <span className="nav-icon">
  <Coins size={18} strokeWidth={1.8} />
</span>
      <span>BREEN Token</span>
    </button>

    <button
      className={
        activePage === "Staking"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Staking")
      }
    >
      <span className="nav-icon">
  <Landmark size={18} strokeWidth={1.8} />
</span>
      <span>Staking</span>
    </button>

    <button
      className={
        activePage === "NFTs"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("NFTs")
      }
    >
      <span className="nav-icon">
  <Image size={18} strokeWidth={1.8} />
</span>
      <span>NFTs</span>
    </button>

    <button
      className={
        activePage === "Mint NFT"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Mint NFT")
      }
    >
      <span className="nav-icon">
  <Sparkles size={18} strokeWidth={1.8} />
</span>
      <span>Mint NFT</span>
    </button>

    <button
      className={
        activePage === "Portfolio"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Portfolio")
      }
    >
      <span className="nav-icon">
  <WalletCards size={18} strokeWidth={1.8} />
</span>
            <span>Portfolio</span>
    </button>

  </div>
)}
  </div>


  <div className="nav-section">
    <button
  type="button"
  className="nav-section-toggle"
  onClick={() =>
    toggleNavSection("explore")
  }
>
  <span>EXPLORE</span>

  <span className="nav-section-arrow">
    {navOpen.explore ? "⌄" : "›"}
  </span>
</button>

{navOpen.explore && (
  <div className="nav-section-items">

    <button
      className={
        activePage === "Markets"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Markets")
      }
    >
      <span className="nav-icon">📈</span>
      <span>Markets</span>
    </button>

    <button
      className={
        activePage === "Trading"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Trading")
      }
    >
      <span className="nav-icon">
  <ArrowLeftRight size={18} strokeWidth={1.8} />
</span>
      <span>Trading Terminal</span>
    </button>
      </div>
)}
  </div>


  <div className="nav-section">
    <button
  type="button"
  className="nav-section-toggle"
  onClick={() =>
    toggleNavSection("intelligence")
  }
>
  <span>INTELLIGENCE</span>

  <span className="nav-section-arrow">
    {navOpen.intelligence ? "⌄" : "›"}
  </span>
</button>

{navOpen.intelligence && (
  <div className="nav-section-items">

    <button
      className={
        activePage === "Breen AI"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Breen AI")
      }
    >
      <span className="nav-icon">
  <Bot size={18} strokeWidth={1.8} />
</span>
      <span>Breen AI</span>
    </button>

    <button
      className={
        activePage === "Activity"
          ? "active"
          : ""
      }
      onClick={() =>
        setActivePage("Activity")
      }
    >
      <span className="nav-icon">📜</span>
      <span>Recent Activity</span>
    </button>
  </div>
)}
  </div>
  
</nav>


      </aside>

      <main className="main-content">
        <header className="topbar premium-topbar">

  <div className="topbar-heading">
    <div className="topbar-title-row">
      <div className="topbar-title-icon">
        <Blocks size={20} />
      </div>

      <div>
        <h1>{activePage}</h1>

        <p>
          Breen Web3 Builder Platform
          <span className="topbar-separator">
            •
          </span>
          Base Sepolia
        </p>
      </div>
    </div>
  </div>


  {!wallet ? (
    <button
      type="button"
      className="topbar-connect-button"
      onClick={connectWallet}
    >
      <Wallet size={17} />

      <span>
        Connect Wallet
      </span>
    </button>
  ) : (
    <div className="topbar-wallet-actions">

      <div className="builder-count-badge premium-header-chip">
        <Users size={16} />

        <span>
          {totalBuilders}{" "}
          {totalBuilders === 1
            ? "Builder"
            : "Builders"}
        </span>
      </div>


      <button
        type="button"
        className={`daily-checkin-button premium-header-chip ${
          hasCheckedInToday
            ? "checked-in"
            : ""
        }`}
        onClick={handleDailyCheckIn}
        disabled={hasCheckedInToday}
      >
        {hasCheckedInToday ? (
          <CheckCircle2 size={16} />
        ) : (
          <Sparkles size={16} />
        )}

        <span>
          {hasCheckedInToday
            ? "Checked In"
            : "Daily Check-In"}
        </span>
      </button>


      <div className="wallet-menu-wrapper">

        <button
          type="button"
          className="wallet-button premium-wallet-button"
          onClick={() =>
            setWalletMenuOpen(
              (current) => !current
            )
          }
          aria-expanded={walletMenuOpen}
        >
          <Wallet size={16} />

          <span>
            {wallet.slice(0, 6)}
            ...
            {wallet.slice(-4)}
          </span>

          <ChevronDown
            size={15}
            className={`wallet-chevron ${
              walletMenuOpen
                ? "open"
                : ""
            }`}
          />
        </button>


        {walletMenuOpen && (
          <div className="wallet-dropdown">

            <div className="wallet-dropdown-header">

              <div className="wallet-dropdown-title">
                <Wallet size={16} />

                <span>
                  Connected Wallet
                </span>
              </div>

              <strong>
                {wallet.slice(0, 6)}
                ...
                {wallet.slice(-4)}
              </strong>

            </div>


            <div className="wallet-dropdown-network">
              <Radio size={14} />

              <span>
                Base Sepolia
              </span>

              <span className="network-dot" />
            </div>


            <button
              type="button"
              className="wallet-dropdown-action"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    wallet
                  );

                  showNotification(
                    "Wallet address copied.",
                    "success"
                  );
                } catch (err) {
                  console.error(
                    "Copy wallet address error:",
                    err
                  );

                  showNotification(
                    "Unable to copy wallet address.",
                    "error"
                  );
                }
              }}
            >
              <Copy size={15} />

              <span>
                Copy Address
              </span>
            </button>


            <button
              type="button"
              className="wallet-dropdown-action"
              onClick={() => {
                window.open(
                  `https://sepolia.basescan.org/address/${wallet}`,
                  "_blank",
                  "noopener,noreferrer"
                );

                setWalletMenuOpen(false);
              }}
            >
              <ExternalLink size={15} />

              <span>
                View on BaseScan
              </span>
            </button>


            <button
  type="button"
  className="wallet-dropdown-action"
  onClick={() => {
    setActivePage("Settings");
    setWalletMenuOpen(false);
  }}
>
  <SettingsIcon size={15} />

  <span>Settings</span>
</button>


            <button
              type="button"
              className="wallet-dropdown-action danger"
              onClick={() => {
                setWalletMenuOpen(false);

                disconnectWallet();
              }}
            >
              <LogOut size={15} />

              <span>
                Disconnect Wallet
              </span>
            </button>

          </div>
        )}

      </div>

    </div>
  )}

</header>

        <section className="content-area">

      {activePage !== "Staking" &&
 activePage !== "Mint NFT" &&
 activePage !== "NFTs" &&
 activePage !== "Builder Activity" &&
 activePage !== "Builder Passport" &&
 activePage !== "Builder Reputation" && (
    <div className="base-builder-pulse">
    <div className="base-builder-pulse-glow" />

    <div className="base-builder-pulse-content">

      <div className="base-builder-pulse-left">

        <div className="pulse-live-icon">
          <Radio size={17} />
        </div>

        <div className="pulse-copy">

          <div className="pulse-eyebrow">
            <span>BASE BUILDER PULSE</span>

            <span className="pulse-live-status">
              <span className="pulse-live-dot" />
              LIVE
            </span>
          </div>

          <div
  className="pulse-message pulse-message-animated"
  key={pulseIndex}
>
  <strong>
    {pulseItems[pulseIndex].title}
  </strong>

  <span>
    {pulseItems[pulseIndex].subtitle}
  </span>
</div>

        </div>

      </div>


      <div className="pulse-controls">

  <div className="pulse-signal">
    <Activity size={16} />

    <span>
      {pulseItems[pulseIndex].label}
    </span>
  </div>


  <div className="pulse-navigation">

    <span className="pulse-counter">
      {String(pulseIndex + 1).padStart(2, "0")}
      {" / "}
      {String(pulseItems.length).padStart(2, "0")}
    </span>


    <button
      type="button"
      className="pulse-nav-button"
      onClick={() =>
        setPulseIndex((current) =>
          current === 0
            ? pulseItems.length - 1
            : current - 1
        )
      }
      aria-label="Previous pulse"
    >
      ‹
    </button>


    <button
      type="button"
      className="pulse-nav-button"
      onClick={() =>
        setPulseIndex((current) =>
          (current + 1) % pulseItems.length
        )
      }
      aria-label="Next pulse"
    >
      ›
    </button>

  </div>

</div>

    </div>

    <div className="pulse-progress">
      <div className="pulse-progress-line" />
    </div>
  </div>

)}
  {renderPage()}

</section>

        {checkInReward && (
  <div
    className="checkin-celebration-backdrop"
    onClick={() => setCheckInReward(null)}
  >
    <div
      className="checkin-celebration-card"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="checkin-celebration-icon">
        ⚡
      </div>

      <h1>
        +{checkInReward.xp} XP
      </h1>

      <h2>
        🔥 Daily Check-In Complete
      </h2>

      <p>
        Let&apos;s go building today,{" "}
        {checkInReward.wallet?.toLowerCase() ===
        "0x06d71eed44d152d88e6769afbb7cb3bbba2471d0"
          ? "Breen"
          : "Builder"}
        ! 🚀
      </p>

      <button
        type="button"
        onClick={() => setCheckInReward(null)}
      >
        Let&apos;s Build
      </button>
    </div>
  </div>
)}


         <Notifications />
      </main>
    </div>
  );
}
export default App;