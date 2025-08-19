import { Portfolio, Position, CurrencyPair } from '../types/forex';

class PortfolioService {
  private positions: Position[] = [];
  private initialBalance = 10000; // Starting with $10,000

  constructor() {
    this.loadPositions();
  }

  private loadPositions() {
    const saved = localStorage.getItem('forex-positions');
    if (saved) {
      this.positions = JSON.parse(saved);
    }
  }

  private savePositions() {
    localStorage.setItem('forex-positions', JSON.stringify(this.positions));
  }

  addPosition(pair: string, type: 'LONG' | 'SHORT', size: number, entryPrice: number): Position {
    const position: Position = {
      id: `${pair}-${Date.now()}`,
      pair,
      type,
      size,
      entryPrice,
      currentPrice: entryPrice,
      pnl: 0,
      pnlPercent: 0,
      timestamp: Date.now()
    };

    this.positions.push(position);
    this.savePositions();
    return position;
  }

  closePosition(positionId: string): boolean {
    const index = this.positions.findIndex(p => p.id === positionId);
    if (index !== -1) {
      this.positions.splice(index, 1);
      this.savePositions();
      return true;
    }
    return false;
  }

  updatePositions(pairs: CurrencyPair[]) {
    this.positions.forEach(position => {
      const pair = pairs.find(p => p.pair === position.pair);
      if (pair) {
        position.currentPrice = position.type === 'LONG' ? pair.bid : pair.ask;
        
        if (position.type === 'LONG') {
          position.pnl = (position.currentPrice - position.entryPrice) * position.size;
        } else {
          position.pnl = (position.entryPrice - position.currentPrice) * position.size;
        }
        
        position.pnlPercent = (position.pnl / (position.entryPrice * position.size)) * 100;
      }
    });
    this.savePositions();
  }

  getPortfolio(): Portfolio {
    const totalPnL = this.positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalValue = this.initialBalance + totalPnL;
    const totalPnLPercent = (totalPnL / this.initialBalance) * 100;

    return {
      totalValue,
      totalPnL,
      totalPnLPercent,
      positions: [...this.positions]
    };
  }

  getPosition(id: string): Position | undefined {
    return this.positions.find(p => p.id === id);
  }

  getAllPositions(): Position[] {
    return [...this.positions];
  }
}

export const portfolioService = new PortfolioService();