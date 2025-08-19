import React from 'react';
import { TradingSignal } from '../types/forex';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface TradingSignalsProps {
  signals: TradingSignal[];
}

export function TradingSignals({ signals }: TradingSignalsProps) {
  const getSignalIcon = (type: string) => {
    return type === 'BUY' 
      ? <TrendingUp className="text-green-500" size={20} />
      : <TrendingDown className="text-red-500" size={20} />;
  };

  const getSignalColor = (type: string) => {
    return type === 'BUY'
      ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      : 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'STRONG':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700/20 dark:text-gray-300';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="text-blue-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Trading Signals
        </h3>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {signals.map((signal) => (
          <div 
            key={signal.id} 
            className={`border-l-4 p-4 rounded-r-lg ${getSignalColor(signal.type)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {getSignalIcon(signal.type)}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {signal.type} {signal.pair}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Price: {signal.price.toFixed(5)} • {formatTime(signal.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStrengthColor(signal.strength)}`}>
                  {signal.strength}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {signal.confidence.toFixed(0)}% confidence
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {signal.indicators.map((indicator, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white dark:bg-gray-800 text-xs rounded border border-gray-200 dark:border-gray-600"
                >
                  {indicator}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {signals.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>No trading signals available</p>
          <p className="text-sm">Signals will appear when technical conditions align</p>
        </div>
      )}
    </div>
  );
}