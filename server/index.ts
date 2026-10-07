import http from 'http';
import url from 'url';
import crypto from 'crypto';

const PORT = process.env.PORT || 3001;

// In-memory user store (replace with DB in production)
const users: Record<string, any> = {
  'admin@cryptolab.io': {
    id: 'user-001',
    email: 'admin@cryptolab.io',
    passwordHash: hashPassword('Admin@123456'),
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  'trader@cryptolab.io': {
    id: 'user-002',
    email: 'trader@cryptolab.io',
    passwordHash: hashPassword('Trader@12345'),
    role: 'trader',
    createdAt: new Date().toISOString(),
  },
};

// Session store (replace with Redis in production)
const sessions: Record<string, any> = {};

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

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
    { id: 1, pair: 'BTC/USDT', side: 'BUY', price: 68430, size: 0.25, time: '09:42', status: 'filled', timestamp: new Date().getTime() },
    { id: 2, pair: 'SOL/USDT', side: 'BUY', price: 168.2, size: 42, time: '09:38', status: 'filled', timestamp: new Date().getTime() - 300000 },
    { id: 3, pair: 'ETH/USDT', side: 'SELL', price: 3554, size: 0.82, time: '09:31', status: 'filled', timestamp: new Date().getTime() - 600000 },
    { id: 4, pair: 'DOGE/USDT', side: 'BUY', price: 0.176, size: 500, time: '09:22', status: 'pending', timestamp: new Date().getTime() - 900000 },
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
    exchange: 'Binance',
    high24h: 69500,
    low24h: 65200,
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
    exchange: 'Bybit',
    high24h: 3650,
    low24h: 3420,
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
    exchange: 'OKX',
    high24h: 172,
    low24h: 155,
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
    description: 'Captures trending momentum with early entry signals',
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
    description: 'Grid trading for range-bound markets',
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
    description: 'Breakout detection with volatility filters',
  },
};

const riskSettings = {
  maxDailyLoss: 1.8,
  leverageCap: 3.5,
  maxPositionSize: 0.5,
  stopLossPercent: 5,
  takeProfitPercent: 10,
};

// Analytics data
const analyticsData = {
  dailyPnL: [
    { date: '2024-10-01', pnl: 145.3 },
    { date: '2024-10-02', pnl: -23.5 },
    { date: '2024-10-03', pnl: 234.7 },
    { date: '2024-10-04', pnl: 567.8 },
    { date: '2024-10-05', pnl: 89.2 },
    { date: '2024-10-06', pnl: 156.4 },
    { date: '2024-10-07', pnl: 234.5 },
  ],
  winRate: 67.8,
  profitFactor: 2.34,
  drawdown: 8.5,
  totalReturn: 1823.4,
  monthlyReturn: 12.5,
};

function sendJSON(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

function handleCORS(req: http.IncomingMessage, res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return true;
  }
  return false;
}

