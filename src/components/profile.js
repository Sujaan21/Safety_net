import { storage } from '../services/storage.js';
import { i18n } from '../services/i18n.js';

export class ProfileComponent {
  constructor(container) {
    this.container = container;
    this.activeSubtab = 'card';
  }

  async render() {
    const profile = storage.getProfile();
    const settings = storage.getSettings();

    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in w-full">
        
        <!-- Mobile Subtab Switcher (Hidden on Desktop >= lg) -->
        <div class="lg:hidden flex p-1 bg-slate-200 dark:bg-slate-900/90 rounded-2xl border">
          <button id="tab-medical-card" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition ${this.activeSubtab === 'card' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">
            ${i18n.t('tabMedicalCard')}
          </button>
          <button id="tab-app-settings" class="flex-1 py-2.5 text-xs font-bold rounded-xl transition ${this.activeSubtab === 'settings' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}">
            ${i18n.t('tabSettings')}
          </button>
        </div>

        <!-- Desktop 2-Column Grid (On LG screens both columns show side-by-side) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT COLUMN: Medical ID & QR Code -->
          <div class="lg:col-span-6 ${this.activeSubtab === 'settings' ? 'hidden lg:block' : 'block'} space-y-5">
            ${this._renderMedicalCardView(profile)}
          </div>

          <!-- RIGHT COLUMN: Contacts & Settings -->
          <div class="lg:col-span-6 ${this.activeSubtab === 'card' ? 'hidden lg:block' : 'block'} space-y-5">
            ${this._renderSettingsView(profile, settings)}
          </div>

        </div>
      </div>
    `;

    this._bindEvents(profile, settings);
    await this._generateQrCode(profile);
  }

  _renderMedicalCardView(profile) {
    const primaryContact = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];

    return `
      <div class="glass-card rounded-3xl p-6 border-2 border-red-500/40 shadow-2xl relative overflow-hidden space-y-5">
        <!-- Card Header Badge -->
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
            ${profile.bloodType || 'Unknown'}
          </span>
        </div>

        <!-- Vital Info Grid -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('fullName')}</span>
            <span class="text-slate-900 dark:text-white font-bold text-sm truncate block mt-0.5">${profile.name || 'Not Specified'}</span>
          </div>

          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('primaryContact')}</span>
            <span class="text-slate-900 dark:text-white font-bold truncate block mt-0.5">${primaryContact ? primaryContact.name : 'None'}</span>
            <a href="tel:${primaryContact?.phone || ''}" class="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">${primaryContact?.phone || ''}</a>
          </div>

          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('knownAllergies')}</span>
            <span class="text-rose-600 dark:text-rose-300 font-medium block mt-0.5">${profile.allergies || 'None'}</span>
          </div>

          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('medications')}</span>
            <span class="text-slate-700 dark:text-slate-200 font-medium block mt-0.5">${profile.medications || 'None'}</span>
          </div>
        </div>

        ${profile.emergencyNotes ? `
          <div class="bg-slate-100 dark:bg-slate-900/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">${i18n.t('criticalNotes')}</span>
            <p class="text-amber-700 dark:text-amber-200 font-medium mt-1 leading-relaxed">${profile.emergencyNotes}</p>
          </div>
        ` : ''}

        <!-- QR Code for First Responders -->
        <div class="bg-white rounded-3xl p-5 text-center space-y-2 flex flex-col items-center justify-center border shadow-inner">
          <div id="medical-qr-wrapper" class="w-44 h-44 flex items-center justify-center">
            <canvas id="medical-qr-canvas" class="w-44 h-44 rounded-lg"></canvas>
          </div>
          <div>
            <div class="text-slate-900 font-bold text-xs">${i18n.t('scanQrTitle')}</div>
            <div class="text-[10px] text-slate-500">${i18n.t('scanQrSub')}</div>
          </div>
        </div>
      </div>
    `;
  }

  _renderSettingsView(profile, settings) {
    return `
      <!-- Medical Profile Edit Form -->
      <div class="glass-card rounded-3xl p-6 border space-y-4">
        <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span>${i18n.t('personalMedicalDetails')}</span>
        </h3>

        <div class="space-y-3 text-xs">
          <div>
            <label class="text-slate-600 dark:text-slate-400 font-medium block mb-1">${i18n.t('fullName')}</label>
            <input type="text" id="prof-name" value="${profile.name || ''}" class="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-slate-600 dark:text-slate-400 font-medium block mb-1">${i18n.t('bloodGroup')}</label>
              <select id="prof-blood" class="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none">
                ${['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'].map(b => `
                  <option value="${b}" ${profile.bloodType === b ? 'selected' : ''}>${b}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="text-slate-600 dark:text-slate-400 font-medium block mb-1">${i18n.t('emergencyHotline')}</label>
              <input type="text" id="set-hotline" value="${settings.emergencyHotline || '112'}" class="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label class="text-slate-600 dark:text-slate-400 font-medium block mb-1">${i18n.t('knownAllergies')}</label>
            <input type="text" id="prof-allergies" value="${profile.allergies || ''}" placeholder="Penicillin, Peanuts" class="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none" />
          </div>

          <div>
            <label class="text-slate-600 dark:text-slate-400 font-medium block mb-1">${i18n.t('medications')}</label>
            <input type="text" id="prof-meds" value="${profile.medications || ''}" placeholder="Inhaler, Insulin" class="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none" />
          </div>

          <div>
            <label class="text-slate-600 dark:text-slate-400 font-medium block mb-1">${i18n.t('criticalNotes')}</label>
            <textarea id="prof-notes" rows="2" class="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none">${profile.emergencyNotes || ''}</textarea>
          </div>
        </div>
      </div>

      <!-- Emergency Contacts Management -->
      <div class="glass-card rounded-3xl p-6 border space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">${i18n.t('emergencyContactsTitle')}</h3>
          <button id="add-contact-btn" class="text-xs px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center space-x-1 shadow-sm">
            <span>${i18n.t('addContact')}</span>
          </button>
        </div>

        <div id="contacts-list" class="space-y-2.5">
          ${profile.contacts.map((c) => `
            <div class="p-3.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border ${c.isPrimary ? 'border-emerald-500/60' : 'border-slate-200 dark:border-slate-800'} flex items-center justify-between text-xs">
              <div>
                <div class="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>${c.name}</span>
                  ${c.isPrimary ? `<span class="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">${i18n.t('primaryTag')}</span>` : ''}
                </div>
                <div class="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5">${c.phone} • ${c.relationship || 'Contact'}</div>
              </div>

              <div class="flex items-center space-x-2.5 font-medium">
                ${!c.isPrimary ? `
                  <button data-make-primary="${c.id}" class="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-bold">${i18n.t('setPrimary')}</button>
                ` : ''}
                <button data-delete-contact="${c.id}" class="text-rose-500 hover:text-rose-600 text-base font-bold">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Google Gemini API Key Configuration -->
      <div class="glass-card rounded-3xl p-6 border space-y-3 text-xs">
        <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span>${i18n.t('geminiApiKeyTitle')}</span>
        </h3>
        <p class="text-slate-500 dark:text-slate-400 text-[11px]">
          ${i18n.t('geminiApiKeyDesc')}
        </p>
        <input 
          type="password" 
          id="set-gemini-key" 
          value="${settings.geminiApiKey || ''}" 
          placeholder="AIzaSy..." 
          class="w-full p-3 rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-white focus:border-cyan-500 focus:outline-none font-mono text-xs" 
        />
      </div>

      <!-- Save & Backup Buttons -->
      <div class="space-y-2.5">
        <button id="save-settings-btn" class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs md:text-sm shadow-xl shadow-emerald-950/20 active:scale-98 transition">
          ${i18n.t('saveChanges')}
        </button>

        <div class="flex space-x-2.5">
          <button id="export-backup-btn" class="flex-1 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold transition">
            ${i18n.t('exportBackup')}
          </button>
          <label class="flex-1 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-bold text-center cursor-pointer transition">
            ${i18n.t('importBackup')}
            <input type="file" id="import-backup-file" accept=".json" class="hidden" />
          </label>
        </div>
      </div>
    `;
  }

  async _generateQrCode(profile) {
    const wrapper = this.container.querySelector('#medical-qr-wrapper');
    if (!wrapper) return;

    const primaryContact = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];

    const qrData = `EMERGENCY MEDICAL ID
Name: ${profile.name || 'N/A'}
Blood Type: ${profile.bloodType || 'Unknown'}
Allergies: ${profile.allergies || 'None'}
Meds: ${profile.medications || 'None'}
Notes: ${profile.emergencyNotes || 'None'}
Contact: ${primaryContact ? `${primaryContact.name} (${primaryContact.phone})` : 'N/A'}
Generated by SafetyNet App`;

    // Try QRCodeJS or generate via quick canvas
    if (window.QRCode) {
      wrapper.innerHTML = '';
      new window.QRCode(wrapper, {
        text: qrData,
        width: 160,
        height: 160,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    } else {
      // Fallback to Google chart API / image
      wrapper.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}" alt="Medical QR Code" class="w-40 h-40 rounded-lg" />`;
    }
  }

  _bindEvents(profile, settings) {
    const tabCard = this.container.querySelector('#tab-medical-card');
    const tabSettings = this.container.querySelector('#tab-app-settings');

    if (tabCard) {
      tabCard.addEventListener('click', () => {
        this.activeSubtab = 'card';
        this.render();
      });
    }

    if (tabSettings) {
      tabSettings.addEventListener('click', () => {
        this.activeSubtab = 'settings';
        this.render();
      });
    }

    const saveBtn = this.container.querySelector('#save-settings-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const updatedProfile = {
          ...profile,
          name: this.container.querySelector('#prof-name')?.value || '',
          bloodType: this.container.querySelector('#prof-blood')?.value || 'Unknown',
          allergies: this.container.querySelector('#prof-allergies')?.value || '',
          medications: this.container.querySelector('#prof-meds')?.value || '',
          emergencyNotes: this.container.querySelector('#prof-notes')?.value || ''
        };

        const updatedSettings = {
          ...settings,
          emergencyHotline: this.container.querySelector('#set-hotline')?.value || '112',
          geminiApiKey: this.container.querySelector('#set-gemini-key')?.value?.trim() || ''
        };

        storage.saveProfile(updatedProfile);
        storage.saveSettings(updatedSettings);

        alert(i18n.t('saveSuccess'));
        this.activeSubtab = 'card';
        this.render();
      });
    }

    const addContactBtn = this.container.querySelector('#add-contact-btn');
    if (addContactBtn) {
      addContactBtn.addEventListener('click', () => {
        const name = prompt(i18n.t('promptContactName'));
        if (!name) return;
        const phone = prompt(i18n.t('promptContactPhone'));
        if (!phone) return;
        const rel = prompt(i18n.t('promptContactRel')) || 'Contact';

        const updatedProfile = { ...profile };
        updatedProfile.contacts.push({
          id: `c-${Date.now()}`,
          name,
          phone,
          relationship: rel,
          isPrimary: updatedProfile.contacts.length === 0
        });

        storage.saveProfile(updatedProfile);
        this.render();
      });
    }

    this.container.querySelectorAll('[data-delete-contact]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-contact');
        const updatedContacts = profile.contacts.filter(c => c.id !== id);
        if (updatedContacts.length > 0 && !updatedContacts.some(c => c.isPrimary)) {
          updatedContacts[0].isPrimary = true;
        }
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

    const exportBtn = this.container.querySelector('#export-backup-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => storage.exportData());
    }

    const importInput = this.container.querySelector('#import-backup-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const success = storage.importData(event.target.result);
          if (success) {
            alert('Backup data imported successfully!');
            this.render();
          } else {
            alert('Invalid backup file format.');
          }
        };
        reader.readAsText(file);
      });
    }
  }
}