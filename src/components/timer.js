import { storage } from '../services/storage.js';
import { sound } from '../services/sound.js';
import { locationService } from '../services/location.js';
import { i18n } from '../services/i18n.js';

export class TimerComponent {
  constructor(container) {
    this.container = container;
    this.totalSeconds = 15 * 60;
    this.remainingSeconds = 15 * 60;
    this.timerInterval = null;
    this.isRunning = false;
  }

  render() {
    const settings = storage.getSettings();
    const profile = storage.getProfile();
    const primaryContact = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];

    if (!this.isRunning) {
      this.totalSeconds = (settings.checkInDurationMinutes || 15) * 60;
      this.remainingSeconds = this.totalSeconds;
    }

    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in w-full">
        <!-- Desktop Grid: Left Timer, Right Info -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT / MAIN TIMER PANEL -->
          <div class="lg:col-span-7 glass-card p-6 md:p-8 rounded-3xl border space-y-6 text-center flex flex-col items-center justify-center">
            <div class="w-full flex items-center justify-between">
              <div class="text-left">
                <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>⏱️ ${i18n.t('timerTitle')}</span>
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ${i18n.t('timerDesc')}
                </p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-bold uppercase ${this.isRunning ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
                ${this.isRunning ? i18n.t('timerStatusMonitoring') : i18n.t('timerStatusIdle')}
              </span>
            </div>

            <!-- Circular Countdown Visualizer -->
            <div class="relative flex items-center justify-center my-2">
              <svg class="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" class="stroke-slate-200 dark:stroke-slate-800" stroke-width="5" fill="transparent" />
                <circle id="timer-progress-ring" cx="50" cy="50" r="44" class="stroke-amber-500 transition-all duration-1000" stroke-width="5" stroke-dasharray="276.46" stroke-dashoffset="0" stroke-linecap="round" fill="transparent" />
              </svg>

              <div class="absolute flex flex-col items-center justify-center text-center select-none">
                <span id="timer-display" class="text-5xl font-mono font-black text-slate-900 dark:text-white tracking-wider drop-shadow-md">
                  ${formattedTime}
                </span>
                <span id="timer-status-text" class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                  ${this.isRunning ? i18n.t('timeRemaining') : i18n.t('readyToStart')}
                </span>
              </div>
            </div>

            <!-- Duration Presets -->
            ${!this.isRunning ? `
              <div class="w-full space-y-2">
                <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-left">${i18n.t('selectDuration')}</label>
                <div class="grid grid-cols-4 gap-2">
                  <button data-duration="5" class="preset-btn py-3 rounded-2xl text-xs font-bold ${this.totalSeconds === 300 ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}">${i18n.t('min5')}</button>
                  <button data-duration="15" class="preset-btn py-3 rounded-2xl text-xs font-bold ${this.totalSeconds === 900 ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}">${i18n.t('min15')}</button>
                  <button data-duration="30" class="preset-btn py-3 rounded-2xl text-xs font-bold ${this.totalSeconds === 1800 ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}">${i18n.t('min30')}</button>
                  <button data-duration="60" class="preset-btn py-3 rounded-2xl text-xs font-bold ${this.totalSeconds === 3600 ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}">${i18n.t('hr1')}</button>
                </div>
              </div>
            ` : ''}

            <!-- Timer Action Buttons -->
            <div class="w-full space-y-3 pt-2">
              ${!this.isRunning ? `
                <button id="start-timer-btn" class="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm md:text-base shadow-xl shadow-amber-500/20 active:scale-98 transition flex items-center justify-center space-x-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span>${i18n.t('startTimer')}</span>
                </button>
              ` : `
                <div class="grid grid-cols-2 gap-3">
                  <button id="checkin-safe-btn" class="py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm shadow-lg active:scale-98 transition flex items-center justify-center space-x-2">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span>${i18n.t('imSafe')}</span>
                  </button>

                  <button id="extend-timer-btn" class="py-4 px-4 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 font-bold text-xs md:text-sm border border-slate-300 dark:border-slate-700 active:scale-98 transition flex items-center justify-center space-x-1.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    <span>${i18n.t('extend5Min')}</span>
                  </button>
                </div>

                <button id="cancel-timer-btn" class="w-full py-2 text-xs text-rose-500 dark:text-rose-400 hover:underline font-semibold transition">
                  ${i18n.t('cancelTimer')}
                </button>
              `}
            </div>
          </div>

          <!-- RIGHT / DESKTOP INFO SIDEBAR -->
          <div class="lg:col-span-5 space-y-5">
            <!-- Escalation Protocol Card -->
            <div class="glass-card p-6 rounded-3xl border space-y-4">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>🛡️ Auto-Escalation Protocol</span>
              </h4>
              <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If the timer reaches 00:00 without confirmation, SafetyNet automatically:
              </p>
              <ul class="text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <li class="flex items-start space-x-2">
                  <span class="text-red-500 font-bold">1.</span>
                  <span>Activates dual-tone acoustic alarm siren and screen strobe.</span>
                </li>
                <li class="flex items-start space-x-2">
                  <span class="text-red-500 font-bold">2.</span>
                  <span>Captures current GPS coordinates & street address.</span>
                </li>
                <li class="flex items-start space-x-2">
                  <span class="text-red-500 font-bold">3.</span>
                  <span>Prepares WhatsApp / SMS emergency dispatch for <strong>${primaryContact ? primaryContact.name : 'Primary Contact'}</strong>.</span>
                </li>
              </ul>
            </div>

            <!-- Primary Contact Preview -->
            <div class="glass-card p-5 rounded-3xl border flex items-center justify-between">
              <div>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Assigned Emergency Contact</span>
                <div class="text-xs font-bold text-slate-900 dark:text-white mt-0.5">${primaryContact ? primaryContact.name : 'None assigned'}</div>
                <div class="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">${primaryContact?.phone || 'Add in Medical tab'}</div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] bg-emerald-500/20 text-emerald-500 font-bold">Verified</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
    this._updateProgressRing();
  }

  _bindEvents() {
    this.container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-duration'), 10);
        this.totalSeconds = mins * 60;
        this.remainingSeconds = this.totalSeconds;
        this.render();
      });
    });

    const startBtn = this.container.querySelector('#start-timer-btn');
    if (startBtn) startBtn.addEventListener('click', () => this.start());

    const checkInBtn = this.container.querySelector('#checkin-safe-btn');
    if (checkInBtn) checkInBtn.addEventListener('click', () => this.checkInSafe());

    const extendBtn = this.container.querySelector('#extend-timer-btn');
    if (extendBtn) extendBtn.addEventListener('click', () => this.extend(5));

    const cancelBtn = this.container.querySelector('#cancel-timer-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancel());
  }

  start() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    this.isRunning = true;
    sound.playBeep(600, 100);
    this.render();

    this.timerInterval = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 10 && this.remainingSeconds > 0) {
        sound.playBeep(800, 100);
      }

      if (this.remainingSeconds <= 0) {
        this.escalateEmergency();
      } else {
        this._updateTimerDisplay();
        this._updateProgressRing();
      }
    }, 1000);
  }

  checkInSafe() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.remainingSeconds = this.totalSeconds;
    sound.speak(i18n.t('timerCheckedInVoice'));
    this.render();
  }

  extend(minutes = 5) {
    this.remainingSeconds += minutes * 60;
    this.totalSeconds += minutes * 60;
    sound.playBeep(700, 100);
    this._updateTimerDisplay();
    this._updateProgressRing();
  }

  cancel() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.remainingSeconds = this.totalSeconds;
    this.render();
  }

  _updateTimerDisplay() {
    const display = this.container.querySelector('#timer-display');
    if (display) {
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      display.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }

  _updateProgressRing() {
    const ring = this.container.querySelector('#timer-progress-ring');
    if (ring && this.totalSeconds > 0) {
      const totalCircumference = 276.46;
      const progress = this.remainingSeconds / this.totalSeconds;
      const offset = totalCircumference * (1 - progress);
      ring.style.strokeDashoffset = offset;

      if (progress < 0.2) {
        ring.className.baseVal = 'stroke-red-500 transition-all duration-1000 animate-pulse';
      } else if (progress < 0.5) {
        ring.className.baseVal = 'stroke-amber-500 transition-all duration-1000';
      } else {
        ring.className.baseVal = 'stroke-emerald-500 transition-all duration-1000';
      }
    }
  }

  async escalateEmergency() {
    clearInterval(this.timerInterval);
    this.isRunning = false;
    this.render();

    sound.playSiren(1.0);
    sound.speak(i18n.t('timerWarningVoice'));

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(i18n.t('timerNotificationTitle'), {
        body: i18n.t('timerNotificationBody'),
        requireInteraction: true
      });
    }

    const profile = storage.getProfile();
    const primary = profile.contacts.find(c => c.isPrimary) || profile.contacts[0];
    const message = await locationService.formatEmergencyMessage(profile, i18n.t('missedCheckinPrefix'));

    const waLink = locationService.getWhatsAppLink(primary?.phone || '', message);
    window.open(waLink, '_blank');
  }
}