import './style.css';
import { SosComponent } from './components/sos.js';
import { TimerComponent } from './components/timer.js';
import { MapComponent } from './components/map.js';
import { ChatComponent } from './components/chat.js';
import { ProfileComponent } from './components/profile.js';
import { sound } from './services/sound.js';
import { locationService } from './services/location.js';
import { storage } from './services/storage.js';
import { i18n } from './services/i18n.js';

class App {
  constructor() {
    this.currentTab = 'sos';
    this.container = document.getElementById('tab-content');
    this.components = {};
  }

  async init() {
    // 1. Initialize Theme from storage
    this._applyTheme(storage.getSettings().theme || 'dark');

    // 2. Initialize Components
    this.components = {
      sos: new SosComponent(this.container),
      timer: new TimerComponent(this.container),
      map: new MapComponent(this.container),
      chat: new ChatComponent(this.container),
      profile: new ProfileComponent(this.container)
    };

    // 3. Bind navigation and header actions
    this._bindNavigation();
    this._bindGlobalHeader();
    this._updateStaticTranslations();
    this.switchTab('sos');

    // 4. Background geolocation warmup
    locationService.getCurrentLocation().catch(() => {});

    // 5. Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service worker registration error:', err);
      });
    }

    // 6. Reactive Language Listener
    window.addEventListener('safetynet:language-changed', () => {
      this._updateStaticTranslations();
      this.components[this.currentTab].render();
    });
  }

  _applyTheme(theme) {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
      themeIcon.innerText = isDark ? '🌙' : '☀️';
    }

    const settings = storage.getSettings();
    if (settings.theme !== theme) {
      storage.saveSettings({ ...settings, theme });
    }
  }

  _toggleTheme() {
    const currentTheme = storage.getSettings().theme || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this._applyTheme(nextTheme);

    // Re-render active tab if needed
    this.components[this.currentTab].render();
  }

  _updateStaticTranslations() {
    const titleEl = document.getElementById('header-app-title');
    const badgeEl = document.getElementById('header-sentinel-badge');
    const langFlag = document.getElementById('lang-flag');
    const langCode = document.getElementById('lang-code');

    if (titleEl) titleEl.innerText = i18n.t('appTitle');
    if (badgeEl) badgeEl.innerText = i18n.t('sentinelLive');

    if (langFlag && langCode) {
      langFlag.innerText = i18n.lang === 'en' ? '🇮🇳' : '🇬🇧';
      langCode.innerText = i18n.lang === 'en' ? 'HI' : 'EN';
    }

    const tabLabelMap = {
      sos: i18n.t('navSos'),
      timer: i18n.t('navTimer'),
      map: i18n.t('navMap'),
      chat: i18n.t('navChat'),
      profile: i18n.t('navMedical')
    };

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      const label = btn.querySelector('.nav-label-text');
      if (label && tabLabelMap[tab]) {
        label.innerText = tabLabelMap[tab];
      }
    });
  }

  switchTab(tabName) {
    if (!this.components[tabName]) return;

    if (this.currentTab === 'map' && tabName !== 'map') {
      this.components.map.destroy();
    }

    this.currentTab = tabName;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-tab');
      const icon = btn.querySelector('.nav-icon');
      const label = btn.querySelector('.nav-label-text');

      if (target === tabName) {
        btn.classList.add('text-cyan-600', 'dark:text-cyan-400');
        btn.classList.remove('text-slate-500', 'dark:text-slate-400', 'text-slate-600');
        if (icon) icon.classList.add('scale-110');
        if (label) label.classList.add('font-bold');
      } else {
        btn.classList.remove('text-cyan-600', 'dark:text-cyan-400');
        btn.classList.add('text-slate-500', 'dark:text-slate-400');
        if (icon) icon.classList.remove('scale-110');
        if (label) label.classList.remove('font-bold');
      }
    });

    this.components[tabName].render();
  }

  _bindNavigation() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    const logoTrigger = document.getElementById('logo-refresh-trigger');
    if (logoTrigger) {
      logoTrigger.addEventListener('click', () => this.switchTab('sos'));
    }
  }

  _bindGlobalHeader() {
    const themeBtn = document.getElementById('header-theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this._toggleTheme());
    }

    const langBtn = document.getElementById('header-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        i18n.toggleLanguage();
      });
    }

    const strobeDismiss = document.getElementById('screen-strobe-overlay');
    if (strobeDismiss) {
      strobeDismiss.addEventListener('click', () => sound.stopSiren());
    }

    const headerSirenBtn = document.getElementById('header-siren-btn');
    if (headerSirenBtn) {
      headerSirenBtn.addEventListener('click', () => sound.toggleSiren());
    }

    window.addEventListener('safetynet:siren-changed', (e) => {
      if (headerSirenBtn) {
        if (e.detail.isPlaying) {
          headerSirenBtn.classList.add('bg-red-500', 'text-white', 'animate-pulse');
          headerSirenBtn.classList.remove('bg-slate-100', 'dark:bg-slate-800/80');
        } else {
          headerSirenBtn.classList.remove('bg-red-500', 'text-white', 'animate-pulse');
          headerSirenBtn.classList.add('bg-slate-100', 'dark:bg-slate-800/80');
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});