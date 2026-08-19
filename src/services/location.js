// Geolocation, Address Lookup, and Dual-Language Emergency Dispatch Formatter
import { i18n } from './i18n.js';

class LocationService {
  constructor() {
    this.currentPosition = null;
    this.currentAddress = null;
    this.watchId = null;
    this.breadcrumbPath = [];
    this.listeners = [];
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp
          };
          this._addBreadcrumb(this.currentPosition);
          this._fetchAddress(this.currentPosition.latitude, this.currentPosition.longitude);
          resolve(this.currentPosition);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          const fallback = {
            latitude: 28.6139,
            longitude: 77.2090,
            accuracy: 15,
            timestamp: Date.now(),
            isMock: true
          };
          this.currentPosition = fallback;
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    });
  }

  startTracking(onUpdate) {
    if (onUpdate && !this.listeners.includes(onUpdate)) {
      this.listeners.push(onUpdate);
    }

    if (this.watchId !== null) return;

    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          };
          this.currentPosition = coords;
          this._addBreadcrumb(coords);
          this.listeners.forEach(cb => cb(coords, this.breadcrumbPath));
        },
        (err) => {
          console.warn('WatchPosition error', err);
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 }
      );
    }
  }

  stopTracking() {
    if (this.watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  _addBreadcrumb(pos) {
    const pt = [pos.latitude, pos.longitude];
    const last = this.breadcrumbPath[this.breadcrumbPath.length - 1];
    if (!last || last[0] !== pt[0] || last[1] !== pt[1]) {
      this.breadcrumbPath.push(pt);
      if (this.breadcrumbPath.length > 50) this.breadcrumbPath.shift();
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

  async formatEmergencyMessage(profile, customMessage = '') {
    const pos = this.currentPosition || await this.getCurrentLocation();
    const mapUrl = this.getGoogleMapsUrl(pos.latitude, pos.longitude);
    const battery = await this.getBatteryLevel();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = new Date().toLocaleDateString();

    const isHi = i18n.lang === 'hi';

    if (isHi) {
      const prefix = customMessage || i18n.t('defaultSosPrefix');
      const sender = profile?.name ? `\n- प्रेषक: ${profile.name}` : '';
      const blood = profile?.bloodType ? `\n- रक्त समूह: ${profile.bloodType}` : '';
      const address = this.currentAddress ? `\n- अनुमानित पता: ${this.currentAddress}` : '';

      return `${prefix}${sender}
🕒 समय: ${timeStr} (${dateStr})
📍 लाइव जीपीएस लोकेशन: ${mapUrl}
🎯 जीपीएस सटीकता: ±${Math.round(pos.accuracy || 10)}m${address}
🔋 डिवाइस बैटरी: ${battery}
⚠️ कृपया तुरंत आपातकालीन सहायता भेजें या मुझे कॉल करें!`;
    }

    const prefix = customMessage || i18n.t('defaultSosPrefix');
    const sender = profile?.name ? `\n- Sender: ${profile.name}` : '';
    const address = this.currentAddress ? `\n- Approx Address: ${this.currentAddress}` : '';

    return `${prefix}${sender}
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
    const separator = /iPad|iPhone|iPod/.test(navigator.userAgent) ? '&' : '?';
    return `sms:${cleanPhone}${separator}body=${encoded}`;
  }
}

export const locationService = new LocationService();