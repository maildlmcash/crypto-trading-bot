import { useEffect, useState } from 'react';

interface AdminData {
  portfolio: any;
  strategies: any[];
  riskSettings: any;
  marketSnapshot: any[];
  systemHealth: any;
}

function Admin() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/dashboard');
      const result = await response.json();
      if (result.ok) {
        setAdminData(result.data);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;
  if (!adminData) return <div className="admin-empty">No data available</div>;

  const totalPnl = adminData.portfolio.positions.reduce((sum: number, p: any) => sum + p.pnl, 0);

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <h1>🔧 Admin Dashboard</h1>
        <div className="admin-status">
          <span className="status-badge healthy">System: Healthy</span>
          <span className="status-badge">Last update: {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      <main className="admin-grid">
        {/* Portfolio Overview */}
        <section className="admin-card portfolio-card">
          <h2>📊 Portfolio Overview</h2>
          <div className="portfolio-stats">
            <div className="stat-item">
              <span>Total Balance</span>
              <strong>${adminData.portfolio.balance.toLocaleString()}</strong>
            </div>
            <div className="stat-item">
              <span>USDT Cash</span>
              <strong>${adminData.portfolio.usdt.toLocaleString()}</strong>
            </div>
            <div className="stat-item">
              <span>BTC Holdings</span>
              <strong>{adminData.portfolio.btc.toFixed(4)} BTC</strong>
            </div>
            <div className="stat-item">
              <span>ETH Holdings</span>
              <strong>{adminData.portfolio.eth.toFixed(4)} ETH</strong>
            </div>
            <div className="stat-item pnl">
              <span>Total P&L</span>
              <strong className={totalPnl >= 0 ? 'positive' : 'negative'}>
                ${totalPnl.toFixed(2)}
              </strong>
            </div>
          </div>
        </section>

        {/* Active Positions */}
        <section className="admin-card positions-card">
          <h2>📈 Open Positions</h2>
          <div className="positions-table">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Size</th>
                  <th>Entry</th>
                  <th>Current</th>
                  <th>P&L</th>
                </tr>
              </thead>
              <tbody>
                {adminData.portfolio.positions.map((pos: any) => (
                  <tr key={pos.symbol}>
                    <td className="symbol">{pos.symbol}</td>
                    <td className={`side ${pos.side.toLowerCase()}`}>{pos.side}</td>
                    <td>{pos.size}</td>
                    <td>${pos.entry.toFixed(2)}</td>
                    <td>${pos.currentPrice.toFixed(2)}</td>
                    <td className={pos.pnl >= 0 ? 'positive' : 'negative'}>${pos.pnl.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bot Strategies */}
        <section className="admin-card strategies-card">
          <h2>🤖 Strategy Performance</h2>
          <div className="strategies-list">
            {adminData.strategies.map((strategy: any) => (
              <div key={strategy.id} className="strategy-panel">
                <div className="strategy-header">
                  <div>
                    <h3>{strategy.name}</h3>
                    <p>{strategy.mode}</p>
                  </div>
                  <span className={`status-badge ${strategy.status}`}>{strategy.status.toUpperCase()}</span>
                </div>
                <div className="strategy-metrics">
                  <div className="metric">
                    <span>Daily P&L</span>
                    <strong className={strategy.dailyPnl >= 0 ? 'positive' : 'negative'}>
                      ${strategy.dailyPnl.toFixed(2)}
                    </strong>
                  </div>
                  <div className="metric">
                    <span>Win Rate</span>
                    <strong>{strategy.winRate.toFixed(1)}%</strong>
                  </div>
                  <div className="metric">
                    <span>Trades</span>
                    <strong>{strategy.totalTrades}</strong>
                  </div>
                  <div className="metric">
                    <span>R:R</span>
                    <strong>{strategy.rr}</strong>
                  </div>
                </div>
                <div className="strategy-controls">
                  <button className="control-btn start">Start</button>
                  <button className="control-btn pause">Pause</button>
                  <button className="control-btn stop">Stop</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Risk Settings */}
        <section className="admin-card risk-card">
          <h2>⚠️ Risk Configuration</h2>
          <div className="risk-settings">
            <div className="risk-item">
              <span>Max Daily Loss</span>
              <input type="number" value={adminData.riskSettings.maxDailyLoss} disabled />
              <span>%</span>
            </div>
            <div className="risk-item">
              <span>Leverage Cap</span>
              <input type="number" value={adminData.riskSettings.leverageCap} disabled />
              <span>x</span>
            </div>
            <div className="risk-item">
              <span>Max Position Size</span>
              <input type="number" value={adminData.riskSettings.maxPositionSize} disabled />
              <span>BTC</span>
            </div>
            <div className="risk-item">
              <span>Stop Loss</span>
              <input type="number" value={adminData.riskSettings.stopLossPercent} disabled />
              <span>%</span>
            </div>
            <div className="risk-item">
              <span>Take Profit</span>
              <input type="number" value={adminData.riskSettings.takeProfitPercent} disabled />
              <span>%</span>
            </div>
          </div>
          <button className="edit-btn">Edit Settings</button>
        </section>

        {/* System Health */}
        <section className="admin-card health-card">
          <h2>🏥 System Health</h2>
          <div className="health-metrics">
            <div className="health-item">
              <span>Signal Feed</span>
              <strong className="healthy">{adminData.systemHealth.signalFeed}</strong>
            </div>
            <div className="health-item">
              <span>Execution Latency</span>
              <strong className="healthy">{adminData.systemHealth.executionNode}</strong>
            </div>
            <div className="health-item">
              <span>Risk Engine</span>
              <strong className="healthy">{adminData.systemHealth.riskEngine}</strong>
            </div>
            <div className="health-item">
              <span>Network Latency</span>
              <strong className="healthy">{adminData.systemHealth.latency}</strong>
            </div>
          </div>
        </section>

        {/* Trade Log */}
        <section className="admin-card trades-card">
          <h2>📜 Recent Trades</h2>
          <div className="trades-list">
            {adminData.portfolio.trades.slice(0, 5).map((trade: any) => (
              <div key={trade.id} className="trade-entry">
                <div className="trade-info">
                  <span className="pair">{trade.pair}</span>
                  <span className="time">{trade.time}</span>
                </div>
                <div className="trade-details">
                  <span className={`side ${trade.side.toLowerCase()}`}>{trade.side}</span>
                  <span className="price">${trade.price}</span>
                  <span className="size">× {trade.size}</span>
                  <span className={`status ${trade.status}`}>{trade.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Admin;
