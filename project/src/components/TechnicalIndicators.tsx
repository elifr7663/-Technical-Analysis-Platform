import React from 'react';
import { TechnicalIndicator } from '../types/forex';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TechnicalIndicatorsProps {
  indicators: TechnicalIndicator[];
}

export function TechnicalIndicators({ indicators }: TechnicalIndicatorsProps) {
  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'SELL':
        return <TrendingDown className="text-red-500" size={16} />;
      default:
        return <Minus className="text-gray-500" size={16} />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'SELL':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Technical Indicators
      </h3>
      
      <div className="space-y-3">
        {indicators.map((indicator, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              {getSignalIcon(indicator.signal)}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {indicator.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Value: {indicator.value.toFixed(4)}
                </p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSignalColor(indicator.signal)}`}>
              {indicator.signal}
            </div>
          </div>
        ))}
      </div>
      
      {indicators.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Loading technical indicators...</p>
        </div>
      )}
    </div>
  );
}