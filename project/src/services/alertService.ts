import { Alert, CurrencyPair } from '../types/forex';

class AlertService {
  private alerts: Alert[] = [];
  private listeners: ((alerts: Alert[]) => void)[] = [];

  constructor() {
    this.loadAlerts();
  }

  private loadAlerts() {
    const saved = localStorage.getItem('forex-alerts');
    if (saved) {
      this.alerts = JSON.parse(saved);
    }
  }

  private saveAlerts() {
    localStorage.setItem('forex-alerts', JSON.stringify(this.alerts));
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.alerts]));
  }

  createAlert(pair: string, condition: string, targetPrice: number): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      pair,
      condition,
      targetPrice,
      currentPrice: 0,
      isActive: true,
      triggered: false,
      timestamp: Date.now()
    };

    this.alerts.push(alert);
    this.saveAlerts();
    return alert;
  }

  removeAlert(alertId: string): boolean {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      this.alerts.splice(index, 1);
      this.saveAlerts();
      return true;
    }
    return false;
  }

  toggleAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isActive = !alert.isActive;
      this.saveAlerts();
      return true;
    }
    return false;
  }

  checkAlerts(pairs: CurrencyPair[]) {
    let triggeredAlerts: Alert[] = [];

    this.alerts.forEach(alert => {
      if (!alert.isActive || alert.triggered) return;

      const pair = pairs.find(p => p.pair === alert.pair);
      if (!pair) return;

      alert.currentPrice = pair.bid;

      let triggered = false;
      switch (alert.condition) {
        case 'above':
          triggered = pair.bid >= alert.targetPrice;
          break;
        case 'below':
          triggered = pair.bid <= alert.targetPrice;
          break;
        case 'crosses_above':
          triggered = pair.bid >= alert.targetPrice;
          break;
        case 'crosses_below':
          triggered = pair.bid <= alert.targetPrice;
          break;
      }

      if (triggered) {
        alert.triggered = true;
        alert.isActive = false;
        triggeredAlerts.push(alert);
        this.showNotification(alert);
      }
    });

    if (triggeredAlerts.length > 0) {
      this.saveAlerts();
    }
  }

  private showNotification(alert: Alert) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Forex Alert Triggered`, {
        body: `${alert.pair} has ${alert.condition} ${alert.targetPrice}`,
        icon: '/favicon.ico'
      });
    }
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  subscribe(listener: (alerts: Alert[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }
}

export const alertService = new AlertService();