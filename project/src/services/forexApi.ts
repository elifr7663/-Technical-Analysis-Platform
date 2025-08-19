import { CurrencyPair, PriceData } from '../types/forex';

class ForexAPIService {
  private baseUrl = 'https://api.exchangerate-api.com/v4/latest';
  private mockData: Map<string, CurrencyPair> = new Map();
  private intervalId: number | null = null;

  constructor() {
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  private initializeMockData() {
    const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'];
    const basePrices = [1.0850, 1.2650, 149.50, 0.8750, 0.6550, 1.3450, 0.5950];
    
    pairs.forEach((pair, index) => {
      const basePrice = basePrices[index];
      const spread = basePrice * 0.0002; // 2 pips spread
      this.mockData.set(pair, {
        pair,
        bid: basePrice - spread / 2,
        ask: basePrice + spread / 2,
        spread: spread,
        change: (Math.random() - 0.5) * 0.01,
        changePercent: (Math.random() - 0.5) * 1,
        timestamp: Date.now()
      });
    });
  }

  private startRealTimeUpdates() {
    this.intervalId = window.setInterval(() => {
      this.updatePrices();
    }, 2000);
  }

  private updatePrices() {
    this.mockData.forEach((data, pair) => {
      const volatility = 0.0005;
      const change = (Math.random() - 0.5) * volatility;
      const newBid = Math.max(0.001, data.bid + change);
      const newAsk = newBid + data.spread;
      
      this.mockData.set(pair, {
        ...data,
        bid: newBid,
        ask: newAsk,
        change: change,
        changePercent: (change / data.bid) * 100,
        timestamp: Date.now()
      });
    });
  }

  async getCurrencyPairs(): Promise<CurrencyPair[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return Array.from(this.mockData.values());
    } catch (error) {
      console.error('Error fetching currency pairs:', error);
      throw new Error('Failed to fetch currency data');
    }
  }

  async getHistoricalData(pair: string, timeframe: string = '1H', limit: number = 100): Promise<PriceData[]> {
    try {
      // Generate mock historical data
      const data: PriceData[] = [];
      const currentPair = this.mockData.get(pair);
      if (!currentPair) throw new Error(`Pair ${pair} not found`);

      let basePrice = currentPair.bid;
      const now = Date.now();
      const timeframeMs = this.getTimeframeMs(timeframe);

      for (let i = limit; i >= 0; i--) {
        const timestamp = now - (i * timeframeMs);
        const volatility = basePrice * 0.002;
        const change = (Math.random() - 0.5) * volatility;
        
        const open = basePrice;
        const close = basePrice + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        
        data.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume: Math.random() * 1000000
        });
        
        basePrice = close;
      }

      return data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw new Error('Failed to fetch historical data');
    }
  }

  private getTimeframeMs(timeframe: string): number {
    const timeframes: Record<string, number> = {
      '1M': 60 * 1000,
      '5M': 5 * 60 * 1000,
      '15M': 15 * 60 * 1000,
      '30M': 30 * 60 * 1000,
      '1H': 60 * 60 * 1000,
      '4H': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || timeframes['1H'];
  }

  subscribe(callback: (pairs: CurrencyPair[]) => void) {
    const interval = setInterval(async () => {
      const pairs = await this.getCurrencyPairs();
      callback(pairs);
    }, 1000);
    
    return () => clearInterval(interval);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

export const forexAPI = new ForexAPIService();