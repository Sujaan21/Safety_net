import QRCode from 'qrcode';
import { storage } from '../services/storage.js';
import { i18n } from '../services/i18n.js';
import { vaultCrypto } from '../services/crypto.js';
import { security } from '../services/security.js';

export class ProfileComponent {
  constructor(container) {
    this.container = container;
    this.activeSubtab = 'card';
  }

  async render() {
    const profile = storage.getProfile();
    const settings = storage.getSettings();
    const hasPin = storage.hasPinProtection();
    const isUnlocked = vaultCrypto.isUnlocked();

    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in w-full">
        
        <!-- Mobile Subtab Switcher -->
        <div class="lg:hidden flex p-1 bg-slate-200 dark:bg-slate-900/90 rounded-2xl border border-slate-300 dark:border-slate-800">
          <button id="tab-medical-card" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition ${this.activeSubtab === 'card' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">
            ${i18n.t('tabMedicalCard')}
          </button>
          <button id="tab-app-settings" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition ${this.activeSubtab === 'settings' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">
            ${i18n.t('tabSettings')}
          </button>
        </div>

        <!-- Desktop 2-Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT COLUMN: Medical ID & QR Code -->
          <div class="lg:col-span-6 ${this.activeSubtab === 'settings' ? 'hidden lg:block' : 'block'} space-y-5">
            ${this._renderMedicalCardView(profile)}
          </div>

          <!-- RIGHT COLUMN: Contacts, Security Vault & Settings -->
          <div class="lg:col-span-6 ${this.activeSubtab === 'card' ? 'hidden lg:block' : 'block'} space-y-5">
            ${this._renderSecurityVaultBanner(hasPin, isUnlocked)}
            ${this._renderSettingsView(profile, settings, hasPin, isUnlocked)}
          </div>

        </div>
      </div>
    `;

    this._bindEvents(profile, settings);
    await this._generateQrCode(profile);
  }

  _renderSecurityVaultBanner(hasPin, isUnlocked) {
    if (!hasPin) {
      return `
        <div class="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
          <div class="flex items-center space-x-3">
            <span class="text-xl">⚠️</span>
            <div>
              <p class="font-bold text-amber-700 dark:text-amber-300">${i18n.t('securityVault')}</p>
              <p class="text-[11px] text-amber-600/80 dark:text-amber-400/80">${i18n.t('securityVaultDesc')}</p>
            </div>
          </div>
          <button id="btn-setup-pin-modal" class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition">
            ${i18n.t('setPin')}
          </button>
        </div>
      `;
    }

    return `
      <div class="p-4 rounded-3xl ${isUnlocked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} border flex items-center justify-between text-xs">
        <div class="flex items-center space-x-3">
          <span class="text-xl">${isUnlocked ? '🔓' : '🔒'}</span>
          <div>
            <p class="font-bold ${isUnlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}">
              ${isUnlocked ? i18n.t('vaultUnlocked') : i18n.t('vaultLocked')}
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">AES-256-GCM Zero-Knowledge Protection</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button id="${isUnlocked ? 'btn-lock-vault' : 'btn-unlock-vault'}" class="px-3 py-1.5 rounded-xl ${isUnlocked ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-500'} text-white font-bold text-xs shadow-md transition">
            ${isUnlocked ? i18n.t('lockVaultNow') : i18n.t('unlockVaultNow')}
          </button>
          ${isUnlocked ? `
            <button id="btn-remove-pin" class="px-2 py-1.5 rounded-xl bg-rose-600/20 text-rose-500 border border-rose-500/30 hover:bg-rose-600 hover:text-white font-bold text-[10px] transition">
              ${i18n.t('removePin')}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  _renderMedicalCardView(profile) {
    const primaryContact = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];

    return `
      <div class="glass-card rounded-3xl p-6 border-2 border-red-500/40 shadow-2xl relative overflow-hidden space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div class="flex items-center space-x-3">
            <span class="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-red-600/30">
              +
            </span>
            <div>
              <h2 class="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">${i18n.t('medicalIdTitle')}</h2>
              <p class="text-[10px] text-red-500 font-bold tracking-wide">${i18n.t('firstResponderAccess')}</p>
            </div>
          </div>

          <span class="px-3.5 py-1 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs md:text-sm font-black">
            ${security.escapeHTML(profile.bloodType) || 'Unknown'}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('fullName')}</span>
            <span class="text-slate-900 dark:text-white font-bold text-sm truncate block mt-0.5">${security.escapeHTML(profile.name) || 'Not Specified'}</span>
          </div>

          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('primaryContact')}</span>
            <span class="text-slate-900 dark:text-white font-bold truncate block mt-0.5">${security.escapeHTML(primaryContact ? primaryContact.name : 'None')}</span>
            <a href="tel:${security.escapeHTML(primaryContact?.phone || '')}" class="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">${security.escapeHTML(primaryContact?.phone || '')}</a>
          </div>

          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('knownAllergies')}</span>
            <span class="text-rose-600 dark:text-rose-300 font-medium block mt-0.5">${security.escapeHTML(profile.allergies) || 'None'}</span>
          </div>

          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('medications')}</span>
            <span class="text-slate-700 dark:text-slate-200 font-medium block mt-0.5">${security.escapeHTML(profile.medications) || 'None'}</span>
          </div>
        </div>

        ${profile.emergencyNotes ? `
          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('criticalNotes')}</span>
            <p class="text-amber-700 dark:text-amber-200 font-medium mt-1 leading-relaxed">${security.escapeHTML(profile.emergencyNotes)}</p>
          </div>
        ` : ''}

        <div class="p-4 bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3">
          <canvas id="medical-qr-canvas" class="rounded-xl shadow-md max-w-[160px] max-h-[160px]"></canvas>
          <div class="text-center">
            <p class="text-xs font-bold text-slate-800 dark:text-slate-200">${i18n.t('scanQrTitle')}</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400">${i18n.t('scanQrSub')}</p>
          </div>
        </div>
      </div>
    `;
  }

  _renderSettingsView(profile, settings, hasPin, isUnlocked) {
    const isProtected = hasPin && !isUnlocked;

    return `
      <div class="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        <!-- Medical Details Section -->
        <div>
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-3">${i18n.t('personalMedicalDetails')}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">${i18n.t('fullName')}</label>
              <input type="text" id="prof-name" value="${security.escapeHTML(profile.name)}" ${isProtected ? 'disabled' : ''} class="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 focus:outline-none disabled:opacity-50" />
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">${i18n.t('bloodGroup')}</label>
              <input type="text" id="prof-blood" value="${security.escapeHTML(profile.bloodType)}" ${isProtected ? 'disabled' : ''} class="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 focus:outline-none disabled:opacity-50" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">${i18n.t('knownAllergies')}</label>
              <input type="text" id="prof-allergies" value="${security.escapeHTML(profile.allergies)}" ${isProtected ? 'disabled' : ''} class="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 focus:outline-none disabled:opacity-50" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">${i18n.t('medications')}</label>
              <input type="text" id="prof-meds" value="${security.escapeHTML(profile.medications)}" ${isProtected ? 'disabled' : ''} class="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 focus:outline-none disabled:opacity-50" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">${i18n.t('criticalNotes')}</label>
              <textarea id="prof-notes" rows="2" ${isProtected ? 'disabled' : ''} class="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 focus:outline-none disabled:opacity-50">${security.escapeHTML(profile.emergencyNotes)}</textarea>
            </div>
          </div>
        </div>

        <!-- Emergency Contacts Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">${i18n.t('emergencyContactsTitle')}</h3>
            <button id="add-contact-btn" ${isProtected ? 'disabled' : ''} class="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-40">
              ${i18n.t('addContact')}
            </button>
          </div>

          <div class="space-y-2.5" id="contacts-list">
            ${(profile.contacts || []).map(contact => `
              <div class="p-3 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <div class="space-y-0.5">
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-slate-900 dark:text-white">${security.escapeHTML(contact.name)}</span>
                    ${contact.isPrimary ? `<span class="px-2 py-0.5 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 rounded-full text-[9px] font-black">${i18n.t('primaryTag')}</span>` : ''}
                  </div>
                  <p class="text-slate-500 dark:text-slate-400 text-[11px]">${security.escapeHTML(contact.phone)} • ${security.escapeHTML(contact.relationship)}</p>
                </div>
                ${!isProtected ? `
                  <div class="flex items-center space-x-2">
                    ${!contact.isPrimary ? `<button data-make-primary="${contact.id}" class="text-[10px] font-bold text-slate-500 hover:text-cyan-500">${i18n.t('setPrimary')}</button>` : ''}
                    <button data-delete-contact="${contact.id}" class="text-xs text-rose-500 hover:text-rose-400">✕</button>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Gemini API Key Section -->
        <div class="p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <label class="font-bold text-slate-900 dark:text-white block">${i18n.t('geminiApiKeyTitle')}</label>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">${i18n.t('geminiApiKeyDesc')}</p>
          <input type="password" id="set-gemini-key" value="${security.escapeHTML(settings.geminiApiKey)}" ${isProtected ? 'disabled' : ''} placeholder="AIzaSy..." class="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:border-cyan-500 focus:outline-none disabled:opacity-50" />
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 pt-2">
          <button id="save-settings-btn" ${isProtected ? 'disabled' : ''} class="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-600/30 transition disabled:opacity-50">
            ${i18n.t('saveChanges')}
          </button>
          <button id="export-backup-btn" class="py-3 px-4 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition">
            ${i18n.t('exportBackup')}
          </button>
        </div>

      </div>
    `;
  }

  async _generateQrCode(profile) {
    const canvas = this.container.querySelector('#medical-qr-canvas');
    if (!canvas) return;

    const primaryContact = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];
    const qrData = JSON.stringify({
      app: 'SafetyNet Medical Sentinel',
      name: profile.name,
      blood: profile.bloodType,
      allergies: profile.allergies,
      meds: profile.medications,
      notes: profile.emergencyNotes,
      primaryContact: primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : 'None'
    });

    try {
      await QRCode.toCanvas(canvas, qrData, {
        width: 160,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
    } catch (err) {
      console.warn('QR code generation failed:', err);
    }
  }

  _bindEvents(profile, settings) {
    const btnCard = this.container.querySelector('#tab-medical-card');
    const btnSettings = this.container.querySelector('#tab-app-settings');
    if (btnCard) btnCard.addEventListener('click', () => { this.activeSubtab = 'card'; this.render(); });
    if (btnSettings) btnSettings.addEventListener('click', () => { this.activeSubtab = 'settings'; this.render(); });

    const btnSetupPin = this.container.querySelector('#btn-setup-pin-modal');
    if (btnSetupPin) {
      btnSetupPin.addEventListener('click', async () => {
        const pin = prompt(i18n.t('enterPin'));
        if (pin) {
          if (!security.isValidPin(pin)) {
            alert('PIN must be 4 to 6 numeric digits.');
            return;
          }
          const duress = prompt('Optional: Set a Duress / Silent SOS PIN (or leave blank):');
          await storage.setupSecurityPin(pin, duress);
          alert(i18n.t('pinSetSuccess'));
          this.render();
        }
      });
    }

    const btnLock = this.container.querySelector('#btn-lock-vault');
    if (btnLock) {
      btnLock.addEventListener('click', () => {
        vaultCrypto.lock();
        this.render();
      });
    }

    const btnRemovePin = this.container.querySelector('#btn-remove-pin');
    if (btnRemovePin) {
      btnRemovePin.addEventListener('click', () => {
        if (confirm('Are you sure you want to disable PIN protection?')) {
          storage.removeSecurityPin();
          this.render();
        }
      });
    }

    const btnUnlock = this.container.querySelector('#btn-unlock-vault');
    if (btnUnlock) {
      btnUnlock.addEventListener('click', async () => {
        const enteredPin = prompt(i18n.t('enterPin'));
        if (enteredPin) {
          const meta = storage.getVaultMeta();
          const res = await vaultCrypto.unlock(enteredPin, meta, meta.duressPin);
          if (res.success) {
            if (res.duress) {
              alert('Duress Mode Activated. Normal profile unlocked.');
            }
            this.render();
          } else {
            alert(i18n.t('invalidPin'));
          }
        }
      });
    }

    const btnSave = this.container.querySelector('#save-settings-btn');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const updatedProfile = {
          ...profile,
          name: this.container.querySelector('#prof-name')?.value || profile.name,
          bloodType: this.container.querySelector('#prof-blood')?.value || profile.bloodType,
          allergies: this.container.querySelector('#prof-allergies')?.value || profile.allergies,
          medications: this.container.querySelector('#prof-meds')?.value || profile.medications,
          emergencyNotes: this.container.querySelector('#prof-notes')?.value || profile.emergencyNotes,
        };

        const updatedSettings = {
          ...settings,
          geminiApiKey: this.container.querySelector('#set-gemini-key')?.value || '',
        };

        storage.saveProfile(updatedProfile);
        storage.saveSettings(updatedSettings);
        alert(i18n.t('saveSuccess'));
        this.render();
      });
    }

    const btnAddContact = this.container.querySelector('#add-contact-btn');
    if (btnAddContact) {
      btnAddContact.addEventListener('click', () => {
        const name = prompt(i18n.t('promptContactName'));
        if (!name) return;
        const phone = prompt(i18n.t('promptContactPhone'));
        if (!phone) return;
        const rel = prompt(i18n.t('promptContactRel')) || 'Emergency Contact';

        const newContact = {
          id: `c_${Date.now()}`,
          name,
          phone,
          relationship: rel,
          isPrimary: (profile.contacts || []).length === 0
        };

        const updatedContacts = [...(profile.contacts || []), newContact];
        storage.saveProfile({ ...profile, contacts: updatedContacts });
        this.render();
      });
    }

    const btnExport = this.container.querySelector('#export-backup-btn');
    if (btnExport) {
      btnExport.addEventListener('click', () => storage.exportData());
    }

    this.container.querySelectorAll('[data-delete-contact]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-contact');
        const updatedContacts = profile.contacts.filter(c => c.id !== id);
        storage.saveProfile({ ...profile, contacts: updatedContacts });
        this.render();
      });
    });

    this.container.querySelectorAll('[data-make-primary]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-make-primary');
        const updatedContacts = profile.contacts.map(c => ({
          ...c,
          isPrimary: c.id === id
        }));
        storage.saveProfile({ ...profile, contacts: updatedContacts });
        this.render();
      });
    });
  }
}