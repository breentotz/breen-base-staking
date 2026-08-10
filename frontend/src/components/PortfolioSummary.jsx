function PortfolioSummary({
  balance,
  assetsOwned,
  portfolioValue,
  netWorth,
  holdings,
  averageCost,
}) {
  const totalCost = Object.entries(holdings).reduce(
    (total, [coinName, amount]) =>
      total + amount * (averageCost[coinName] || 0),
    0
  );

  const totalProfitLoss = portfolioValue - totalCost;

  return (
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

        <h2 className={totalProfitLoss >= 0 ? "profit" : "loss"}>
          {totalProfitLoss >= 0 ? "🟢 +" : "🔴 -"}$
          {Math.abs(totalProfitLoss).toFixed(2)}
        </h2>

        <small>Total Unrealized P/L</small>
      </div>

    </div>
  );
}

export default PortfolioSummary;