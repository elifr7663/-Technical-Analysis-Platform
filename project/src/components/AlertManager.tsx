import React, { useState, useEffect } from 'react';
import { Alert } from '../types/forex';
import { alertService } from '../services/alertService';
import { Bell, BellOff, X, Plus } from 'lucide-react';

export function AlertManager() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    pair: 'EUR/USD',
    condition: 'above',
    targetPrice: 1.0900
  });

  useEffect(() => {
    const unsubscribe = alertService.subscribe(setAlerts);
    setAlerts(alertService.getAlerts());
    alertService.requestNotificationPermission();
    
    return unsubscribe;
  }, []);

  const handleAddAlert = () => {
    alertService.createAlert(newAlert.pair, newAlert.condition, newAlert.targetPrice);
    setShowAddAlert(false);
    setNewAlert({
      pair: 'EUR/USD',
      condition: 'above',
      targetPrice: 1.0900
    });
  };

  const handleRemoveAlert = (alertId: string) => {
    alertService.removeAlert(alertId);
  };

  const handleToggleAlert = (alertId: string) => {
    alertService.toggleAlert(alertId);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bell className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Price Alerts
          </h3>
        </div>
        <button
          onClick={() => setShowAddAlert(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={16} />
          Add Alert
        </button>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {alerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-3 border rounded-lg ${
              alert.triggered 
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' 
                : alert.isActive
                ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                : 'border-gray-300 bg-gray-50 dark:bg-gray-700/20 dark:border-gray-600'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {alert.pair}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {alert.condition} {alert.targetPrice.toFixed(5)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Current: {alert.currentPrice.toFixed(5)} • Created: {formatTime(alert.timestamp)}
                </div>
                {alert.triggered && (
                  <div className="text-sm text-red-600 dark:text-red-400 font-medium mt-1">
                    Alert Triggered!
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAlert(alert.id)}
                  className={`p-1 rounded ${
                    alert.isActive ? 'text-green-500' : 'text-gray-400'
                  }`}
                  disabled={alert.triggered}
                >
                  {alert.isActive ? <Bell size={16} /> : <BellOff size={16} />}
                </button>
                <button
                  onClick={() => handleRemoveAlert(alert.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Bell size={48} className="mx-auto mb-2 opacity-50" />
          <p>No alerts set</p>
          <p className="text-sm">Add alerts to get notified of price movements</p>
        </div>
      )}

      {/* Add Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Price Alert
              </h4>
              <button
                onClick={() => setShowAddAlert(false)}
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
                  value={newAlert.pair}
                  onChange={(e) => setNewAlert({...newAlert, pair: e.target.value})}
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
                  Condition
                </label>
                <select
                  value={newAlert.condition}
                  onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="above">Price goes above</option>
                  <option value="below">Price goes below</option>
                  <option value="crosses_above">Price crosses above</option>
                  <option value="crosses_below">Price crosses below</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Price
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert({...newAlert, targetPrice: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddAlert}
                  className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Alert
                </button>
                <button
                  onClick={() => setShowAddAlert(false)}
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