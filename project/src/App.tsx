import React, { useState, useEffect } from 'react';
import { CurrencyPair, PriceData, TechnicalIndicator, TradingSignal, Portfolio } from './types/forex';
import { forexAPI } from './services/forexApi';
import { TechnicalAnalysisService } from './services/technicalAnalysis';
import { portfolioService } from './services/portfolioService';
import { alertService } from './services/alertService';
import { Navbar } from './components/Navbar';
import { CurrencyPairCard } from './components/CurrencyPairCard';
import { TradingChart } from './components/TradingChart';
import { TechnicalIndicators } from './components/TechnicalIndicators';
import { TradingSignals } from './components/TradingSignals';
import { Portfolio as PortfolioComponent } from './components/Portfolio';
import { AlertManager } from './components/AlertManager';

function App() {
  const [pairs, setPairs] = useState<CurrencyPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD');
  const [historicalData, setHistoricalData] = useState<PriceData[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({ totalValue: 10000, totalPnL: 0, totalPnLPercent: 0, positions: [] });
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'portfolio' | 'alerts'>('overview');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        // Subscribe to real-time updates
        unsubscribe = forexAPI.subscribe((updatedPairs) => {
          setPairs(updatedPairs);
          portfolioService.updatePositions(updatedPairs);
          setPortfolio(portfolioService.getPortfolio());
          alertService.checkAlerts(updatedPairs);
        });

        // Load initial data
        const initialPairs = await forexAPI.getCurrencyPairs();
        setPairs(initialPairs);
        
        // Load historical data for selected pair
        const data = await forexAPI.getHistoricalData(selectedPair);
        setHistoricalData(data);
        
        // Calculate indicators and signals
        const techIndicators = TechnicalAnalysisService.getTechnicalIndicators(selectedPair, data);
        const tradingSignals = TechnicalAnalysisService.generateSignals(selectedPair, data);
        
        setIndicators(techIndicators);
        setSignals(tradingSignals);
        setPortfolio(portfolioService.getPortfolio());
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setLoading(false);
      }
    };

    initialize();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedPair]);

  const handlePairSelection = async (pair: string) => {
    setSelectedPair(pair);
    try {
      const data = await forexAPI.getHistoricalData(pair);
      setHistoricalData(data);
      
      const techIndicators = TechnicalAnalysisService.getTechnicalIndicators(pair, data);
      setIndicators(techIndicators);
      
      const tradingSignals = TechnicalAnalysisService.generateSignals(pair, data);
      setSignals(tradingSignals);
    } catch (error) {
      console.error('Error loading pair data:', error);
    }
  };

  const handleAddPosition = (pair: string, type: 'LONG' | 'SHORT', size: number, price: number) => {
    portfolioService.addPosition(pair, type, size, price);
    setPortfolio(portfolioService.getPortfolio());
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Forex data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Navbar isDark={isDark} onToggleTheme={toggleTheme} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-6">
          {[
            { id: 'overview', label: 'Market Overview' },
            { id: 'chart', label: 'Chart Analysis' },
            { id: 'portfolio', label: 'Portfolio' },
            { id: 'alerts', label: 'Alerts' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Market Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Currency Pairs Grid */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Live Currency Pairs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pairs.map((pair) => (
                  <CurrencyPairCard
                    key={pair.pair}
                    pair={pair}
                    onClick={handlePairSelection}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Technical Indicators */}
              <TechnicalIndicators indicators={indicators} />
              
              {/* Trading Signals */}
              <TradingSignals signals={signals} />
            </div>
          </div>
        )}

        {/* Chart Analysis Tab */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Chart Analysis
                </h2>
                <select
                  value={selectedPair}
                  onChange={(e) => handlePairSelection(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {pairs.map((pair) => (
                    <option key={pair.pair} value={pair.pair}>
                      {pair.pair}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <TradingChart data={historicalData} pair={selectedPair} height={500} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TechnicalIndicators indicators={indicators} />
              <TradingSignals signals={signals} />
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <PortfolioComponent
            portfolio={portfolio}
            onAddPosition={handleAddPosition}
          />
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <AlertManager />
        )}
      </div>
    </div>
  );
}

export default App;