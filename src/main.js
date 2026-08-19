import './style.css';
import { SosComponent } from './components/sos.js';
import { TimerComponent } from './components/timer.js';
import { MapComponent } from './components/map.js';
import { ChatComponent } from './components/chat.js';
import { ProfileComponent } from './components/profile.js';
import { AuthComponent } from './components/auth.js';
import { sound } from './services/sound.js';
import { locationService } from './services/location.js';
import { storage } from './services/storage.js';
import { i18n } from './services/i18n.js';
import { vaultCrypto } from './services/crypto.js';

class App {
  constructor() {
    this.currentTab = 'sos';
    this.container = document.getElementById('tab-content');
    this.components = {};
    this.authComponent = null;
    this.isCamouflage = false;
  }

  async init() {
    // 1. Initialize Theme from storage
    this._applyTheme(storage.getSettings().theme || 'dark');

    // 2. Initialize Components
    this.authComponent = new AuthComponent(this.container);
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
    this._bindSecurityListeners();
    this._updateStaticTranslations();
    this._updateAuthHeaderUi();

    // 4. Start continuous location tracking
    locationService.startTracking(() => {});

    // 5. Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service worker registration error:', err);
      });
    }

    // 6. Check Auth State and Render
    if (!AuthComponent.isAuthenticated()) {
      this._showAuthGate();
    } else {
      this.switchTab('sos');
    }

    // 7. Reactive Listeners
    window.addEventListener('safetynet:language-changed', () => {
      this._updateStaticTranslations();
      this._updateAuthHeaderUi();
      if (AuthComponent.isAuthenticated()) {
        this.components[this.currentTab].render();
      } else {
        this._showAuthGate();
      }
    });

    window.addEventListener('safetynet:auth-changed', (e) => {
      this._updateAuthHeaderUi();
      if (e.detail?.user) {
        this.switchTab('sos');
      } else {
        this._showAuthGate();
      }
    });
  }

  _showAuthGate() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.add('opacity-40', 'pointer-events-none'));
    this.authComponent.render();
  }

  _updateAuthHeaderUi() {
    const user = AuthComponent.getCurrentUser();
    const userContainer = document.getElementById('header-user-badge');
    if (!userContainer) return;

    if (user) {
      userContainer.innerHTML = `
        <div class="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
            ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div class="hidden sm:block text-left">
            <p class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">${user.name || 'User'}</p>
            <button id="btn-header-logout" class="text-[10px] text-rose-500 hover:text-rose-400 font-bold block">${i18n.t('logout')}</button>
          </div>
        </div>
      `;

      const logoutBtn = document.getElementById('btn-header-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to log out?')) {
            AuthComponent.logout();
          }
        });
      }
    } else {
      userContainer.innerHTML = `
        <button id="btn-header-login" class="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition">
          ${i18n.t('authLoginBtn')}
        </button>
      `;
      const loginBtn = document.getElementById('btn-header-login');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => this._showAuthGate());
      }
    }
  }

  _bindSecurityListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && storage.hasPinProtection()) {
        vaultCrypto.lock();
        if (this.currentTab === 'profile') {
          this.components.profile.render();
        }
      }
    });

    window.addEventListener('safetynet:duress-triggered', async () => {
      console.warn('🚨 DURESS MODE TRIGGERED: Activating silent emergency beacon.');
      try {
        const coords = await locationService.getCurrentLocation();
        const profile = storage.getProfile();
        const primary = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];
        if (primary && primary.phone) {
          const silentMsg = `🚨 SILENT DURESS ALERT: User entered duress PIN. Immediate assistance required. GPS: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
          console.log('Silent Duress Telemetry Dispatch prepared for:', primary.phone, silentMsg);
        }
      } catch (err) {
        console.warn('Duress location capture fallback:', err);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleCamouflage();
      }
    });
  }

  toggleCamouflage() {
    this.isCamouflage = !this.isCamouflage;
    const camoEl = document.getElementById('camouflage-screen');
    if (!camoEl) return;

    if (this.isCamouflage) {
      camoEl.classList.remove('hidden');
      camoEl.classList.add('flex');
    } else {
      camoEl.classList.add('hidden');
      camoEl.classList.remove('flex');
    }
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

    if (AuthComponent.isAuthenticated()) {
      this.components[this.currentTab].render();
    } else {
      this._showAuthGate();
    }
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
    if (!AuthComponent.isAuthenticated()) {
      this._showAuthGate();
      return;
    }

    if (!this.components[tabName]) return;

    if (this.currentTab === 'map' && tabName !== 'map') {
      this.components.map.destroy();
    }

    this.currentTab = tabName;

    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.remove('opacity-40', 'pointer-events-none');
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

    const camoBtn = document.getElementById('header-camo-btn');
    if (camoBtn) {
      camoBtn.addEventListener('click', () => this.toggleCamouflage());
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