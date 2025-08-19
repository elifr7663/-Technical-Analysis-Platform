import React, { useEffect, useRef, useState } from 'react';
import { PriceData } from '../types/forex';
import { TechnicalAnalysisService } from '../services/technicalAnalysis';

interface TradingChartProps {
  data: PriceData[];
  pair: string;
  height?: number;
}

export function TradingChart({ data, pair, height = 400 }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSMA, setShowSMA] = useState(true);
  const [showRSI, setShowRSI] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const chartHeight = showRSI ? height * 0.7 : height;
    const rsiHeight = showRSI ? height * 0.3 : 0;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate price range
    const prices = data.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    // Draw candlesticks
    const candleWidth = Math.max(1, (width - 40) / data.length - 2);
    
    data.forEach((candle, index) => {
      const x = 20 + (index * (width - 40)) / data.length;
      const highY = 20 + ((maxPrice + padding - candle.high) / (priceRange + 2 * padding)) * (chartHeight - 40);
      const lowY = 20 + ((maxPrice + padding - candle.low) / (priceRange + 2 * padding)) * (chartHeight - 40);
      const openY = 20 + ((maxPrice + padding - candle.open) / (priceRange + 2 * padding)) * (chartHeight - 40);
      const closeY = 20 + ((maxPrice + padding - candle.close) / (priceRange + 2 * padding)) * (chartHeight - 40);

      const isGreen = candle.close > candle.open;
      
      // Draw wick
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, highY);
      ctx.lineTo(x + candleWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      const bodyHeight = Math.abs(closeY - openY);
      const bodyY = Math.min(openY, closeY);
      ctx.fillRect(x, bodyY, candleWidth, Math.max(1, bodyHeight));
    });

    // Draw SMA if enabled
    if (showSMA && data.length > 20) {
      const sma20 = TechnicalAnalysisService.calculateSMA(data, 20);
      const sma50 = TechnicalAnalysisService.calculateSMA(data, 50);

      // SMA 20
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      sma20.forEach((value, index) => {
        const x = 20 + ((index + 20) * (width - 40)) / data.length;
        const y = 20 + ((maxPrice + padding - value) / (priceRange + 2 * padding)) * (chartHeight - 40);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // SMA 50
      if (sma50.length > 0) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        sma50.forEach((value, index) => {
          const x = 20 + ((index + 50) * (width - 40)) / data.length;
          const y = 20 + ((maxPrice + padding - value) / (priceRange + 2 * padding)) * (chartHeight - 40);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    }

    // Draw RSI if enabled
    if (showRSI && data.length > 14) {
      const rsi = TechnicalAnalysisService.calculateRSI(data);
      const rsiY = chartHeight + 10;
      
      // RSI background
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(20, rsiY, width - 40, rsiHeight - 20);

      // RSI levels
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      // 70 line
      const y70 = rsiY + (30 / 100) * (rsiHeight - 20);
      ctx.beginPath();
      ctx.moveTo(20, y70);
      ctx.lineTo(width - 20, y70);
      ctx.stroke();
      
      // 30 line
      const y30 = rsiY + (70 / 100) * (rsiHeight - 20);
      ctx.beginPath();
      ctx.moveTo(20, y30);
      ctx.lineTo(width - 20, y30);
      ctx.stroke();
      
      ctx.setLineDash([]);

      // RSI line
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      rsi.forEach((value, index) => {
        const x = 20 + ((index + 14) * (width - 40)) / data.length;
        const y = rsiY + ((100 - value) / 100) * (rsiHeight - 20);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw price labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i / 5);
      const y = chartHeight - 20 - (i * (chartHeight - 40) / 5);
      ctx.fillText(price.toFixed(5), width - 5, y + 4);
    }

  }, [data, showSMA, showRSI, height]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {pair} Chart
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`px-3 py-1 text-sm rounded ${
              showSMA 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            SMA
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-3 py-1 text-sm rounded ${
              showRSI 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            RSI
          </button>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="border border-gray-200 dark:border-gray-700 rounded"
      />
    </div>
  );
}