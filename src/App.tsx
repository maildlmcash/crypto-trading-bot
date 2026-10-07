import { useEffect, useMemo, useState } from "react";
import {
  botStatuses,
  chartSeries,
  marketRows,
  metrics,
  positions,
  strategyCards,
  tradeLog,
  watchlist,
} from "./data/mockData";

type TabKey = "overview" | "scanner" | "strategies" | "portfolio" | "admin";

type AdminSnapshot = {
  portfolio?: {
    balance?: number;
    usdt?: number;
    btc?: number;
    eth?: number;
    positions?: Array<{ symbol: string; side: string; size: number | string; entry: number; currentPrice?: number; pnl: number }>;
    trades?: Array<{ id: number; pair: string; side: string; price: number | string; size: number; time: string; status: string }>;
  };
  strategies?: Array<{ id: string; name: string; status: string; mode: string; rr: string; dailyPnl: number; totalTrades: number; winRate: number }>;
  riskSettings?: {
    maxDailyLoss?: number;
    leverageCap?: number;
    maxPositionSize?: number;
    stopLossPercent?: number;
    takeProfitPercent?: number;
  };
  marketSnapshot?: Array<{ symbol: string; price: number; dayChange: number; volume: number; signal: string; hourChange: number; exchange: string }>;
  systemHealth?: {
    signalFeed?: string;
    executionNode?: string;
    riskEngine?: string;
    latency?: string;
  };
};

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [feedTick, setFeedTick] = useState(0);
  const [adminData, setAdminData] = useState<AdminSnapshot | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setFeedTick((t) => t + 1), 2500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/admin/dashboard");
        if (!res.ok) return;
        const body = await res.json();
        if (body?.ok) setAdminData(body.data);
      } catch {
        // Graceful fallback to mock data if the backend is not running.
      }
    };

    loadAdmin();
    const interval = window.setInterval(loadAdmin, 6000);
    return () => window.clearInterval(interval);
  }, []);

  const marketList = useMemo(() => {
    const remote = adminData?.marketSnapshot ?? [];
    if (remote.length > 0) return remote;
    return marketRows.map((row) => ({
      symbol: row.symbol,
      price: row.price,
      dayChange: row.dayChange,
      volume: row.volume,
      signal: row.signal,
      hourChange: row.hourChange,
      exchange: row.exchange,
    }));
  }, [adminData]);

  const activeMarket = useMemo(
    () => marketList.find((row) => row.symbol === selectedSymbol) ?? marketList[0] ?? marketRows[0],
    [marketList, selectedSymbol],
  );

  const selectedChart = chartSeries[selectedSymbol] ?? chartSeries["BTC/USDT"];

  const portfolioPositions = useMemo(() => {
    if (adminData?.portfolio?.positions?.length) return adminData.portfolio.positions;
    return positions.map((pos) => ({
      symbol: pos.symbol,
      side: pos.side,
      size: pos.size,
      entry: pos.entry,
      currentPrice: pos.entry + (pos.pnl > 0 ? 12 : -12),
      pnl: pos.pnl,
    }));
  }, [adminData]);

  const strategyList = useMemo(() => {
    if (adminData?.strategies?.length) return adminData.strategies;
    return strategyCards.map((strategy) => ({
      id: strategy.name.toLowerCase().replace(/\s+/g, "-"),
      name: strategy.name,
      status: strategy.status,
      mode: strategy.mode,
      rr: strategy.rr,
      dailyPnl: strategy.system * 2.3,
      totalTrades: 12,
      winRate: strategy.system,
    }));
  }, [adminData]);

  const totalPnl = portfolioPositions.reduce((sum, item) => sum + Number(item.pnl || 0), 0);

  const handleTradeAction = async (type: "buy" | "sell") => {
    try {
      await fetch("http://localhost:3001/api/trade/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedSymbol,
          side: type,
          size: 0.1,
          price: activeMarket.price,
        }),
      });
    } catch {
      // Silent in mock mode; app remains usable.
    }
  };

  const renderOverview = () => (
    <>
      <section className="hero-panel panel">
        <div className="hero-header">
          <div>
            <div className="eyebrow accent">LIVE MARKET</div>
            <h1>AI-driven crypto execution desk</h1>
          </div>
          <div className="status-pill">
            <span className="status-dot" />
            Feed live • {feedTick}s
          </div>
        </div>

        <div className="metric-grid">
          {metrics.map((metric) => (
            <div key={metric.label} className="metric-card">
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">{metric.value}</div>
              <div className={metric.positive ? "metric-delta positive" : "metric-delta negative"}>
                {metric.delta}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-grid">
        <div className="panel scanner-panel">
          <div className="panel-header">
            <div>
              <div className="eyebrow">MARKET SCANNER</div>
              <h2>Top movers</h2>
            </div>
            <button className="ghost-button small">Filters</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pair</th>
                  <th>Price</th>
                  <th>1H</th>
                  <th>24H</th>
                  <th>Volume</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {marketList.map((row) => (
                  <tr
                    key={row.symbol}
                    className={row.symbol === selectedSymbol ? "selected-row" : ""}
                    onClick={() => setSelectedSymbol(row.symbol)}
                  >
                    <td className="pair-cell">
                      <div className="coin-stack">
                        <span className="coin-badge">{row.symbol.slice(0, 1)}</span>
                        <div>
                          <div className="coin-name">{row.symbol}</div>
                          <div className="coin-meta">{row.exchange ?? "Market"}</div>
                        </div>
                      </div>
                    </td>
                    <td>${Number(row.price).toFixed(2)}</td>
                    <td className={Number(row.hourChange) >= 0 ? "positive" : "negative"}>
                      {Number(row.hourChange).toFixed(2)}%
                    </td>
                    <td className={Number(row.dayChange) >= 0 ? "positive" : "negative"}>
                      {Number(row.dayChange).toFixed(2)}%
                    </td>
                    <td>${Number(row.volume).toLocaleString()}</td>
                    <td>
                      <span className={`signal-pill ${String(row.signal).toLowerCase()}`}>{row.signal}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-stack">
          <div className="panel live-panel">
            <div className="panel-header compact">
              <div>
                <div className="eyebrow">SELECTED</div>
                <h2>{activeMarket.symbol}</h2>
              </div>
              <span className="mini-tag live">LIVE</span>
            </div>

            <div className="live-price-row">
              <div className="big-price">${Number(activeMarket.price).toFixed(2)}</div>
              <div className={Number(activeMarket.dayChange) >= 0 ? "positive" : "negative"}>
                {Number(activeMarket.dayChange).toFixed(2)}%
              </div>
            </div>

            <div className="sparkline" aria-label="Price trend">
              {selectedChart.map((value, index) => (
                <span
                  key={`${selectedSymbol}-${value}-${index}`}
                  style={{ height: `${value}%` }}
                  className={index > selectedChart.length / 2 ? "bar-up" : "bar-neutral"}
                />
              ))}
            </div>

            <div className="mini-stats">
              <div>
                <span>24H Vol</span>
                <strong>${Number(activeMarket.volume).toLocaleString()}</strong>
              </div>
              <div>
                <span>Risk</span>
                <strong>Low</strong>
              </div>
              <div>
                <span>Bias</span>
                <strong className={Number(activeMarket.dayChange) >= 0 ? "positive" : "negative"}>
                  {Number(activeMarket.dayChange) >= 0 ? "Bullish" : "Bearish"}
                </strong>
              </div>
            </div>

            <div className="trade-action-row">
              <button className="primary-button small-button" onClick={() => handleTradeAction("buy")}>Buy</button>
              <button className="ghost-button small-button" onClick={() => handleTradeAction("sell")}>Sell</button>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header compact">
              <div>
                <div className="eyebrow">PREDICTION</div>
                <h2>Signal engine</h2>
              </div>
            </div>

            <div className="signal-list">
              {watchlist.map((item) => (
                <div key={item.symbol} className="prediction-card">
                  <div className="prediction-topline">
                    <span>{item.symbol}</span>
                    <span className={item.bias === "Bullish" ? "positive" : "negative"}>{item.bias}</span>
                  </div>
                  <div className="prediction-score">{item.confidence}%</div>
                  <div className="progress-bar">
                    <span style={{ width: `${item.confidence}%` }} />
                  </div>
                  <div className="prediction-foot">{item.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel">
          <div className="panel-header compact">
            <div>
              <div className="eyebrow">BOT</div>
              <h2>Global strategy suite</h2>
            </div>
          </div>

          <div className="strategy-grid">
            {strategyList.map((strategy) => (
              <div key={strategy.id ?? strategy.name} className="strategy-card">
                <div className="strategy-topline">
                  <div>
                    <div className="strategy-name">{strategy.name}</div>
                    <div className="strategy-meta">{strategy.mode}</div>
                  </div>
                  <span className={`mini-tag ${String(strategy.status).toLowerCase()}`}>
                    {String(strategy.status).toUpperCase()}
                  </span>
                </div>
                <div className="strategy-stats">
                  <span>RR: {strategy.rr}</span>
                  <span>{strategy.winRate ?? strategy.totalTrades} pts</span>
                </div>
                <div className="progress-bar small-bar">
                  <span style={{ width: `${Math.min(100, strategy.winRate ?? 60)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header compact">
            <div>
              <div className="eyebrow">RISK</div>
              <h2>Strategy control</h2>
            </div>
          </div>

          <div className="command-stack">
            <div className="command-card">
              <span>Max daily loss</span>
              <strong>{adminData?.riskSettings?.maxDailyLoss ?? 1.8}%</strong>
            </div>
            <div className="command-card">
              <span>Leverage cap</span>
              <strong>{adminData?.riskSettings?.leverageCap ?? 3.5}x</strong>
            </div>
            <div className="command-card">
              <span>Order guard</span>
              <strong>Enabled</strong>
            </div>
            <div className="command-card">
              <span>Execution</span>
              <strong>Paper</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <div className="panel-header compact">
            <div>
              <div className="eyebrow">PORTFOLIO</div>
              <h2>Open positions</h2>
            </div>
          </div>

          <div className="position-list">
            {portfolioPositions.map((pos) => (
              <div key={`${pos.symbol}-${pos.side}`} className="position-row">
                <div className="pair-cell">
                  <span className="coin-badge alt">{String(pos.symbol).slice(0, 1)}</span>
                  <div>
                    <div className="coin-name">{pos.symbol}</div>
                    <div className="coin-meta">{pos.side}</div>
                  </div>
                </div>
                <div>{String(pos.size)}</div>
                <div>${Number(pos.entry).toFixed(2)}</div>
                <div className={Number(pos.pnl) >= 0 ? "positive" : "negative"}>${Number(pos.pnl).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header compact">
            <div>
              <div className="eyebrow">LOG</div>
              <h2>Trade feed</h2>
            </div>
          </div>

          <div className="trade-log">
            {tradeLog.map((entry) => (
              <div key={entry.id} className="log-row">
                <div>
                  <div className="log-pair">{entry.pair}</div>
                  <div className="log-time">{entry.time}</div>
                </div>
                <div className={`log-side ${entry.side.toLowerCase()}`}>{entry.side}</div>
                <div className="log-price">{entry.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel monitor-panel">
        <div className="panel-header compact">
          <div>
            <div className="eyebrow">SYSTEM</div>
            <h2>Bot health</h2>
          </div>
        </div>

        <div className="monitor-grid">
          {botStatuses.map((item) => (
            <div key={item.name} className="monitor-card">
              <div className="monitor-label">{item.name}</div>
              <div className="monitor-value">{item.value}</div>
              <div className={item.healthy ? "positive" : "negative"}>{item.state}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderAdmin = () => {
    const portfolio = adminData?.portfolio ?? {
      balance: 10000,
      usdt: 5000,
      btc: 0.25,
      eth: 2.5,
      positions: portfolioPositions,
      trades: tradeLog.map((entry) => ({
        id: entry.id,
        pair: entry.pair,
        side: entry.side,
        price: entry.price,
        size: 0.1,
        time: entry.time,
        status: "filled",
      })),
    };

    const strategies = strategyList;
    const risk = adminData?.riskSettings ?? { maxDailyLoss: 1.8, leverageCap: 3.5, maxPositionSize: 0.5, stopLossPercent: 5, takeProfitPercent: 10 };
    const system = adminData?.systemHealth ?? { signalFeed: "99.2%", executionNode: "12 ms", riskEngine: "Stable", latency: "112 ms" };

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
          <section className="admin-card portfolio-card">
            <h2>📊 Portfolio Overview</h2>
            <div className="portfolio-stats">
              <div className="stat-item">
                <span>Total Balance</span>
                <strong>${Number(portfolio.balance).toLocaleString()}</strong>
              </div>
              <div className="stat-item">
                <span>USDT Cash</span>
                <strong>${Number(portfolio.usdt).toLocaleString()}</strong>
              </div>
              <div className="stat-item">
                <span>BTC Holdings</span>
                <strong>{Number(portfolio.btc).toFixed(4)} BTC</strong>
              </div>
              <div className="stat-item">
                <span>ETH Holdings</span>
                <strong>{Number(portfolio.eth).toFixed(4)} ETH</strong>
              </div>
              <div className="stat-item pnl">
                <span>Total P&L</span>
                <strong className={totalPnl >= 0 ? "positive" : "negative"}>${totalPnl.toFixed(2)}</strong>
              </div>
            </div>
          </section>

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
                  {portfolioPositions.map((pos, index) => (
                    <tr key={`${pos.symbol}-${index}`}>
                      <td className="symbol">{pos.symbol}</td>
                      <td className={`side ${String(pos.side).toLowerCase()}`}>{pos.side}</td>
                      <td>{String(pos.size)}</td>
                      <td>${Number(pos.entry).toFixed(2)}</td>
                      <td>${Number(pos.currentPrice ?? pos.entry).toFixed(2)}</td>
                      <td className={Number(pos.pnl) >= 0 ? "positive" : "negative"}>${Number(pos.pnl).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-card strategies-card">
            <h2>🤖 Strategy Performance</h2>
            <div className="strategies-list">
              {strategies.map((strategy) => (
                <div key={strategy.id ?? strategy.name} className="strategy-panel">
                  <div className="strategy-header">
                    <div>
                      <h3>{strategy.name}</h3>
                      <p>{strategy.mode}</p>
                    </div>
                    <span className={`status-badge ${String(strategy.status).toLowerCase()}`}>
                      {String(strategy.status).toUpperCase()}
                    </span>
                  </div>
                  <div className="strategy-metrics">
                    <div className="metric">
                      <span>Daily P&L</span>
                      <strong className={Number(strategy.dailyPnl ?? 0) >= 0 ? "positive" : "negative"}>
                        ${Number(strategy.dailyPnl ?? 0).toFixed(2)}
                      </strong>
                    </div>
                    <div className="metric">
                      <span>Win Rate</span>
                      <strong>{Number(strategy.winRate ?? 0).toFixed(1)}%</strong>
                    </div>
                    <div className="metric">
                      <span>Trades</span>
                      <strong>{strategy.totalTrades ?? 0}</strong>
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

          <section className="admin-card risk-card">
            <h2>⚠️ Risk Configuration</h2>
            <div className="risk-settings">
              <div className="risk-item">
                <span>Max Daily Loss</span>
                <input type="number" value={risk.maxDailyLoss ?? 1.8} disabled />
                <span>%</span>
              </div>
              <div className="risk-item">
                <span>Leverage Cap</span>
                <input type="number" value={risk.leverageCap ?? 3.5} disabled />
                <span>x</span>
              </div>
              <div className="risk-item">
                <span>Max Position Size</span>
                <input type="number" value={risk.maxPositionSize ?? 0.5} disabled />
                <span>BTC</span>
              </div>
              <div className="risk-item">
                <span>Stop Loss</span>
                <input type="number" value={risk.stopLossPercent ?? 5} disabled />
                <span>%</span>
              </div>
              <div className="risk-item">
                <span>Take Profit</span>
                <input type="number" value={risk.takeProfitPercent ?? 10} disabled />
                <span>%</span>
              </div>
            </div>
            <button className="edit-btn">Edit Settings</button>
          </section>

          <section className="admin-card health-card">
            <h2>🏥 System Health</h2>
            <div className="health-metrics">
              <div className="health-item">
                <span>Signal Feed</span>
                <strong className="healthy">{system.signalFeed ?? "99.2%"}</strong>
              </div>
              <div className="health-item">
                <span>Execution Latency</span>
                <strong className="healthy">{system.executionNode ?? "12 ms"}</strong>
              </div>
              <div className="health-item">
                <span>Risk Engine</span>
                <strong className="healthy">{system.riskEngine ?? "Stable"}</strong>
              </div>
              <div className="health-item">
                <span>Network Latency</span>
                <strong className="healthy">{system.latency ?? "112 ms"}</strong>
              </div>
            </div>
          </section>

          <section className="admin-card trades-card">
            <h2>📜 Recent Trades</h2>
            <div className="trades-list">
              {(portfolio.trades ?? tradeLog).slice(0, 5).map((trade: any) => (
                <div key={trade.id} className="trade-entry">
                  <div className="trade-info">
                    <span className="pair">{trade.pair}</span>
                    <span className="time">{trade.time}</span>
                  </div>
                  <div className="trade-details">
                    <span className={`side ${String(trade.side).toLowerCase()}`}>{trade.side}</span>
                    <span className="price">${trade.price}</span>
                    <span className="size">× {trade.size}</span>
                    <span className={`status ${String(trade.status).toLowerCase()}`}>{trade.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">C</div>
          <div>
            <div className="eyebrow">TRADING DESK</div>
            <div className="brand-name">Crypto Signal Lab</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <button className={activeTab === "overview" ? "tab active" : "tab"} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={activeTab === "scanner" ? "tab active" : "tab"} onClick={() => setActiveTab("scanner")}>Scanner</button>
          <button className={activeTab === "strategies" ? "tab active" : "tab"} onClick={() => setActiveTab("strategies")}>Strategies</button>
          <button className={activeTab === "portfolio" ? "tab active" : "tab"} onClick={() => setActiveTab("portfolio")}>Portfolio</button>
          <button className={activeTab === "admin" ? "tab active" : "tab"} onClick={() => setActiveTab("admin")}>Admin</button>
        </nav>

        <div className="topbar-actions">
          <button className="ghost-button">Paper mode</button>
          <button className="primary-button">Deploy bot</button>
        </div>
      </header>

      <main className="dashboard">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "scanner" && renderOverview()}
        {activeTab === "strategies" && (
          <section className="panel strategy-focus-panel">
            <div className="panel-header compact">
              <div>
                <div className="eyebrow">STRATEGIES</div>
                <h2>Execution modes</h2>
              </div>
            </div>
            <div className="strategy-grid wide-grid">
              {strategyList.map((strategy) => (
                <div key={strategy.id ?? strategy.name} className="strategy-card">
                  <div className="strategy-topline">
                    <div>
                      <div className="strategy-name">{strategy.name}</div>
                      <div className="strategy-meta">{strategy.mode}</div>
                    </div>
                    <span className={`mini-tag ${String(strategy.status).toLowerCase()}`}>
                      {String(strategy.status).toUpperCase()}
                    </span>
                  </div>
                  <div className="strategy-stats">
                    <span>RR: {strategy.rr}</span>
                    <span>Win {Number(strategy.winRate ?? 0).toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar small-bar">
                    <span style={{ width: `${Math.min(100, Number(strategy.winRate ?? 60))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeTab === "portfolio" && (
          <section className="panel portfolio-panel">
            <div className="panel-header compact">
              <div>
                <div className="eyebrow">PORTFOLIO</div>
                <h2>Wallet and positions</h2>
              </div>
            </div>
            <div className="portfolio-summary">
              <div className="summary-box">
                <span>Balance</span>
                <strong>${Number(adminData?.portfolio?.balance ?? 10000).toLocaleString()}</strong>
              </div>
              <div className="summary-box">
                <span>Cash</span>
                <strong>${Number(adminData?.portfolio?.usdt ?? 5000).toLocaleString()}</strong>
              </div>
              <div className="summary-box">
                <span>Open P&L</span>
                <strong className={totalPnl >= 0 ? "positive" : "negative"}>${totalPnl.toFixed(2)}</strong>
              </div>
            </div>
            <div className="position-list">
              {portfolioPositions.map((pos) => (
                <div key={`${pos.symbol}-${pos.side}`} className="position-row">
                  <div className="pair-cell">
                    <span className="coin-badge alt">{String(pos.symbol).slice(0, 1)}</span>
                    <div>
                      <div className="coin-name">{pos.symbol}</div>
                      <div className="coin-meta">{pos.side}</div>
                    </div>
                  </div>
                  <div>{String(pos.size)}</div>
                  <div>${Number(pos.entry).toFixed(2)}</div>
                  <div className={Number(pos.pnl) >= 0 ? "positive" : "negative"}>${Number(pos.pnl).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeTab === "admin" && renderAdmin()}
      </main>
    </div>
  );
}

export default App;
