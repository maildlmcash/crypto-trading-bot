import http from 'http';
import url from 'url';

const PORT = 3001;

const paperPortfolio: Record<string, any> = {
  balance: 10000,
  usdt: 5000,
  btc: 0.25,
  eth: 2.5,
  positions: [
    { symbol: 'BTC/USDT', side: 'LONG', size: 0.25, entry: 67890.0, pnl: 820.4, currentPrice: 68422.1 },
    { symbol: 'SOL/USDT', side: 'LONG', size: 42, entry: 162.8, pnl: 220.2, currentPrice: 168.09 },
    { symbol: 'ETH/USDT', side: 'SHORT', size: 0.82, entry: 3590.1, pnl: -48.3, currentPrice: 3528.42 },
  ],
  trades: [
    { id: 1, pair: 'BTC/USDT', side: 'BUY', price: 68430, size: 0.25, time: '09:42', status: 'filled' },
    { id: 2, pair: 'SOL/USDT', side: 'BUY', price: 168.2, size: 42, time: '09:38', status: 'filled' },
    { id: 3, pair: 'ETH/USDT', side: 'SELL', price: 3554, size: 0.82, time: '09:31', status: 'filled' },
    { id: 4, pair: 'DOGE/USDT', side: 'BUY', price: 0.176, size: 500, time: '09:22', status: 'pending' },
  ],
};

const marketData: Record<string, any> = {
  'BTC/USDT': {
    symbol: 'BTC/USDT',
    price: 68422.1,
    hourChange: 1.8,
    dayChange: 4.3,
    volume: 5200000000,
    bid: 68420,
    ask: 68425,
    signal: 'BUY',
  },
  'ETH/USDT': {
    symbol: 'ETH/USDT',
    price: 3528.42,
    hourChange: -0.6,
    dayChange: 2.1,
    volume: 2900000000,
    bid: 3527,
    ask: 3530,
    signal: 'WATCH',
  },
  'SOL/USDT': {
    symbol: 'SOL/USDT',
    price: 168.09,
    hourChange: 3.1,
    dayChange: 7.8,
    volume: 1800000000,
    bid: 168.05,
    ask: 168.15,
    signal: 'BUY',
  },
};

const botStrategies: Record<string, any> = {
  'trend-pulse': {
    id: 'trend-pulse',
    name: 'Trend Pulse',
    status: 'running',
    mode: 'Momentum',
    rr: '1.9R',
    system: 82,
    dailyPnl: 234.5,
    totalTrades: 12,
    winRate: 67.8,
  },
  'grid-alpha': {
    id: 'grid-alpha',
    name: 'Grid Alpha',
    status: 'paused',
    mode: 'Mean revert',
    rr: '1.5R',
    system: 64,
    dailyPnl: -45.2,
    totalTrades: 8,
    winRate: 62.5,
  },
  'breakout-ai': {
    id: 'breakout-ai',
    name: 'Breakout AI',
    status: 'running',
    mode: 'Volatility',
    rr: '2.3R',
    system: 86,
    dailyPnl: 567.8,
    totalTrades: 18,
    winRate: 71.2,
  },
};

const riskSettings = {
  maxDailyLoss: 1.8,
  leverageCap: 3.5,
  maxPositionSize: 0.5,
  stopLossPercent: 5,
  takeProfitPercent: 10,
};

