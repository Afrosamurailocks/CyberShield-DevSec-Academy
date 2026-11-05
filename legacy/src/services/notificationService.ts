import { SecurityAlert, DailyTip } from '../types';
import { storageService } from './storageService';

export const notificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      storageService.setPushEnabled(granted);
      return granted;
    } catch {
      return false;
    }
  },

  sendPush(title: string, options?: NotificationOptions): boolean {
    if (!this.isSupported()) return false;
    if (Notification.permission !== 'granted') return false;

    try {
      new Notification(title, {
        icon: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/2092/2092663.png',
        ...options
      });
      return true;
    } catch {
      return false;
    }
  },

  sendUrgentAlert(alert: SecurityAlert): void {
    const title = `🚨 [ALERTA DE SEGURANÇA] ${alert.title}`;
    const options: NotificationOptions = {
      body: alert.message,
      tag: `sec-alert-${alert.id}`,
      requireInteraction: true
    };
    this.sendPush(title, options);
  },

  sendDailyTip(tip: DailyTip): void {
    const title = `💡 ${tip.title}`;
    const options: NotificationOptions = {
      body: `${tip.shortTip}\n\n${tip.detailedAction}`,
      tag: `daily-tip-${tip.id}`
    };
    this.sendPush(title, options);
  }
};
