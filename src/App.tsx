import { marketRows, metrics, predictionCards, positions, strategies } from "./data/mockData";

function App() {
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
          <a href="#">Desk</a>
          <a href="#">Signals</a>
          <a href="#">Bot</a>
          <a href="#">P&amp;L</a>
        </nav>

        <div className="topbar-actions">
          <button className="ghost-button">Paper mode</button>
          <button className="primary-button">Deploy bot</button>
        </div>
      </header>

      <main className="dashboard">
        <section className="hero-panel panel">
          <div className="hero-header">
            <div>
              <div className="eyebrow accent">LIVE MARKET</div>
              <h1>AI-powered crypto trading desk</h1>
            </div>
            <div className="status-pill">
              <span className="status-dot" />
              Market feed online
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
                  {marketRows.map((row) => (
                    <tr key={row.symbol}>
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
                      <td className={row.hourChange >= 0 ? "positive" : "negative"}>{row.hourChange.toFixed(2)}%</td>
                      <td className={row.dayChange >= 0 ? "positive" : "negative"}>{row.dayChange.toFixed(2)}%</td>
                      <td>${row.volume.toLocaleString()}</td>
                      <td>
                        <span className={`signal-pill ${row.signal.toLowerCase()}`}>
                          {row.signal}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="side-stack">
            <div className="panel">
              <div className="panel-header compact">
                <div>
                  <div className="eyebrow">PREDICTION</div>
                  <h2>Signal engine</h2>
                </div>
              </div>

              <div className="signal-list">
                {predictionCards.map((item) => (
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

            <div className="panel">
              <div className="panel-header compact">
                <div>
                  <div className="eyebrow">BOT</div>
                  <h2>Active strategies</h2>
                </div>
              </div>

              <div className="strategy-list">
                {strategies.map((strategy) => (
                  <div key={strategy.name} className="strategy-item">
                    <div>
                      <div className="strategy-name">{strategy.name}</div>
                      <div className="strategy-meta">{strategy.status}</div>
                    </div>
                    <div className="strategy-rr">{strategy.rr}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <div className="panel-header compact">
              <div>
                <div className="eyebrow">RISK</div>
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
                <div className="eyebrow">CONTROL</div>
                <h2>Bot command</h2>
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
                <span>Risk mode</span>
                <strong>Balanced</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
