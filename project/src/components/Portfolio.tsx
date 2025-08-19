import React, { useState } from 'react';
import { Portfolio as PortfolioType, Position } from '../types/forex';
import { portfolioService } from '../services/portfolioService';
import { TrendingUp, TrendingDown, X, Plus } from 'lucide-react';

interface PortfolioProps {
  portfolio: PortfolioType;
  onAddPosition: (pair: string, type: 'LONG' | 'SHORT', size: number, price: number) => void;
}

export function Portfolio({ portfolio, onAddPosition }: PortfolioProps) {
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    pair: 'EUR/USD',
    type: 'LONG' as 'LONG' | 'SHORT',
    size: 10000,
    price: 1.0850
  });

  const handleAddPosition = () => {
    onAddPosition(newPosition.pair, newPosition.type, newPosition.size, newPosition.price);
    setShowAddPosition(false);
    setNewPosition({
      pair: 'EUR/USD',
      type: 'LONG',
      size: 10000,
      price: 1.0850
    });
  };

  const handleClosePosition = (positionId: string) => {
    portfolioService.closePosition(positionId);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Portfolio
        </h3>
        <button
          onClick={() => setShowAddPosition(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Add Position
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatCurrency(portfolio.totalValue)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total P&L</p>
          <p className={`text-xl font-semibold ${
            portfolio.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(portfolio.totalPnL)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">P&L %</p>
          <p className={`text-xl font-semibold ${
            portfolio.totalPnLPercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {portfolio.totalPnLPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Positions */}
      <div className="space-y-3">
        {portfolio.positions.map((position) => (
          <div key={position.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {position.type === 'LONG' ? 
                  <TrendingUp className="text-green-500" size={16} /> : 
                  <TrendingDown className="text-red-500" size={16} />
                }
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {position.pair} - {position.type}
                </h4>
              </div>
              <button
                onClick={() => handleClosePosition(position.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Size</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {position.size.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Entry Price</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {position.entryPrice.toFixed(5)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Current Price</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {position.currentPrice.toFixed(5)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">P&L</p>
                <p className={`font-medium ${
                  position.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(position.pnl)} ({position.pnlPercent.toFixed(2)}%)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {portfolio.positions.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No open positions</p>
          <p className="text-sm">Add a position to start trading</p>
        </div>
      )}

      {/* Add Position Modal */}
      {showAddPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Position
              </h4>
              <button
                onClick={() => setShowAddPosition(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency Pair
                </label>
                <select
                  value={newPosition.pair}
                  onChange={(e) => setNewPosition({...newPosition, pair: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option>EUR/USD</option>
                  <option>GBP/USD</option>
                  <option>USD/JPY</option>
                  <option>USD/CHF</option>
                  <option>AUD/USD</option>
                  <option>USD/CAD</option>
                  <option>NZD/USD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  value={newPosition.type}
                  onChange={(e) => setNewPosition({...newPosition, type: e.target.value as 'LONG' | 'SHORT'})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="LONG">LONG (Buy)</option>
                  <option value="SHORT">SHORT (Sell)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Size
                </label>
                <input
                  type="number"
                  value={newPosition.size}
                  onChange={(e) => setNewPosition({...newPosition, size: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={newPosition.price}
                  onChange={(e) => setNewPosition({...newPosition, price: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddPosition}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Position
                </button>
                <button
                  onClick={() => setShowAddPosition(false)}
                  className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}