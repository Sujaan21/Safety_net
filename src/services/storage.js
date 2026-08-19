// SafetyNet Storage & State Management
const PROFILE_KEY = 'safetynet_profile_v1';
const SETTINGS_KEY = 'safetynet_settings_v1';

const defaultProfile = {
  name: 'Alex Johnson',
  bloodType: 'O+',
  allergies: 'Penicillin, Peanuts',
  medications: 'Asthma Inhaler (Albuterol)',
  emergencyNotes: 'Carries EpiPen in backpack. Asthmatic.',
  organDonor: true,
  contacts: [
    { id: 'c1', name: 'Sarah Johnson', phone: '+1234567890', relationship: 'Spouse / Parent', isPrimary: true },
    { id: 'c2', name: 'David Smith', phone: '+1987654321', relationship: 'Close Friend', isPrimary: false }
  ]
};

const defaultSettings = {
  geminiApiKey: '',
  theme: 'dark', // 'dark' | 'light'
  language: 'en', // 'en' | 'hi'
  sirenVolume: 0.9,
  vibrateOnAlert: true,
  strobeOnAlert: true,
  speechFeedback: true,
  customSosMessage: '',
  checkInDurationMinutes: 15,
  emergencyHotline: '112'
};

export const storage = {
  getProfile() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return defaultProfile;
    }
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      return data ? { ...defaultProfile, ...JSON.parse(data) } : defaultProfile;
    } catch (e) {
      return defaultProfile;
    }
  },

  saveProfile(profile) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new CustomEvent('safetynet:profile-updated', { detail: profile }));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getSettings() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return defaultSettings;
    }
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  },

  saveSettings(settings) {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      window.dispatchEvent(new CustomEvent('safetynet:settings-updated', { detail: settings }));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  exportData() {
    const data = {
      profile: this.getProfile(),
      settings: { ...this.getSettings(), geminiApiKey: '' },
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safetynet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (data.settings) this.saveSettings({ ...this.getSettings(), ...data.settings });
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  }
};