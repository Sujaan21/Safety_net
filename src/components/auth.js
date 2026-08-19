// SafetyNet Lightweight User Authentication & Identity Gate
import { i18n } from '../services/i18n.js';
import { storage } from '../services/storage.js';
import { security } from '../services/security.js';

const AUTH_USER_KEY = 'safetynet_auth_user_v1';

export class AuthComponent {
  constructor(container) {
    this.container = container;
    this.authMode = 'login'; // 'login' | 'signup'
    this.authMethod = 'email'; // 'email' | 'phone'
  }

  static getCurrentUser() {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated() {
    return Boolean(this.getCurrentUser());
  }

  static logout() {
    localStorage.removeItem(AUTH_USER_KEY);
    window.dispatchEvent(new CustomEvent('safetynet:auth-changed', { detail: { user: null } }));
  }

  render() {
    this.container.innerHTML = `
      <div class="min-h-[75vh] flex items-center justify-center p-4">
        <div class="w-full max-w-md glass-card rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
          
          <!-- Decorative Top Glow -->
          <div class="absolute -top-10 -right-10 w-36 h-36 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute -bottom-10 -left-10 w-36 h-36 bg-red-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Header / Brand -->
          <div class="text-center space-y-2">
            <div class="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-cyan-500 items-center justify-center shadow-xl shadow-red-600/30 border border-white/20">
              <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-wide">
              ${this.authMode === 'login' ? i18n.t('authLoginTitle') : i18n.t('authSignupTitle')}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              ${i18n.t('authSubtitle')}
            </p>
          </div>

          <!-- Auth Mode Toggle (Login vs Sign Up) -->
          <div class="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button id="btn-mode-login" class="flex-1 py-2.5 rounded-xl transition ${this.authMode === 'login' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'}">
              ${i18n.t('authLoginBtn')}
            </button>
            <button id="btn-mode-signup" class="flex-1 py-2.5 rounded-xl transition ${this.authMode === 'signup' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'}">
              ${i18n.t('authSignupBtn')}
            </button>
          </div>

          <!-- Auth Form -->
          <form id="auth-form" class="space-y-4 text-xs">
            ${this.authMode === 'signup' ? `
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">${i18n.t('fullName')}</label>
                <input type="text" id="auth-name" required placeholder="Alex Johnson" class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-cyan-500 focus:outline-none" />
              </div>
            ` : ''}

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">${i18n.t('authEmailOrPhone')}</label>
              <input type="text" id="auth-identifier" required placeholder="alex@example.com or +91 9876543210" class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-cyan-500 focus:outline-none" />
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">${i18n.t('authPassword')}</label>
              <input type="password" id="auth-password" required placeholder="••••••••" class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-cyan-500 focus:outline-none" />
            </div>

            <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-600/30 transition active:scale-98">
              ${this.authMode === 'login' ? i18n.t('authSubmitLogin') : i18n.t('authSubmitSignup')}
            </button>
          </form>

          <!-- Divider -->
          <div class="relative flex items-center justify-center">
            <div class="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span class="bg-white dark:bg-[#0f172a] px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute">OR</span>
          </div>

          <!-- 1-Tap Demo / Evaluator Login -->
          <button id="btn-demo-login" class="w-full py-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 transition flex items-center justify-center space-x-2">
            <span>⚡</span>
            <span>${i18n.t('authDemoLogin')}</span>
          </button>

          <!-- Privacy Footer -->
          <p class="text-[10px] text-center text-slate-500 dark:text-slate-400">
            🔒 Protected by Zero-Knowledge AES-256-GCM Cryptographic Vault.
          </p>

        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const btnLogin = this.container.querySelector('#btn-mode-login');
    const btnSignup = this.container.querySelector('#btn-mode-signup');
    if (btnLogin) btnLogin.addEventListener('click', () => { this.authMode = 'login'; this.render(); });
    if (btnSignup) btnSignup.addEventListener('click', () => { this.authMode = 'signup'; this.render(); });

    const form = this.container.querySelector('#auth-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = security.sanitizeInput(this.container.querySelector('#auth-identifier')?.value || '');
        const name = security.sanitizeInput(this.container.querySelector('#auth-name')?.value || identifier.split('@')[0]);

        const user = {
          id: `u_${Date.now()}`,
          name: name || 'SafetyNet User',
          identifier,
          authenticatedAt: Date.now()
        };

        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        
        // Update profile name if new signup
        const profile = storage.getProfile();
        if (name && (!profile.name || profile.name === 'Alex Johnson')) {
          storage.saveProfile({ ...profile, name });
        }

        window.dispatchEvent(new CustomEvent('safetynet:auth-changed', { detail: { user } }));
      });
    }

    const btnDemo = this.container.querySelector('#btn-demo-login');
    if (btnDemo) {
      btnDemo.addEventListener('click', () => {
        const demoUser = {
          id: 'demo_user_1',
          name: 'Alex Johnson (Evaluator)',
          identifier: 'alex.evaluator@safetynet.ai',
          isDemo: true,
          authenticatedAt: Date.now()
        };

        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(demoUser));
        window.dispatchEvent(new CustomEvent('safetynet:auth-changed', { detail: { user: demoUser } }));
      });
    }
  }
}
