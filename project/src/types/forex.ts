export interface CurrencyPair {
  pair: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'NEUTRAL';
  timestamp: number;
}

export interface TradingSignal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  strength: 'WEAK' | 'MODERATE' | 'STRONG';
  price: number;
  timestamp: number;
  indicators: string[];
  confidence: number;
}

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: Position[];
}

export interface Position {
  id: string;
  pair: string;
  type: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: number;
}

export interface Alert {
  id: string;
  pair: string;
  condition: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  triggered: boolean;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    theme: 'light' | 'dark';
    defaultPairs: string[];
    alertsEnabled: boolean;
  };
}