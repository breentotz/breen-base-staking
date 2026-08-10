import { useState } from "react";
function SettingsPage({
  wallet,
  onDisconnect,
  theme,
  onToggleTheme,
}) {
    const [copied, setCopied] = useState(false);

  async function copyWalletAddress() {
    if (!wallet) return;

    try {
      await navigator.clipboard.writeText(wallet);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Unable to copy wallet.");
    }
  }
  return (
    <div className="settings-page">
      <div className="page-title">
        <h2>⚙️ Settings</h2>

        <p>
          Manage your Breen Web3 Dashboard
          preferences.
        </p>
      </div>

      <div className="settings-grid">

        <div className="settings-card">
          <h3>🎨 Appearance</h3>

          <p>
            Current theme:{" "}
            <strong>
              {theme === "dark"
                ? "Dark"
                : "Light"}
            </strong>
          </p>

          <button
            onClick={onToggleTheme}
          >
            {theme === "dark"
              ? "☀️ Use Light Mode"
              : "🌙 Use Dark Mode"}
          </button>
        </div>

        <div className="settings-card">
          <h3>🔗 Network</h3>

          <p>
            Connected network
          </p>

          <div className="network-badge">
            Base Sepolia
          </div>

          <small>
            Chain ID: 84532
          </small>
        </div>

        <div className="settings-card">
          <h3>👛 Wallet</h3>

          {wallet ? (
  <>
    <p>
      Connected wallet
    </p>

    <code>
      {wallet}
    </code>

    <div className="wallet-actions">

      <button
        className="copy-button"
        onClick={copyWalletAddress}
      >
        {copied
          ? "✅ Copied!"
          : "📋 Copy Address"}
      </button>

      <button
        className="danger-button"
        onClick={onDisconnect}
      >
        Disconnect Wallet
      </button>

    </div>
  </>
) : (
            <p>
              No wallet connected.
            </p>
          )}
        </div>

        <div className="settings-card">
          <h3>ℹ️ App Information</h3>

          <p>
            <strong>
              Breen Web3 Dashboard
            </strong>
          </p>

          <p>
            Version 1.0.0
          </p>

          <small>
            Built on Base Sepolia with
            BREEN Token, Breen Vault,
            Breen Genesis NFTs, and
            Breen AI.
          </small>
        </div>

      </div>
    </div>
  );
}

export default SettingsPage;