function sendJSON(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function handleCORS(req: http.IncomingMessage, res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  if (handleCORS(req, res)) return;

  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';
  const query = parsedUrl.query;

  // Market API
  if (pathname === '/api/market' && req.method === 'GET') {
    const symbol = query.symbol as string || 'BTC/USDT';
    const data = marketData[symbol] || marketData['BTC/USDT'];
    return sendJSON(res, 200, { ok: true, data });
  }

  // Market Scanner (all pairs)
  if (pathname === '/api/market/scanner' && req.method === 'GET') {
    const data = Object.values(marketData);
    return sendJSON(res, 200, { ok: true, data });
  }

  // Portfolio
  if (pathname === '/api/portfolio' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, data: paperPortfolio });
  }

  // Positions
  if (pathname === '/api/positions' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, data: paperPortfolio.positions });
  }

  // Trade History
  if (pathname === '/api/trades' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, data: paperPortfolio.trades });
  }

  // Bot Strategies
  if (pathname === '/api/bot/strategies' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, data: Object.values(botStrategies) });
  }

  // Bot Strategy Detail
  if (pathname === '/api/bot/strategy' && req.method === 'GET') {
    const strategyId = query.id as string || 'trend-pulse';
    const strategy = botStrategies[strategyId];
    if (!strategy) {
      return sendJSON(res, 404, { ok: false, error: 'Strategy not found' });
    }
    return sendJSON(res, 200, { ok: true, data: strategy });
  }

  // Risk Settings
  if (pathname === '/api/risk/settings' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, data: riskSettings });
  }

  // Place Paper Trade (POST)
  if (pathname === '/api/trade/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const tradeData = JSON.parse(body);
        const { symbol, side, size, price } = tradeData;

        if (!symbol || !side || !size || !price) {
          return sendJSON(res, 400, { ok: false, error: 'Missing trade parameters' });
        }

        const newTrade = {
          id: paperPortfolio.trades.length + 1,
          pair: symbol,
          side: side.toUpperCase(),
          price,
          size,
          time: new Date().toLocaleTimeString(),
          status: 'filled',
        };

        paperPortfolio.trades.push(newTrade);

        // Update portfolio balance (simplified)
        if (side === 'BUY') {
          paperPortfolio.usdt -= price * size;
        } else {
          paperPortfolio.usdt += price * size;
        }

        return sendJSON(res, 201, { ok: true, data: newTrade });
      } catch (e) {
        return sendJSON(res, 400, { ok: false, error: 'Invalid JSON' });
      }
    });
    return;
  }

  // Bot Control (START/STOP/PAUSE)
  if (pathname === '/api/bot/control' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const { strategyId, action } = JSON.parse(body);
        const strategy = botStrategies[strategyId];

        if (!strategy) {
          return sendJSON(res, 404, { ok: false, error: 'Strategy not found' });
        }

        if (action === 'start') {
          strategy.status = 'running';
        } else if (action === 'stop') {
          strategy.status = 'stopped';
        } else if (action === 'pause') {
          strategy.status = 'paused';
        }

        return sendJSON(res, 200, { ok: true, data: strategy });
      } catch (e) {
        return sendJSON(res, 400, { ok: false, error: 'Invalid JSON' });
      }
    });
    return;
  }

  // Health Check
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJSON(res, 200, {
      ok: true,
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  // Admin Dashboard Data
  if (pathname === '/api/admin/dashboard' && req.method === 'GET') {
    return sendJSON(res, 200, {
      ok: true,
      data: {
        portfolio: paperPortfolio,
        strategies: Object.values(botStrategies),
        riskSettings,
        marketSnapshot: Object.values(marketData),
        systemHealth: {
          signalFeed: '99.2%',
          executionNode: '12 ms',
          riskEngine: 'Stable',
          latency: '112 ms',
        },
      },
    });
  }

  // 404
  sendJSON(res, 404, { ok: false, error: 'Endpoint not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Paper Trading Backend] Server running at http://0.0.0.0:${PORT}`);
  console.log(`GET  /api/market?symbol=BTC/USDT`);
  console.log(`GET  /api/market/scanner`);
  console.log(`GET  /api/portfolio`);
  console.log(`GET  /api/positions`);
  console.log(`GET  /api/trades`);
  console.log(`GET  /api/bot/strategies`);
  console.log(`GET  /api/risk/settings`);
  console.log(`POST /api/trade/execute`);
  console.log(`POST /api/bot/control`);
  console.log(`GET  /api/admin/dashboard`);
  console.log(`GET  /api/health`);
});

process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close();
  process.exit(0);
});
