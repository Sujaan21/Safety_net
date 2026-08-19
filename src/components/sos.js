import { storage } from '../services/storage.js';
import { sound } from '../services/sound.js';
import { locationService } from '../services/location.js';
import { i18n } from '../services/i18n.js';
import { aiSentinel } from '../services/ai-sentinel.js';
import { regionalHelplines, REGIONAL_HELPLINES } from '../services/regional-helplines.js';

const OFFLINE_SOS_QUEUE_KEY = 'safetynet_offline_sos_queue_v1';

export class SosComponent {
  constructor(container) {
    this.container = container;
    this.holdTimer = null;
    this.isOffline = !navigator.onLine;
    this.selectedState = regionalHelplines.detectStateFromAddress(locationService.currentAddress || '');

    window.addEventListener('online', () => {
      this.isOffline = false;
      this._flushOfflineSosQueue();
      this.render();
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.render();
    });
  }

  render() {
    const profile = storage.getProfile();
    const settings = storage.getSettings();
    const prioritizedContacts = aiSentinel.prioritizeEmergencyContacts(profile.contacts || [], 'HIGH');
    const primaryContact = prioritizedContacts[0] || { name: 'Emergency Dispatch (112)', phone: '112' };

    const availableStates = regionalHelplines.getAvailableStates();
    const currentHotlines = regionalHelplines.getStateHelplines(this.selectedState);

    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in w-full">
        
        <!-- Offline Mode Banner (Prominent Notification) -->
        ${this.isOffline ? `
          <div class="p-4 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 shadow-xl flex items-center justify-between text-xs text-amber-700 dark:text-amber-300">
            <div class="flex items-center space-x-3">
              <span class="text-2xl animate-pulse">📡</span>
              <div>
                <p class="font-black text-sm uppercase tracking-wide">Offline SOS Mode Active</p>
                <p class="text-[11px] text-amber-600 dark:text-amber-400">Zero data connection detected. Emergency SOS will dispatch via native cellular SMS using cached GPS coordinates.</p>
              </div>
            </div>
            <span class="px-3 py-1 bg-amber-500/20 rounded-full font-bold text-[10px] uppercase border border-amber-500/30">SMS Ready</span>
          </div>
        ` : ''}

        <!-- Desktop Grid Layout: 2 Columns on LG screens -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT / MAIN COLUMN: SOS Button, Quick Actions & Regional Helplines -->
          <div class="lg:col-span-7 space-y-5">
            <!-- Hero SOS Trigger Card -->
            <div class="glass-card p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-xl">
              <!-- Ambient Glow background -->
              <div class="absolute -top-24 -left-24 w-72 h-72 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
              <div class="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

              <div class="relative flex items-center justify-center my-4">
                <!-- Outer Pulsing Rings -->
                <div class="absolute -inset-6 rounded-full bg-red-600/20 animate-ping pointer-events-none"></div>
                <div class="absolute -inset-10 rounded-full bg-red-500/10 pointer-events-none"></div>

                <!-- SVG Circular Progress for Hold Action -->
                <svg class="absolute w-60 h-60 transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" class="stroke-slate-300 dark:stroke-slate-800" stroke-width="4" fill="transparent" />
                  <circle id="sos-progress-ring" cx="50" cy="50" r="46" class="stroke-red-500 transition-all duration-75" stroke-width="6" stroke-dasharray="289.026" stroke-dashoffset="289.026" stroke-linecap="round" fill="transparent" />
                </svg>

                <!-- Central SOS Button -->
                <button id="main-sos-btn" class="relative z-10 w-48 h-48 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white shadow-2xl shadow-red-600/60 hover:shadow-red-500/90 active:scale-95 transition-all flex flex-col items-center justify-center select-none cursor-pointer border-4 border-red-400/40 animate-pulse-glow">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-1 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span class="text-3xl md:text-4xl font-black tracking-wider drop-shadow-md">SOS</span>
                  <span class="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-red-100 mt-1">${i18n.t('sosSubtitle')}</span>
                </button>
              </div>

              <p class="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-md">
                ${i18n.t('sosDesc')}
              </p>
            </div>

            <!-- DEDICATED 1-TOUCH DIRECT OFFLINE SOS ACTION BAR -->
            <button id="direct-touch-offline-btn" class="w-full py-4 px-5 rounded-3xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-black text-sm shadow-xl shadow-sky-600/25 border-2 border-sky-400/40 active:scale-98 transition flex items-center justify-between group">
              <div class="flex items-center space-x-3 text-left">
                <span class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl group-hover:scale-110 transition">
                  ⚡
                </span>
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-extrabold uppercase tracking-wide">1-Touch Offline SOS</span>
                    <span class="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-mono uppercase">Direct SMS</span>
                  </div>
                  <p class="text-[11px] text-sky-100 font-normal">Instant cellular SMS to ${primaryContact.name} with cached GPS (Zero internet required)</p>
                </div>
              </div>
              <span class="text-lg text-sky-200 group-hover:translate-x-1 transition font-bold">→</span>
            </button>

            <!-- Quick Emergency Action Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <!-- WhatsApp Broadcast -->
              <button id="quick-whatsapp-btn" class="glass-card hover:border-emerald-500/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left transition group active:scale-98 border border-slate-200 dark:border-slate-800 ${this.isOffline ? 'opacity-40 pointer-events-none' : ''}">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500/30 transition shrink-0 mb-2 sm:mb-0">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <div class="overflow-hidden">
                  <div class="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">${i18n.t('whatsapp')}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${primaryContact ? primaryContact.name : 'Primary'}</div>
                </div>
              </button>

              <!-- Native SMS Broadcast (Offline Capable) -->
              <button id="quick-sms-btn" class="glass-card hover:border-sky-500/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left transition group active:scale-98 border border-slate-200 dark:border-slate-800 ${this.isOffline ? 'ring-2 ring-sky-500 bg-sky-500/10' : ''}">
                <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center group-hover:bg-sky-500/30 transition shrink-0 mb-2 sm:mb-0">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div class="overflow-hidden">
                  <div class="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">${i18n.t('smsAlert')}</div>
                  <div class="text-[10px] text-sky-500 font-bold truncate">${this.isOffline ? 'Offline 1-Tap' : 'Direct Cell'}</div>
                </div>
              </button>

              <!-- Loud Siren Toggle -->
              <button id="quick-siren-btn" class="glass-card hover:border-amber-500/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left transition group active:scale-98 border border-slate-200 dark:border-slate-800">
                <div id="siren-icon-box" class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center group-hover:bg-amber-500/30 transition shrink-0 mb-2 sm:mb-0">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div class="overflow-hidden">
                  <div id="siren-text" class="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">${i18n.t('sirenAlarm')}</div>
                  <div id="siren-subtext" class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${i18n.t('sirenSubtext')}</div>
                </div>
              </button>

              <!-- Emergency Hotline (112) -->
              <a href="tel:${settings.emergencyHotline || '112'}" class="glass-card hover:border-rose-500/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left transition group active:scale-98 border border-slate-200 dark:border-slate-800">
                <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center group-hover:bg-rose-500/30 transition shrink-0 mb-2 sm:mb-0">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div class="overflow-hidden">
                  <div class="text-xs md:text-sm font-bold text-slate-900 dark:text-white truncate">${i18n.t('callPolice')}</div>
                  <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${settings.emergencyHotline || '112'} Dispatch</div>
                </div>
              </a>
            </div>

            <!-- REGIONAL & NORTHEAST STATE EMERGENCY DIRECTORY -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center space-x-2">
                  <span class="text-xl">🏛️</span>
                  <div>
                    <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      Regional & Northeast Emergency Hotlines
                    </h3>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400">Direct 1-tap dial for state police, women crisis lines & disaster management.</p>
                  </div>
                </div>

                <!-- State Filter Dropdown -->
                <select id="state-helpline-select" class="bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500">
                  ${availableStates.map(st => `
                    <option value="${st}" ${st === this.selectedState ? 'selected' : ''}>
                      ${REGIONAL_HELPLINES.states[st].region === 'Northeast' ? '🌿 ' : '📍 '}${st}
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- State Helplines Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                ${currentHotlines.map(h => `
                  <div class="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition">
                    <div class="flex items-center space-x-3 overflow-hidden">
                      <span class="text-xl shrink-0">${h.icon}</span>
                      <div class="overflow-hidden">
                        <p class="font-bold text-xs text-slate-900 dark:text-white truncate">${h.title}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">${h.desc}</p>
                      </div>
                    </div>
                    <a href="tel:${h.number}" class="shrink-0 ml-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow-md flex items-center space-x-1">
                      <span>📞</span>
                      <span>${h.number}</span>
                    </a>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: AI Contact Prioritization, Telemetry & Stealth Tips -->
          <div class="lg:col-span-5 space-y-5">
            <!-- AI Contact Dispatch Prioritization -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🤖 AI Alert Dispatch Hierarchy</span>
                </h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">Auto-Ranked</span>
              </div>

              <div class="space-y-2 text-xs">
                ${prioritizedContacts.map((c, idx) => `
                  <div class="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border ${c.isPrimary ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-200 dark:border-slate-800'} flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <span class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] flex items-center justify-center">
                        #${idx + 1}
                      </span>
                      <div>
                        <p class="font-bold text-slate-900 dark:text-white">${c.name} ${c.isPrimary ? '🌟' : ''}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400">${c.relationship} • ${c.phone}</p>
                      </div>
                    </div>
                    <span class="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ${c.recommendedChannel === 'DIRECT_CALL_AND_SMS' ? '📞 Call + SMS' : '💬 SMS'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- GPS Live Accuracy Sentinel -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-900 dark:text-white">🛰️ GPS Sentinel Telemetry</span>
                <span id="live-location-badge" class="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Locating...</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Emergency packets auto-include high-precision coordinate anchors, device battery telemetry, and local medical ID tokens.
              </p>
            </div>

            <!-- Stealth & Anti-Coercion Educational Tip Card -->
            <div class="glass-card p-5 rounded-3xl border border-cyan-500/20 bg-cyan-500/5 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <h4 class="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>🛡️ Stealth & Anti-Coercion Tools</span>
                </h4>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">Privacy</span>
              </div>
              
              <div class="space-y-2 text-xs">
                <!-- Camouflage Feature Tip -->
                <div class="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start space-x-2.5">
                  <span class="text-base shrink-0">🧮</span>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white">Stealth Camouflage Mode</p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Press <kbd class="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[9px]">ESC</kbd> or tap <strong>🧮 Disguise</strong> in the top header to instantly camouflage SafetyNet into a functioning standard calculator if someone approaches.
                    </p>
                  </div>
                </div>

                <!-- Duress PIN Feature Tip -->
                <div class="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start space-x-2.5">
                  <span class="text-base shrink-0">🎭</span>
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white">Duress / Silent SOS PIN</p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Configuring a secondary decoy PIN secretly broadcasts silent emergency distress telemetry with live GPS to your contacts if forced to unlock.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;

    this._bindEvents();
    this._updateLocationBadge();
  }

  _bindEvents() {
    const stateSelect = this.container.querySelector('#state-helpline-select');
    if (stateSelect) {
      stateSelect.addEventListener('change', (e) => {
        this.selectedState = e.target.value;
        this.render();
      });
    }

    const mainSosBtn = this.container.querySelector('#main-sos-btn');
    const ring = this.container.querySelector('#sos-progress-ring');

    if (mainSosBtn) {
      mainSosBtn.addEventListener('click', () => {
        this.triggerFullSos();
      });

      // Touch & Hold Support
      const startHold = () => {
        let elapsed = 0;
        const total = 1500;
        const interval = 50;
        const totalOffset = 289.026;

        this.holdTimer = setInterval(() => {
          elapsed += interval;
          const progress = Math.min(1, elapsed / total);
          if (ring) ring.style.strokeDashoffset = String(totalOffset * (1 - progress));

          if (elapsed >= total) {
            clearInterval(this.holdTimer);
            this.holdTimer = null;
            if (ring) ring.style.strokeDashoffset = String(totalOffset);
            this.triggerFullSos();
          }
        }, interval);
      };

      const cancelHold = () => {
        if (this.holdTimer) {
          clearInterval(this.holdTimer);
          this.holdTimer = null;
          if (ring) ring.style.strokeDashoffset = '289.026';
        }
      };

      mainSosBtn.addEventListener('mousedown', startHold);
      mainSosBtn.addEventListener('mouseup', cancelHold);
      mainSosBtn.addEventListener('mouseleave', cancelHold);
      mainSosBtn.addEventListener('touchstart', startHold, { passive: true });
      mainSosBtn.addEventListener('touchend', cancelHold);
    }

    // Direct 1-Touch Offline SOS Button (Instant cellular SMS dispatch without hold/modal barrier)
    const directTouchOfflineBtn = this.container.querySelector('#direct-touch-offline-btn');
    if (directTouchOfflineBtn) {
      directTouchOfflineBtn.addEventListener('click', () => {
        this.dispatchDirectTouchOfflineSms();
      });
    }

    const quickWa = this.container.querySelector('#quick-whatsapp-btn');
    if (quickWa) quickWa.addEventListener('click', () => this.dispatchWhatsApp());

    const quickSms = this.container.querySelector('#quick-sms-btn');
    if (quickSms) quickSms.addEventListener('click', () => this.dispatchSms());

    const quickSiren = this.container.querySelector('#quick-siren-btn');
    if (quickSiren) quickSiren.addEventListener('click', () => sound.toggleSiren());
  }

  async dispatchDirectTouchOfflineSms() {
    const profile = storage.getProfile();
    const settings = storage.getSettings();
    const prioritized = aiSentinel.prioritizeEmergencyContacts(profile.contacts || [], 'CRITICAL');
    const primary = prioritized[0] || { name: 'Emergency Dispatch', phone: settings.emergencyHotline || '112' };

    // Queue alert
    const message = await locationService.formatEmergencyMessage(profile, settings.customSosMessage, true);
    this._queueOfflineSos({
      timestamp: Date.now(),
      message,
      phone: primary.phone
    });

    if (settings.speechFeedback) {
      sound.speak(i18n.lang === 'hi' ? 'ऑफ़लाइन एसओएस एसएमएस भेजा जा रहा है।' : 'Dispatching offline emergency SMS.');
    }

    const smsLink = locationService.getSmsLink(primary.phone || '', message);
    window.location.href = smsLink;
  }

  async _updateLocationBadge() {
    try {
      const pos = await locationService.getCurrentLocation();
      const badge = this.container.querySelector('#live-location-badge');
      if (badge) {
        badge.innerText = `GPS: ${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)} (±${Math.round(pos.accuracy)}m)`;
      }
    } catch {}
  }

  async triggerFullSos() {
    const profile = storage.getProfile();
    const settings = storage.getSettings();

    sound.playSiren(settings.sirenVolume || 0.9);

    const message = await locationService.formatEmergencyMessage(profile, settings.customSosMessage, this.isOffline);
    const prioritized = aiSentinel.prioritizeEmergencyContacts(profile.contacts || [], 'CRITICAL');
    const primaryContact = prioritized[0] || { name: 'Emergency Dispatch', phone: settings.emergencyHotline || '112' };

    // If offline, queue distress event locally
    if (this.isOffline) {
      this._queueOfflineSos({
        timestamp: Date.now(),
        message,
        phone: primaryContact.phone
      });
    }

    this._showSosModal(message, primaryContact.phone, profile);

    if (settings.speechFeedback) {
      sound.speak(i18n.lang === 'hi' ? 'आपातकालीन एसओएस सक्रिय हो गया है।' : 'Emergency SOS triggered. Broadcast alert ready.');
    }
  }

  _queueOfflineSos(alertData) {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_SOS_QUEUE_KEY) || '[]');
      queue.push(alertData);
      localStorage.setItem(OFFLINE_SOS_QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  }

  _flushOfflineSosQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_SOS_QUEUE_KEY) || '[]');
      if (queue.length > 0) {
        console.log(`Flushing ${queue.length} offline SOS alert(s) to cloud gateway.`);
        localStorage.removeItem(OFFLINE_SOS_QUEUE_KEY);
      }
    } catch {}
  }

  async dispatchWhatsApp() {
    const profile = storage.getProfile();
    const settings = storage.getSettings();
    const primary = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];
    const message = await locationService.formatEmergencyMessage(profile, settings.customSosMessage, false);
    const link = locationService.getWhatsAppLink(primary?.phone || '', message);
    window.open(link, '_blank');
  }

  async dispatchSms() {
    const profile = storage.getProfile();
    const settings = storage.getSettings();
    const primary = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];
    const message = await locationService.formatEmergencyMessage(profile, settings.customSosMessage, this.isOffline);
    const link = locationService.getSmsLink(primary?.phone || '', message);
    window.location.href = link;
  }

  _showSosModal(message, phone, profile) {
    const existing = document.getElementById('sos-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'sos-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in';

    const waLink = locationService.getWhatsAppLink(phone, message);
    const smsLink = locationService.getSmsLink(phone, message);

    modal.innerHTML = `
      <div class="glass-card max-w-lg w-full p-6 md:p-8 rounded-3xl border-2 border-red-500/80 shadow-2xl text-center space-y-5 animate-scale-up">
        <div class="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/40 animate-pulse">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">${i18n.t('emergencyBroadcastTitle')}</h2>
          <p class="text-xs text-red-500 dark:text-red-300 mt-1">${i18n.t('emergencyBroadcastSub')}</p>
        </div>

        <div class="p-4 bg-slate-100 dark:bg-slate-900/90 rounded-2xl text-left border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap select-all">
          ${message}
        </div>

        <div class="grid grid-cols-2 gap-3">
          ${!this.isOffline ? `
            <a href="${waLink}" target="_blank" class="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm flex items-center justify-center space-x-2 transition shadow-lg">
              <span>${i18n.t('sendWhatsapp')}</span>
            </a>
          ` : `
            <div class="py-3.5 px-4 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs flex items-center justify-center">
              <span>WhatsApp (Offline)</span>
            </div>
          `}
          <a href="${smsLink}" class="py-3.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs md:text-sm flex items-center justify-center space-x-2 transition shadow-lg ring-2 ring-sky-400">
            <span>${this.isOffline ? '⚡ 1-Tap Offline SMS' : i18n.t('sendSms')}</span>
          </a>
        </div>

        <div class="flex items-center space-x-2">
          <button id="modal-share-btn" class="flex-1 py-2.5 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1 transition">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            <span>${i18n.t('shareToApp')}</span>
          </button>
          <button id="modal-silence-btn" class="py-2.5 px-4 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-300 dark:border-rose-800/50 transition">
            ${i18n.t('sirenPlaying')}
          </button>
        </div>

        <button id="modal-dismiss-btn" class="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium">
          ${i18n.t('dismissAlert')}
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#modal-dismiss-btn').addEventListener('click', () => {
      sound.stopSiren();
      modal.remove();
    });

    modal.querySelector('#modal-silence-btn').addEventListener('click', () => {
      sound.stopSiren();
    });

    modal.querySelector('#modal-share-btn').addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'SafetyNet Emergency Alert', text: message });
        } catch {}
      } else {
        await navigator.clipboard.writeText(message);
        alert(i18n.t('copied'));
      }
    });
  }
}