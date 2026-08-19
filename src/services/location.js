// Geolocation, Continuous Tracking, Offline Caching, and Emergency Dispatch Formatter
import { i18n } from './i18n.js';

const LAST_KNOWN_LOC_KEY = 'safetynet_last_known_location';

class LocationService {
  constructor() {
    this.currentPosition = this._loadCachedLocation();
    this.currentAddress = null;
    this.watchId = null;
    this.breadcrumbPath = [];
    this.listeners = [];
    this.gpsStatus = this.currentPosition ? 'CACHED' : 'INITIALIZING'; // 'ACQUIRING' | 'LOCKED' | 'CACHED' | 'ERROR'
    this.autoFollow = true;
  }

  _loadCachedLocation() {
    try {
      const data = localStorage.getItem(LAST_KNOWN_LOC_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  _saveCachedLocation(pos) {
    try {
      localStorage.setItem(LAST_KNOWN_LOC_KEY, JSON.stringify(pos));
    } catch (e) {
      console.warn('Failed to cache location:', e);
    }
  }

  getLastKnownLocation() {
    return this.currentPosition || this._loadCachedLocation() || {
      latitude: 28.6139,
      longitude: 77.2090,
      accuracy: 25,
      timestamp: Date.now(),
      isDefault: true
    };
  }

  async getCurrentLocation() {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        const fallback = this.getLastKnownLocation();
        this.gpsStatus = 'ERROR';
        resolve(fallback);
        return;
      }

      this.gpsStatus = 'ACQUIRING';
      this._emitGpsStatus();

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude || 0,
            heading: position.coords.heading || 0,
            speed: position.coords.speed || 0,
            timestamp: position.timestamp
          };
          this.currentPosition = coords;
          this.gpsStatus = 'LOCKED';
          this._saveCachedLocation(coords);
          this._addBreadcrumb(coords);
          this._fetchAddress(coords.latitude, coords.longitude);
          this._emitGpsStatus();
          resolve(coords);
        },
        (error) => {
          console.warn('Geolocation one-time fetch warning:', error.message);
          const fallback = this.getLastKnownLocation();
          this.currentPosition = fallback;
          this.gpsStatus = this.currentPosition?.isDefault ? 'ERROR' : 'CACHED';
          this._emitGpsStatus();
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    });
  }

  startTracking(onUpdate) {
    if (onUpdate && !this.listeners.includes(onUpdate)) {
      this.listeners.push(onUpdate);
      // Immediately notify listener with current/cached position
      if (this.currentPosition) {
        onUpdate(this.currentPosition, this.breadcrumbPath);
      }
    }

    if (this.watchId !== null) return;

    if ('geolocation' in navigator) {
      this.gpsStatus = 'ACQUIRING';
      this._emitGpsStatus();

      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude || 0,
            heading: pos.coords.heading || 0,
            speed: pos.coords.speed || 0,
            timestamp: pos.timestamp
          };

          this.currentPosition = coords;
          this.gpsStatus = 'LOCKED';
          this._saveCachedLocation(coords);
          this._addBreadcrumb(coords);
          this._emitGpsStatus();

          this.listeners.forEach(cb => {
            try {
              cb(coords, this.breadcrumbPath);
            } catch (err) {
              console.warn('Listener callback error:', err);
            }
          });

          // Debounced address resolution (only if moved > 30m or no address)
          if (!this.currentAddress) {
            this._fetchAddress(coords.latitude, coords.longitude);
          }
        },
        (err) => {
          console.warn('WatchPosition live error:', err.message);
          this.gpsStatus = this.currentPosition ? 'CACHED' : 'ERROR';
          this._emitGpsStatus();
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );
    }
  }

  stopTracking() {
    if (this.watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  _emitGpsStatus() {
    window.dispatchEvent(new CustomEvent('safetynet:gps-status-changed', {
      detail: {
        status: this.gpsStatus,
        position: this.currentPosition,
        accuracy: this.currentPosition?.accuracy || null
      }
    }));
  }

  _addBreadcrumb(pos) {
    const pt = [pos.latitude, pos.longitude];
    const last = this.breadcrumbPath[this.breadcrumbPath.length - 1];
    if (!last || Math.abs(last[0] - pt[0]) > 0.00005 || Math.abs(last[1] - pt[1]) > 0.00005) {
      this.breadcrumbPath.push(pt);
      if (this.breadcrumbPath.length > 100) this.breadcrumbPath.shift();
    }
  }

  async _fetchAddress(lat, lng) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        this.currentAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        window.dispatchEvent(new CustomEvent('safetynet:address-updated', { detail: { address: this.currentAddress } }));
        return this.currentAddress;
      }
    } catch (e) {
      console.warn('Reverse geocode error', e);
    }
    this.currentAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    return this.currentAddress;
  }

  getGoogleMapsUrl(lat = this.currentPosition?.latitude, lng = this.currentPosition?.longitude) {
    if (!lat || !lng) return 'https://maps.google.com';
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  async getBatteryLevel() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return `${Math.round(battery.level * 100)}%${battery.charging ? ' (Charging)' : ''}`;
      }
    } catch (e) {}
    return 'Unknown';
  }

  async formatEmergencyMessage(profile, customMessage = '', isOffline = false) {
    const pos = this.currentPosition || this.getLastKnownLocation();
    const mapUrl = this.getGoogleMapsUrl(pos.latitude, pos.longitude);
    const battery = await this.getBatteryLevel();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = new Date().toLocaleDateString();

    const isHi = i18n.lang === 'hi';
    const offlineTag = isOffline ? (isHi ? ' [ऑफ़लाइन एसएमएस मोड]' : ' [OFFLINE SMS MODE]') : '';

    if (isHi) {
      const prefix = customMessage || i18n.t('defaultSosPrefix');
      const sender = profile?.name ? `\n- प्रेषक: ${profile.name}` : '';
      const blood = profile?.bloodType ? `\n- रक्त समूह: ${profile.bloodType}` : '';
      const address = this.currentAddress ? `\n- अनुमानित पता: ${this.currentAddress}` : '';

      return `${prefix}${offlineTag}${sender}${blood}
🕒 समय: ${timeStr} (${dateStr})
📍 लाइव जीपीएस: ${mapUrl}
🎯 जीपीएस सटीकता: ±${Math.round(pos.accuracy || 10)}m${address}
🔋 डिवाइस बैटरी: ${battery}
⚠️ कृपया तुरंत आपातकालीन सहायता भेजें या मुझे कॉल करें!`;
    }

    const prefix = customMessage || i18n.t('defaultSosPrefix');
    const sender = profile?.name ? `\n- Sender: ${profile.name}` : '';
    const blood = profile?.bloodType ? `\n- Blood Group: ${profile.bloodType}` : '';
    const address = this.currentAddress ? `\n- Approx Address: ${this.currentAddress}` : '';

    return `${prefix}${offlineTag}${sender}${blood}
🕒 Time: ${timeStr} (${dateStr})
📍 Live Location: ${mapUrl}
🎯 GPS Precision: ±${Math.round(pos.accuracy || 10)}m${address}
🔋 Device Battery: ${battery}
⚠️ Please send emergency help or call me immediately!`;
  }

  getWhatsAppLink(phone, message) {
    const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : '';
    const encoded = encodeURIComponent(message);
    if (cleanPhone) {
      return `https://wa.me/${cleanPhone}?text=${encoded}`;
    }
    return `https://wa.me/?text=${encoded}`;
  }

  getSmsLink(phone, message) {
    const cleanPhone = phone ? phone.replace(/[^0-9+]/g, '') : '';
    const encoded = encodeURIComponent(message);
    // iOS Safari requires &body=, Android/others use ?body=
    const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
    return `sms:${cleanPhone}${separator}body=${encoded}`;
  }
}

export const locationService = new LocationService();