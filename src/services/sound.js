// Web Audio API Sound Synthesizer, Vibration, and Dual-Language Speech Synthesis
import { i18n } from './i18n.js';

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.modulator = null;
    this.isSirenPlaying = false;
    this.strobeInterval = null;
  }

  _initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSiren(volume = 0.9) {
    if (this.isSirenPlaying) return;
    this._initContext();

    try {
      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();
      this.modulator = this.audioCtx.createOscillator();
      const modGain = this.audioCtx.createGain();

      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.value = 850;

      this.modulator.type = 'sine';
      this.modulator.frequency.value = 2.5;

      modGain.gain.value = 350;

      this.modulator.connect(modGain);
      modGain.connect(this.oscillator.frequency);

      this.gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator.start();
      this.modulator.start();
      this.isSirenPlaying = true;
      this.startVibration();
      this.startStrobe();

      window.dispatchEvent(new CustomEvent('safetynet:siren-changed', { detail: { isPlaying: true } }));
    } catch (e) {
      console.error('Audio siren playback failed', e);
    }
  }

  stopSiren() {
    if (!this.isSirenPlaying) return;
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.modulator) {
        this.modulator.stop();
        this.modulator.disconnect();
        this.modulator = null;
      }
      this.isSirenPlaying = false;
      this.stopVibration();
      this.stopStrobe();

      window.dispatchEvent(new CustomEvent('safetynet:siren-changed', { detail: { isPlaying: false } }));
    } catch (e) {
      console.error('Failed to stop siren', e);
    }
  }

  toggleSiren(volume = 0.9) {
    if (this.isSirenPlaying) {
      this.stopSiren();
    } else {
      this.playSiren(volume);
    }
    return this.isSirenPlaying;
  }

  playBeep(freq = 880, durationMs = 150) {
    try {
      this._initContext();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + (durationMs / 1000));
    } catch (e) {}
  }

  startVibration() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200, 100, 200, 200, 500, 200, 500, 200, 500, 200, 200, 100, 200, 100, 200]);
      } catch (e) {}
    }
  }

  stopVibration() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  }

  startStrobe() {
    const strobeEl = document.getElementById('screen-strobe-overlay');
    if (!strobeEl) return;
    strobeEl.classList.remove('hidden');
    let state = false;
    clearInterval(this.strobeInterval);
    this.strobeInterval = setInterval(() => {
      state = !state;
      strobeEl.style.backgroundColor = state ? '#ef4444' : '#ffffff';
    }, 120);
  }

  stopStrobe() {
    clearInterval(this.strobeInterval);
    const strobeEl = document.getElementById('screen-strobe-overlay');
    if (strobeEl) {
      strobeEl.classList.add('hidden');
    }
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.lang = i18n.lang === 'hi' ? 'hi-IN' : 'en-US';
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis error', e);
      }
    }
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const sound = new SoundService();