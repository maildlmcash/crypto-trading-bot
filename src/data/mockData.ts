export type MarketRow = {
  symbol: string;
  exchange: string;
  price: number;
  hourChange: number;
  dayChange: number;
  volume: number;
  signal: "BUY" | "SELL" | "WATCH";
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
};

export type WatchItem = {
  symbol: string;
  bias: "Bullish" | "Bearish";
  confidence: number;
  note: string;
};

export type StrategyCard = {
  name: string;
  status: "Live" | "Paused" | "Standby";
  rr: string;
  alpha: string;
  mode: string;
  system: number;
};

export type Position = {
  symbol: string;
  side: "LONG" | "SHORT";
  size: string;
  entry: number;
  pnl: number;
};

export type TradeLogEntry = {
  id: number;
  pair: string;
  side: "BUY" | "SELL";
  price: string;
  time: string;
};

export type BotStatus = {
  name: string;
  value: string;
  state: string;
  healthy: boolean;
};

export const metrics: Metric[] = [
  { label: "Market cap", value: "$2.49T", delta: "+2.4%", positive: true },
  { label: "24h volume", value: "$91.3B", delta: "+6.7%", positive: true },
  { label: "Active bots", value: "18", delta: "+3", positive: true },
  { label: "Win rate", value: "67.8%", delta: "-1.2%", positive: false },
];

export const marketRows: MarketRow[] = [
  { symbol: "BTC/USDT", exchange: "Binance", price: 68422.1, hourChange: 1.8, dayChange: 4.3, volume: 5200000000, signal: "BUY" },
  { symbol: "ETH/USDT", exchange: "Bybit", price: 3528.42, hourChange: -0.6, dayChange: 2.1, volume: 2900000000, signal: "WATCH" },
  { symbol: "SOL/USDT", exchange: "OKX", price: 168.09, hourChange: 3.1, dayChange: 7.8, volume: 1800000000, signal: "BUY" },
  { symbol: "XRP/USDT", exchange: "Kraken", price: 0.622, hourChange: 2.4, dayChange: 5.9, volume: 980000000, signal: "BUY" },
  { symbol: "DOGE/USDT", exchange: "Bitget", price: 0.176, hourChange: 4.8, dayChange: 11.2, volume: 760000000, signal: "BUY" },
  { symbol: "ADA/USDT", exchange: "Gate", price: 0.73, hourChange: -1.2, dayChange: -0.9, volume: 520000000, signal: "SELL" },
];

export const watchlist: WatchItem[] = [
  { symbol: "BTC", bias: "Bullish", confidence: 81, note: "Trend continuation above 68k" },
  { symbol: "ETH", bias: "Bullish", confidence: 76, note: "Breakout on 1H structure" },
  { symbol: "SOL", bias: "Bullish", confidence: 88, note: "Momentum acceleration" },
  { symbol: "LINK", bias: "Bearish", confidence: 61, note: "Range pressure building" },
];

export const strategyCards: StrategyCard[] = [
  { name: "Trend Pulse", status: "Live", rr: "1.9R", alpha: "Low risk", mode: "Momentum", system: 82 },
  { name: "Grid Alpha", status: "Paused", rr: "1.5R", alpha: "Range", mode: "Mean revert", system: 64 },
  { name: "Breakout AI", status: "Live", rr: "2.3R", alpha: "Fast entry", mode: "Volatility", system: 86 },
  { name: "Safe Drift", status: "Standby", rr: "1.1R", alpha: "Conservative", mode: "Trend", system: 58 },
];

export const positions: Position[] = [
  { symbol: "BTC", side: "LONG", size: "0.42 BTC", entry: 67890.0, pnl: 820.4 },
  { symbol: "SOL", side: "LONG", size: "42 SOL", entry: 162.8, pnl: 220.2 },
  { symbol: "ETH", side: "SHORT", size: "0.82 ETH", entry: 3590.1, pnl: -48.3 },
];

export const tradeLog: TradeLogEntry[] = [
  { id: 1, pair: "BTC/USDT", side: "BUY", price: "$68,430", time: "09:42" },
  { id: 2, pair: "SOL/USDT", side: "BUY", price: "$168.20", time: "09:38" },
  { id: 3, pair: "ETH/USDT", side: "SELL", price: "$3,554", time: "09:31" },
  { id: 4, pair: "DOGE/USDT", side: "BUY", price: "$0.176", time: "09:22" },
];

export const botStatuses: BotStatus[] = [
  { name: "Signal feed", value: "99.2%", state: "Healthy", healthy: true },
  { name: "Execution node", value: "12 ms", state: "Nominal", healthy: true },
  { name: "Risk engine", value: "Stable", state: "Healthy", healthy: true },
  { name: "Latency", value: "112 ms", state: "Responsive", healthy: true },
];

export const chartSeries: Record<string, number[]> = {
  "BTC/USDT": [32, 41, 36, 47, 52, 50, 58, 63, 60, 68, 72, 80],
  "ETH/USDT": [28, 33, 30, 39, 36, 41, 46, 44, 50, 53, 58, 62],
  "SOL/USDT": [20, 32, 38, 45, 48, 55, 64, 68, 72, 74, 79, 82],
  "XRP/USDT": [24, 26, 32, 30, 35, 38, 40, 42, 47, 45, 48, 46],
  "DOGE/USDT": [18, 29, 35, 37, 44, 47, 52, 61, 58, 66, 69, 73],
  "ADA/USDT": [26, 24, 20, 26, 22, 27, 33, 31, 29, 26, 24, 28],
};
