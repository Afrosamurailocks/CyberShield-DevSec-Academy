import { UserProfile, SecurityAlert } from '../types';
import { INITIAL_USER } from '../data/mockTeamData';
import { INITIAL_ALERTS } from '../data/alertsAndTips';

const USER_STORAGE_KEY = 'cybershield_user_profile_v1';
const ALERTS_STORAGE_KEY = 'cybershield_alerts_v1';
const PUSH_PREF_KEY = 'cybershield_push_notifications_enabled';

export const storageService = {
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return INITIAL_USER;
  },

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  },

  getAlerts(): SecurityAlert[] {
    try {
      const data = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return INITIAL_ALERTS;
  },

  saveAlerts(alerts: SecurityAlert[]): void {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch {
      // ignore
    }
  },

  isPushEnabled(): boolean {
    return localStorage.getItem(PUSH_PREF_KEY) === 'true';
  },

  setPushEnabled(enabled: boolean): void {
    localStorage.setItem(PUSH_PREF_KEY, enabled ? 'true' : 'false');
  },

  resetProgress(): UserProfile {
    localStorage.removeItem(USER_STORAGE_KEY);
    return INITIAL_USER;
  }
};
