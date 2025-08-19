import React from 'react';
import { CurrencyPair } from '../types/forex';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CurrencyPairCardProps {
  pair: CurrencyPair;
  onClick: (pair: string) => void;
}

export function CurrencyPairCard({ pair, onClick }: CurrencyPairCardProps) {
  const isPositive = pair.change >= 0;
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
      onClick={() => onClick(pair.pair)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {pair.pair}
        </h3>
        <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bid</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {pair.bid.toFixed(5)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ask</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {pair.ask.toFixed(5)}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Spread</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {(pair.spread * 10000).toFixed(1)} pips
          </p>
        </div>
        <div className={`text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <p className="text-lg font-semibold">
            {isPositive ? '+' : ''}{pair.changePercent.toFixed(2)}%
          </p>
          <p className="text-sm">
            {isPositive ? '+' : ''}{pair.change.toFixed(5)}
          </p>
        </div>
      </div>
    </div>
  );
}