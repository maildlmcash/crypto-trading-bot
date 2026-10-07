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

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [feedTick, setFeedTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setFeedTick((t) => t + 1), 2500);
    return () => window.clearInterval(timer);
  }, []);

  const activeMarket = useMemo(
    () => marketRows.find((row) => row.symbol === selectedSymbol) ?? marketRows[0],
    [selectedSymbol],
  );

  const selectedChart = chartSeries[selectedSymbol] ?? chartSeries["BTC/USDT"];

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
          <a href="#overview">Overview</a>
          <a href="#scanner">Scanner</a>
          <a href="#signals">Signals</a>
          <a href="#bot">Bot</a>
        </nav>

        <div className="topbar-actions">
          <button className="ghost-button">Paper mode</button>
          <button className="primary-button">Deploy bot</button>
        </div>
      </header>

      <main className="dashboard" id="overview">
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
          <div className="panel scanner-panel" id="scanner">
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
                  {marketRows.map((row) => (
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
                            <div className="coin-meta">{row.exchange}</div>
                          </div>
                        </div>
                      </td>
                      <td>${row.price.toFixed(2)}</td>
                      <td className={row.hourChange >= 0 ? "positive" : "negative"}>
                        {row.hourChange.toFixed(2)}%
                      </td>
                      <td className={row.dayChange >= 0 ? "positive" : "negative"}>
                        {row.dayChange.toFixed(2)}%
                      </td>
                      <td>${row.volume.toLocaleString()}</td>
                      <td>
                        <span className={`signal-pill ${row.signal.toLowerCase()}`}>{row.signal}</span>
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
                <div className="big-price">${activeMarket.price.toFixed(2)}</div>
                <div className={activeMarket.dayChange >= 0 ? "positive" : "negative"}>
                  {activeMarket.dayChange.toFixed(2)}%
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
                  <strong>${activeMarket.volume.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Risk</span>
                  <strong>Low</strong>
                </div>
                <div>
                  <span>Bias</span>
                  <strong className={activeMarket.dayChange >= 0 ? "positive" : "negative"}>
                    {activeMarket.dayChange >= 0 ? "Bullish" : "Bearish"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="panel" id="signals">
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
          <div className="panel" id="bot">
            <div className="panel-header compact">
              <div>
                <div className="eyebrow">BOT</div>
                <h2>Global strategy suite</h2>
              </div>
            </div>

            <div className="strategy-grid">
              {strategyCards.map((strategy) => (
                <div key={strategy.name} className="strategy-card">
                  <div className="strategy-topline">
                    <div>
                      <div className="strategy-name">{strategy.name}</div>
                      <div className="strategy-meta">{strategy.mode}</div>
                    </div>
                    <span className={`mini-tag ${strategy.status.toLowerCase()}`}>{strategy.status}</span>
                  </div>
                  <div className="strategy-stats">
                    <span>RR: {strategy.rr}</span>
                    <span>{strategy.alpha}</span>
                  </div>
                  <div className="progress-bar small-bar">
                    <span style={{ width: `${strategy.system}%` }} />
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
                <strong>1.8%</strong>
              </div>
              <div className="command-card">
                <span>Leverage cap</span>
                <strong>3.5x</strong>
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
              {positions.map((pos) => (
                <div key={pos.symbol} className="position-row">
                  <div className="pair-cell">
                    <span className="coin-badge alt">{pos.symbol.slice(0, 1)}</span>
                    <div>
                      <div className="coin-name">{pos.symbol}</div>
                      <div className="coin-meta">{pos.side}</div>
                    </div>
                  </div>
                  <div>{pos.size}</div>
                  <div>${pos.entry.toFixed(2)}</div>
                  <div className={pos.pnl >= 0 ? "positive" : "negative"}>${pos.pnl.toFixed(2)}</div>
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
      </main>
    </div>
  );
}

export default App;















































































































































































