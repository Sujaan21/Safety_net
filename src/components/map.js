import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService } from '../services/location.js';
import { i18n } from '../services/i18n.js';
import { storage } from '../services/storage.js';

export class MapComponent {
  constructor(container) {
    this.container = container;
    this.map = null;
    this.userMarker = null;
    this.accuracyCircle = null;
    this.polyline = null;
  }

  async render() {
    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in w-full">
        <!-- Desktop Grid Layout: Map on Left (col-8), Info on Right (col-4) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT / MAIN MAP CANVAS -->
          <div class="lg:col-span-8 relative rounded-3xl overflow-hidden border shadow-2xl h-[420px] md:h-[540px] bg-slate-100 dark:bg-slate-950">
            <div id="leaflet-map-canvas" class="w-full h-full z-0"></div>

            <!-- Recenter Floating Button -->
            <div class="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
              <button id="recenter-map-btn" title="${i18n.t('recenterMap')}" class="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400 border shadow-xl flex items-center justify-center transition active:scale-95">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            </div>
          </div>

          <!-- RIGHT / DESKTOP MAP CONTROLS & SAFE HAVENS -->
          <div class="lg:col-span-4 space-y-5">
            <!-- Live Location Info Card -->
            <div class="glass-card p-5 rounded-3xl border space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">${i18n.t('liveGpsTracking')}</span>
                </div>
                <span id="map-accuracy-tag" class="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800/40 px-2.5 py-0.5 rounded-lg font-bold">
                  ${i18n.t('locating')}
                </span>
              </div>

              <div id="map-address-text" class="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-slate-900/80 p-3 rounded-2xl border">
                ${i18n.t('resolvingAddress')}
              </div>

              <!-- Share Button -->
              <button id="share-live-map-btn" class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs md:text-sm shadow-xl shadow-cyan-900/20 active:scale-98 transition flex items-center justify-center space-x-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>${i18n.t('shareLiveLocationBtn')}</span>
              </button>
            </div>

            <!-- Safe Haven Directories -->
            <div class="glass-card p-5 rounded-3xl border space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>🛡️ ${i18n.t('safeHavensTitle')}</span>
              </h4>
              <div class="space-y-2">
                <button id="find-police-btn" class="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border flex items-center justify-between transition active:scale-98">
                  <div class="flex items-center space-x-3">
                    <span class="text-xl">👮</span>
                    <span>${i18n.t('police')}</span>
                  </div>
                  <span class="text-[11px] text-cyan-500 font-semibold">Directions →</span>
                </button>
                <button id="find-hospital-btn" class="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border flex items-center justify-between transition active:scale-98">
                  <div class="flex items-center space-x-3">
                    <span class="text-xl">🏥</span>
                    <span>${i18n.t('hospital')}</span>
                  </div>
                  <span class="text-[11px] text-cyan-500 font-semibold">Directions →</span>
                </button>
                <button id="find-pharmacy-btn" class="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border flex items-center justify-between transition active:scale-98">
                  <div class="flex items-center space-x-3">
                    <span class="text-xl">💊</span>
                    <span>${i18n.t('pharmacy')}</span>
                  </div>
                  <span class="text-[11px] text-cyan-500 font-semibold">Directions →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    await this._initMap();
    this._bindEvents();
  }

  async _initMap() {
    const mapEl = this.container.querySelector('#leaflet-map-canvas');
    if (!mapEl) return;

    let coords = { latitude: 28.6139, longitude: 77.2090, accuracy: 20 };
    try {
      coords = await locationService.getCurrentLocation();
    } catch (e) {}

    const lat = coords.latitude;
    const lng = coords.longitude;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.map = L.map(mapEl, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false
    });

    const isLight = storage.getSettings().theme === 'light';
    const tileUrl = isLight 
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(this.map);

    const pulseIcon = L.divIcon({
      className: 'custom-pulse-marker',
      html: `<div class="w-5 h-5 rounded-full bg-cyan-500 border-2 border-white shadow-xl relative"><div class="absolute -inset-2 rounded-full bg-cyan-400 opacity-60 animate-ping"></div></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.userMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(this.map);
    this.accuracyCircle = L.circle([lat, lng], {
      radius: coords.accuracy || 20,
      color: '#06b6d4',
      fillColor: '#06b6d4',
      fillOpacity: 0.15,
      weight: 1.5
    }).addTo(this.map);

    this.polyline = L.polyline([[lat, lng]], {
      color: '#38bdf8',
      weight: 3,
      opacity: 0.8,
      dashArray: '5, 8'
    }).addTo(this.map);

    this._updateAddressUi();

    locationService.startTracking((newCoords, breadcrumbs) => {
      if (!this.map) return;
      const newLatLng = [newCoords.latitude, newCoords.longitude];
      this.userMarker.setLatLng(newLatLng);
      this.accuracyCircle.setLatLng(newLatLng);
      this.accuracyCircle.setRadius(newCoords.accuracy || 20);

      if (breadcrumbs && breadcrumbs.length > 0) {
        this.polyline.setLatLngs(breadcrumbs);
      }
      this._updateAccuracyTag(newCoords.accuracy);
    });
  }

  _updateAccuracyTag(accuracy = 15) {
    const tag = this.container.querySelector('#map-accuracy-tag');
    if (tag) {
      tag.innerText = `±${Math.round(accuracy)}m ${i18n.t('accuracySuffix')}`;
    }
  }

  _updateAddressUi() {
    const addrEl = this.container.querySelector('#map-address-text');
    if (addrEl && locationService.currentAddress) {
      addrEl.innerText = locationService.currentAddress;
    }
  }

  _bindEvents() {
    window.addEventListener('safetynet:address-updated', (e) => {
      const addrEl = this.container.querySelector('#map-address-text');
      if (addrEl) addrEl.innerText = e.detail.address;
    });

    const recenterBtn = this.container.querySelector('#recenter-map-btn');
    if (recenterBtn) {
      recenterBtn.addEventListener('click', async () => {
        const pos = await locationService.getCurrentLocation();
        if (this.map) {
          this.map.flyTo([pos.latitude, pos.longitude], 17, { duration: 1.2 });
        }
      });
    }

    const shareBtn = this.container.querySelector('#share-live-map-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const pos = await locationService.getCurrentLocation();
        const url = locationService.getGoogleMapsUrl(pos.latitude, pos.longitude);
        const text = `📍 My Live Location:\n${url}\nAddress: ${locationService.currentAddress || 'Locating...'}`;

        if (navigator.share) {
          try {
            await navigator.share({ title: 'My Live Location', text, url });
          } catch (e) {}
        } else {
          await navigator.clipboard.writeText(url);
          alert(i18n.t('linkCopiedAlert'));
        }
      });
    }

    const bindSearch = (btnId, query) => {
      const btn = this.container.querySelector(btnId);
      if (btn) {
        btn.addEventListener('click', async () => {
          const pos = await locationService.getCurrentLocation();
          const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${pos.latitude},${pos.longitude},14z`;
          window.open(searchUrl, '_blank');
        });
      }
    };

    bindSearch('#find-police-btn', 'Police Station near me');
    bindSearch('#find-hospital-btn', 'Emergency Hospital near me');
    bindSearch('#find-pharmacy-btn', '24 Hour Pharmacy near me');
  }

  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}