function verifyToken(req: http.IncomingMessage): any {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return sessions[token] ?? null;
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (handleCORS(req, res)) return;

  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';
  const query = parsedUrl.query;

  // Auth Endpoints
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const { email, password } = JSON.parse(body);
      if (users[email]) return sendJSON(res, 409, { ok: false, error: 'User already exists' });
      users[email] = { id: `user-${Date.now()}`, email, passwordHash: hashPassword(password), role: 'trader', createdAt: new Date().toISOString() };
      return sendJSON(res, 201, { ok: true, message: 'User registered' });
    } catch (e) {
      return sendJSON(res, 400, { ok: false, error: 'Invalid request' });
    }
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const { email, password } = JSON.parse(body);
      const user = users[email];
      if (!user || user.passwordHash !== hashPassword(password)) {
        return sendJSON(res, 401, { ok: false, error: 'Invalid credentials' });
      }
      const token = generateToken();
      sessions[token] = { ...user, passwordHash: undefined };
      return sendJSON(res, 200, { ok: true, token, user: sessions[token] });
    } catch (e) {
      return sendJSON(res, 400, { ok: false, error: 'Invalid request' });
    }
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const body = await readBody(req);
    try {
      const { token } = JSON.parse(body);
      delete sessions[token];
      return sendJSON(res, 200, { ok: true, message: 'Logged out' });
    } catch (e) {
      return sendJSON(res, 400, { ok: false, error: 'Invalid request' });
    }
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, user });
  }

  // Market API
  if (pathname === '/api/market' && req.method === 'GET') {
    const symbol = (query.symbol as string) || 'BTC/USDT';
    const data = marketData[symbol] || marketData['BTC/USDT'];
    return sendJSON(res, 200, { ok: true, data });
  }

  if (pathname === '/api/market/scanner' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, data: Object.values(marketData) });
  }

  // Portfolio
  if (pathname === '/api/portfolio' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, data: paperPortfolio });
  }

  if (pathname === '/api/positions' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, data: paperPortfolio.positions });
  }

  if (pathname === '/api/trades' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, data: paperPortfolio.trades });
  }

  // Analytics
  if (pathname === '/api/analytics' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, data: analyticsData });
  }

  if (pathname === '/api/analytics/daily' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, data: analyticsData.dailyPnL });
  }

  if (pathname === '/api/analytics/summary' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, data: { winRate: analyticsData.winRate, profitFactor: analyticsData.profitFactor, drawdown: analyticsData.drawdown, totalReturn: analyticsData.totalReturn, monthlyReturn: analyticsData.monthlyReturn } });
  }

  // Bot Strategies
  if (pathname === '/api/bot/strategies' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, data: Object.values(botStrategies) });
  }

  if (pathname === '/api/bot/strategy' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    const strategyId = (query.id as string) || 'trend-pulse';
    const strategy = botStrategies[strategyId];
    if (!strategy) return sendJSON(res, 404, { ok: false, error: 'Strategy not found' });
    return sendJSON(res, 200, { ok: true, data: strategy });
  }

  if (pathname === '/api/bot/strategy/edit' && req.method === 'PUT') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    if (user.role !== 'admin') return sendJSON(res, 403, { ok: false, error: 'Forbidden' });
    const body = await readBody(req);
    try {
      const { id, name, rr, stopLossPercent, takeProfitPercent } = JSON.parse(body);
      const strategy = botStrategies[id];
      if (!strategy) return sendJSON(res, 404, { ok: false, error: 'Strategy not found' });
      strategy.name = name || strategy.name;
      strategy.rr = rr || strategy.rr;
      return sendJSON(res, 200, { ok: true, data: strategy });
    } catch (e) {
      return sendJSON(res, 400, { ok: false, error: 'Invalid request' });
    }
  }

  // Risk Settings
  if (pathname === '/api/risk/settings' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    return sendJSON(res, 200, { ok: true, data: riskSettings });
  }

  if (pathname === '/api/risk/settings' && req.method === 'PUT') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    if (user.role !== 'admin') return sendJSON(res, 403, { ok: false, error: 'Forbidden' });
    const body = await readBody(req);
    try {
      const updates = JSON.parse(body);
      Object.assign(riskSettings, updates);
      return sendJSON(res, 200, { ok: true, data: riskSettings });
    } catch (e) {
      return sendJSON(res, 400, { ok: false, error: 'Invalid request' });
    }
  }

  // Trade Execution
  if (pathname === '/api/trade/execute' && req.method === 'POST') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    const body = await readBody(req);
    try {
      const { symbol, side, size, price } = JSON.parse(body);
      if (!symbol || !side || !size || !price) return sendJSON(res, 400, { ok: false, error: 'Missing parameters' });
      const newTrade = { id: paperPortfolio.trades.length + 1, pair: symbol, side: side.toUpperCase(), price, size, time: new Date().toLocaleTimeString(), status: 'filled', timestamp: new Date().getTime() };
      paperPortfolio.trades.push(newTrade);
      if (side === 'BUY') paperPortfolio.usdt -= price * size;
      else paperPortfolio.usdt += price * size;
      return sendJSON(res, 201, { ok: true, data: newTrade });
    } catch (e) {
      return sendJSON(res, 400, { ok: false, error: 'Invalid JSON' });
    }
  }

  // Bot Control
  if (pathname === '/api/bot/control' && req.method === 'POST') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    if (user.role !== 'admin') return sendJSON(res, 403, { ok: false, error: 'Forbidden' });
    const body = await readBody(req);
    try {
      const { strategyId, action } = JSON.parse(body);
      const strategy = botStrategies[strategyId];
      if (!strategy) return sendJSON(res, 404, { ok: false, error: 'Strategy not found' });
      if (action === 'start') strategy.status = 'running';
      else if (action === 'stop') strategy.status = 'stopped';
      else if (action === 'pause') strategy.status = 'paused';
      return sendJSON(res, 200, { ok: true, data: strategy });
    } catch (e) {
      return sendJSON(res, 400, { ok: false, error: 'Invalid JSON' });
    }
  }

  // Health Check
  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJSON(res, 200, { ok: true, status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() });
  }

  // Admin Dashboard
  if (pathname === '/api/admin/dashboard' && req.method === 'GET') {
    const user = verifyToken(req);
    if (!user) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });
    if (user.role !== 'admin') return sendJSON(res, 403, { ok: false, error: 'Forbidden' });
    return sendJSON(res, 200, { ok: true, data: { portfolio: paperPortfolio, strategies: Object.values(botStrategies), riskSettings, marketSnapshot: Object.values(marketData), systemHealth: { signalFeed: '99.2%', executionNode: '12 ms', riskEngine: 'Stable', latency: '112 ms' }, analytics: analyticsData } });
  }

  // 404
  sendJSON(res, 404, { ok: false, error: 'Endpoint not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Paper Trading Backend] Server running at http://0.0.0.0:${PORT}`);
  console.log('[Auth] POST /api/auth/login');
  console.log('[Auth] POST /api/auth/register');
  console.log('[Auth] GET /api/auth/me');
  console.log('[Market] GET /api/market?symbol=BTC/USDT');
  console.log('[Portfolio] GET /api/portfolio');
  console.log('[Analytics] GET /api/analytics');
  console.log('[Admin] GET /api/admin/dashboard');
});

process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  server.close();
  process.exit(0);
});
