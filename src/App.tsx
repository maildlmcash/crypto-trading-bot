import { useEffect, useMemo, useState } from "react";
import LoginPage from "./pages/LoginPage";
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

type TabKey = "overview" | "scanner" | "strategies" | "portfolio" | "analytics" | "admin";

type AdminSnapshot = {
  portfolio?: any;
  strategies?: any[];
  riskSettings?: any;
  marketSnapshot?: any[];
  systemHealth?: any;
  analytics?: any;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [feedTick, setFeedTick] = useState(0);
  const [adminData, setAdminData] = useState<AdminSnapshot | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (newToken: string, user: any) => {
    setToken(newToken);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const timer = window.setInterval(() => setFeedTick((t) => t + 1), 2500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const loadData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const result = await res.json();
          if (result?.ok) setAdminData(result.data);
        }
      } catch {}
    };

    loadData();
    const interval = window.setInterval(loadData, 6000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const loadAnalytics = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const result = await res.json();
          if (result?.ok) setAnalyticsData(result.data);
        }
      } catch {}
    };

    loadAnalytics();
    const interval = window.setInterval(loadAnalytics, 10000);
    return () => window.clearInterval(interval);
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

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

  const renderAnalytics = () => (
    <div className="analytics-shell">
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card summary-card">
          <h2>Performance Summary</h2>
          <div className="summary-metrics">
            <div className="metric-box">
              <span>Win Rate</span>
              <strong>{analyticsData?.winRate?.toFixed(1) ?? 67.8}%</strong>
            </div>
            <div className="metric-box">
              <span>Profit Factor</span>
              <strong>{analyticsData?.profitFactor?.toFixed(2) ?? 2.34}</strong>
            </div>
            <div className="metric-box">
              <span>Max Drawdown</span>
              <strong className="negative">{analyticsData?.drawdown?.toFixed(1) ?? 8.5}%</strong>
            </div>
            <div className="metric-box">
              <span>Total Return</span>
              <strong className="positive">${analyticsData?.totalReturn?.toFixed(2) ?? 1823.4}</strong>
            </div>
            <div className="metric-box">
              <span>Monthly Return</span>
              <strong className="positive">{analyticsData?.monthlyReturn?.toFixed(1) ?? 12.5}%</strong>
            </div>
          </div>
        </div>

        <div className="analytics-card chart-card">
          <h2>Daily P&L</h2>
          <div className="chart-placeholder">
            <svg viewBox="0 0 400 200" className="sparkline-chart">
              {analyticsData?.dailyPnL?.map((point: any, i: number) => {
                const x = (i / (analyticsData.dailyPnL.length - 1)) * 380 + 10;
                const maxPnl = Math.max(...analyticsData.dailyPnL.map((p: any) => p.pnl));
                const y = 180 - (point.pnl / maxPnl) * 150;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={point.pnl >= 0 ? "#39d98a" : "#ff6b6b"}
                  />
                );
              })}
            </svg>
            <div className="chart-labels">
              {analyticsData?.dailyPnL?.map((point: any) => (
                <div key={point.date} className="chart-label">
                  <span className="date">{point.date.slice(-2)}</span>
                  <span className={`value ${point.pnl >= 0 ? 'positive' : 'negative'}`}>
                    ${point.pnl.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => {
    if (currentUser?.role !== 'admin') {
      return (
        <div className="unauthorized">
          <h2>🔒 Admin Access Only</h2>
          <p>You do not have permission to view this section.</p>
        </div>
      );
    }

    const portfolio = adminData?.portfolio ?? { balance: 10000, usdt: 5000, btc: 0.25, eth: 2.5, positions: portfolioPositions };
    const strategies = strategyList;
    const risk = adminData?.riskSettings ?? { maxDailyLoss: 1.8, leverageCap: 3.5 };
    const system = adminData?.systemHealth ?? { signalFeed: '99.2%', executionNode: '12 ms' };

    return (
      <div className="admin-shell">
        <header className="admin-header">
          <h1>🔧 Admin Dashboard</h1>
          <span className="admin-badge">Role: Admin</span>
        </header>

        <div className="admin-grid">
          <section className="admin-card">
            <h2>📊 Portfolio</h2>
            <div className="stat-row">
              <span>Balance</span>
              <strong>${Number(portfolio.balance).toLocaleString()}</strong>
            </div>
            <div className="stat-row">
              <span>Total P&L</span>
              <strong className={totalPnl >= 0 ? 'positive' : 'negative'}>${totalPnl.toFixed(2)}</strong>
            </div>
          </section>

          <section className="admin-card">
            <h2>🤖 Strategies</h2>
            <div className="strategy-list">
              {strategies.map((s: any) => (
                <div key={s.id} className="strategy-mini">
                  <span>{s.name}</span>
                  <span className={`status ${String(s.status).toLowerCase()}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card">
            <h2>⚠️ Risk Settings</h2>
            <div className="risk-display">
              <div>Max Daily Loss: <strong>{risk.maxDailyLoss}%</strong></div>
              <div>Leverage Cap: <strong>{risk.leverageCap}x</strong></div>
            </div>
          </section>

          <section className="admin-card">
            <h2>🏥 System Health</h2>
            <div className="health-display">
              <div>Signal Feed: <strong className="healthy">{system.signalFeed}</strong></div>
              <div>Execution: <strong className="healthy">{system.executionNode}</strong></div>
            </div>
          </section>
        </div>
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

        <nav className="nav">
          <button className={activeTab === "overview" ? "tab active" : "tab"} onClick={() => setActiveTab("overview")}>Overview</button>
          <button className={activeTab === "analytics" ? "tab active" : "tab"} onClick={() => setActiveTab("analytics")}>Analytics</button>
          <button className={activeTab === "strategies" ? "tab active" : "tab"} onClick={() => setActiveTab("strategies")}>Strategies</button>
          <button className={activeTab === "portfolio" ? "tab active" : "tab"} onClick={() => setActiveTab("portfolio")}>Portfolio</button>
          {currentUser?.role === 'admin' && (
            <button className={activeTab === "admin" ? "tab active" : "tab"} onClick={() => setActiveTab("admin")}>Admin</button>
          )}
        </nav>

        <div className="topbar-actions">
          <span className="user-badge">{currentUser?.email}</span>
          <button className="primary-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard">
        {activeTab === "analytics" && renderAnalytics()}
        {activeTab === "admin" && renderAdmin()}
        {activeTab === "overview" && (
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
        )}
      </main>
    </div>
  );
}

export default App;
