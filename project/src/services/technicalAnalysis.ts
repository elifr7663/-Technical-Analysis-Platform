import { PriceData, TechnicalIndicator, TradingSignal } from '../types/forex';

export class TechnicalAnalysisService {
  // Simple Moving Average
  static calculateSMA(data: PriceData[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
      sma.push(sum / period);
    }
    return sma;
  }

  // Exponential Moving Average
  static calculateEMA(data: PriceData[], period: number): number[] {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // First EMA is SMA
    const firstSMA = data.slice(0, period).reduce((acc, item) => acc + item.close, 0) / period;
    ema.push(firstSMA);
    
    for (let i = period; i < data.length; i++) {
      const currentEMA = (data[i].close * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
      ema.push(currentEMA);
    }
    
    return ema;
  }

  // Relative Strength Index
  static calculateRSI(data: PriceData[], period: number = 14): number[] {
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }

    return rsi;
  }

  // MACD (Moving Average Convergence Divergence)
  static calculateMACD(data: PriceData[]): { macd: number[], signal: number[], histogram: number[] } {
    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    // MACD line is EMA12 - EMA26
    const macd: number[] = [];
    const startIndex = Math.max(0, ema26.length - ema12.length);
    
    for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
      macd.push(ema12[startIndex + i] - ema26[i]);
    }

    // Signal line is 9-period EMA of MACD
    const macdData = macd.map((value, index) => ({ 
      timestamp: data[index + 26].timestamp, 
      close: value, 
      open: value, 
      high: value, 
      low: value, 
      volume: 0 
    }));
    const signal = this.calculateEMA(macdData, 9);

    // Histogram is MACD - Signal
    const histogram: number[] = [];
    const signalStartIndex = macd.length - signal.length;
    for (let i = 0; i < signal.length; i++) {
      histogram.push(macd[signalStartIndex + i] - signal[i]);
    }

    return { macd, signal, histogram };
  }

  // Bollinger Bands
  static calculateBollingerBands(data: PriceData[], period: number = 20, multiplier: number = 2): { upper: number[], middle: number[], lower: number[] } {
    const middle = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const sma = middle[i - period + 1];
      const variance = slice.reduce((acc, item) => acc + Math.pow(item.close - sma, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      upper.push(sma + (multiplier * stdDev));
      lower.push(sma - (multiplier * stdDev));
    }

    return { upper, middle, lower };
  }

  // Generate trading signals based on technical indicators
  static generateSignals(pair: string, data: PriceData[]): TradingSignal[] {
    if (data.length < 50) return [];

    const signals: TradingSignal[] = [];
    const rsi = this.calculateRSI(data);
    const macd = this.calculateMACD(data);
    const bb = this.calculateBollingerBands(data);
    const sma20 = this.calculateSMA(data, 20);
    const sma50 = this.calculateSMA(data, 50);

    const currentPrice = data[data.length - 1].close;
    const currentRSI = rsi[rsi.length - 1];
    const currentMACD = macd.macd[macd.macd.length - 1];
    const currentSignal = macd.signal[macd.signal.length - 1];
    const currentBBUpper = bb.upper[bb.upper.length - 1];
    const currentBBLower = bb.lower[bb.lower.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];

    let bullishSignals = 0;
    let bearishSignals = 0;
    const indicators: string[] = [];

    // RSI signals
    if (currentRSI < 30) {
      bullishSignals++;
      indicators.push('RSI Oversold');
    } else if (currentRSI > 70) {
      bearishSignals++;
      indicators.push('RSI Overbought');
    }

    // MACD signals
    if (currentMACD > currentSignal && macd.macd[macd.macd.length - 2] <= macd.signal[macd.signal.length - 2]) {
      bullishSignals++;
      indicators.push('MACD Bullish Crossover');
    } else if (currentMACD < currentSignal && macd.macd[macd.macd.length - 2] >= macd.signal[macd.signal.length - 2]) {
      bearishSignals++;
      indicators.push('MACD Bearish Crossover');
    }

    // Bollinger Bands signals
    if (currentPrice <= currentBBLower) {
      bullishSignals++;
      indicators.push('BB Oversold');
    } else if (currentPrice >= currentBBUpper) {
      bearishSignals++;
      indicators.push('BB Overbought');
    }

    // Moving Average signals
    if (currentSMA20 > currentSMA50 && sma20[sma20.length - 2] <= sma50[sma50.length - 2]) {
      bullishSignals++;
      indicators.push('Golden Cross');
    } else if (currentSMA20 < currentSMA50 && sma20[sma20.length - 2] >= sma50[sma50.length - 2]) {
      bearishSignals++;
      indicators.push('Death Cross');
    }

    // Generate signal if there's a clear bias
    if (bullishSignals > bearishSignals && indicators.length > 0) {
      const strength = bullishSignals >= 3 ? 'STRONG' : bullishSignals >= 2 ? 'MODERATE' : 'WEAK';
      signals.push({
        id: `${pair}-${Date.now()}`,
        pair,
        type: 'BUY',
        strength,
        price: currentPrice,
        timestamp: Date.now(),
        indicators,
        confidence: (bullishSignals / (bullishSignals + bearishSignals)) * 100
      });
    } else if (bearishSignals > bullishSignals && indicators.length > 0) {
      const strength = bearishSignals >= 3 ? 'STRONG' : bearishSignals >= 2 ? 'MODERATE' : 'WEAK';
      signals.push({
        id: `${pair}-${Date.now()}`,
        pair,
        type: 'SELL',
        strength,
        price: currentPrice,
        timestamp: Date.now(),
        indicators,
        confidence: (bearishSignals / (bullishSignals + bearishSignals)) * 100
      });
    }

    return signals;
  }

  // Get technical indicators for display
  static getTechnicalIndicators(pair: string, data: PriceData[]): TechnicalIndicator[] {
    if (data.length < 50) return [];

    const indicators: TechnicalIndicator[] = [];
    const rsi = this.calculateRSI(data);
    const macd = this.calculateMACD(data);
    const sma20 = this.calculateSMA(data, 20);
    const sma50 = this.calculateSMA(data, 50);

    const currentPrice = data[data.length - 1].close;

    // RSI
    const currentRSI = rsi[rsi.length - 1];
    indicators.push({
      name: 'RSI (14)',
      value: currentRSI,
      signal: currentRSI < 30 ? 'BUY' : currentRSI > 70 ? 'SELL' : 'NEUTRAL',
      timestamp: Date.now()
    });

    // MACD
    const currentMACD = macd.macd[macd.macd.length - 1];
    const currentSignal = macd.signal[macd.signal.length - 1];
    indicators.push({
      name: 'MACD',
      value: currentMACD - currentSignal,
      signal: currentMACD > currentSignal ? 'BUY' : currentMACD < currentSignal ? 'SELL' : 'NEUTRAL',
      timestamp: Date.now()
    });

    // Moving Averages
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    indicators.push({
      name: 'SMA Cross',
      value: ((currentSMA20 - currentSMA50) / currentSMA50) * 100,
      signal: currentSMA20 > currentSMA50 ? 'BUY' : 'SELL',
      timestamp: Date.now()
    });

    // Price vs SMA20
    indicators.push({
      name: 'Price vs SMA20',
      value: ((currentPrice - currentSMA20) / currentSMA20) * 100,
      signal: currentPrice > currentSMA20 ? 'BUY' : 'SELL',
      timestamp: Date.now()
    });

    return indicators;
  }
}