// SafetyNet Storage & State Management with Cryptographic Vault
import { vaultCrypto } from './crypto.js';
import { security } from './security.js';

const PROFILE_KEY = 'safetynet_profile_v1';
const SETTINGS_KEY = 'safetynet_settings_v1';
const VAULT_META_KEY = 'safetynet_vault_meta_v1';

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
  emergencyHotline: '112',
  autoLockOnBackground: true,
  stealthCamouflage: false
};

export const storage = {
  getVaultMeta() {
    try {
      const data = localStorage.getItem(VAULT_META_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  hasPinProtection() {
    const meta = this.getVaultMeta();
    return Boolean(meta && meta.hasPin && meta.verifier);
  },

  async setupSecurityPin(pin, duressPin = '') {
    if (!security.isValidPin(pin)) {
      throw new Error('PIN must be 4 to 6 numeric digits');
    }
    const verifier = await vaultCrypto.createVerifier(pin);
    const meta = {
      hasPin: true,
      verifier,
      duressPin: duressPin && security.isValidPin(duressPin) ? duressPin : null,
      updatedAt: Date.now()
    };
    localStorage.setItem(VAULT_META_KEY, JSON.stringify(meta));
    vaultCrypto._sessionKey = pin;
    vaultCrypto._isUnlocked = true;
    window.dispatchEvent(new CustomEvent('safetynet:vault-meta-updated', { detail: meta }));
    return true;
  },

  removeSecurityPin() {
    localStorage.removeItem(VAULT_META_KEY);
    vaultCrypto.lock();
    window.dispatchEvent(new CustomEvent('safetynet:vault-meta-updated', { detail: null }));
  },

  getProfile() {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (!data) return defaultProfile;
      const parsed = JSON.parse(data);
      return { ...defaultProfile, ...parsed };
    } catch (e) {
      console.error('Failed to load profile', e);
      return defaultProfile;
    }
  },

  saveProfile(profile) {
    try {
      const sanitized = {
        name: security.sanitizeInput(profile.name || '', 60),
        bloodType: security.sanitizeInput(profile.bloodType || '', 10),
        allergies: security.sanitizeInput(profile.allergies || '', 200),
        medications: security.sanitizeInput(profile.medications || '', 200),
        emergencyNotes: security.sanitizeInput(profile.emergencyNotes || '', 400),
        organDonor: Boolean(profile.organDonor),
        contacts: (profile.contacts || []).map(c => ({
          id: c.id || `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: security.sanitizeInput(c.name || '', 60),
          phone: security.sanitizeInput(c.phone || '', 25),
          relationship: security.sanitizeInput(c.relationship || '', 40),
          isPrimary: Boolean(c.isPrimary)
        }))
      };

      localStorage.setItem(PROFILE_KEY, JSON.stringify(sanitized));
      window.dispatchEvent(new CustomEvent('safetynet:profile-updated', { detail: sanitized }));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  getSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
    } catch (e) {
      console.error('Failed to load settings', e);
      return defaultSettings;
    }
  },

  saveSettings(settings) {
    try {
      const sanitized = {
        ...defaultSettings,
        ...settings,
        geminiApiKey: security.sanitizeInput(settings.geminiApiKey || '', 120),
        customSosMessage: security.sanitizeInput(settings.customSosMessage || '', 300),
        emergencyHotline: security.sanitizeInput(settings.emergencyHotline || '112', 10)
      };

      localStorage.setItem(SETTINGS_KEY, JSON.stringify(sanitized));
      window.dispatchEvent(new CustomEvent('safetynet:settings-updated', { detail: sanitized }));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  exportData() {
    const data = {
      profile: this.getProfile(),
      settings: { ...this.getSettings(), geminiApiKey: '' },
      hasPin: this.hasPinProtection(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safetynet-vault-${new Date().toISOString().slice(0, 10)}.json`;
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
