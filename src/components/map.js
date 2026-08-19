import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService } from '../services/location.js';
import { i18n } from '../services/i18n.js';
import { storage } from '../services/storage.js';
import { aiSentinel } from '../services/ai-sentinel.js';

export class MapComponent {
  constructor(container) {
    this.container = container;
    this.map = null;
    this.userMarker = null;
    this.accuracyCircle = null;
    this.polyline = null;
    this.autoFollow = true;
    this.riskZoneLayers = [];
    this.safeRouteLayer = null;
    this.currentCoords = locationService.getLastKnownLocation();
  }

  async render() {
    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in w-full">
        <!-- Desktop Grid Layout: Map on Left (col-8), Info on Right (col-4) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT / MAIN MAP CANVAS & HUD -->
          <div class="lg:col-span-8 relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl h-[440px] md:h-[560px] bg-slate-100 dark:bg-slate-950">
            <div id="leaflet-map-canvas" class="w-full h-full z-0"></div>

            <!-- TOP MAP HUD: Live Coordinates & GPS Signal Status -->
            <div class="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <!-- Live Coordinates Chip -->
              <div class="pointer-events-auto bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 shadow-xl flex items-center space-x-3 text-xs text-white">
                <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <div class="font-mono">
                  <span class="text-slate-400 text-[10px] uppercase font-bold block">Live Coordinates</span>
                  <span id="hud-lat-lng" class="text-cyan-300 font-bold text-xs tracking-wider">
                    ${this.currentCoords.latitude.toFixed(5)}°N, ${this.currentCoords.longitude.toFixed(5)}°E
                  </span>
                </div>
              </div>

              <!-- GPS Signal Lock Badge -->
              <div id="hud-gps-pill" class="pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 shadow-xl flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <span id="hud-gps-icon">🛰️</span>
                <span id="hud-gps-status-text">Acquiring GPS Signal...</span>
              </div>
            </div>

            <!-- AI Deviation / Safety Alert Banner (Dynamic) -->
            <div id="map-ai-alert-banner" class="hidden absolute top-16 left-4 right-4 z-20 bg-rose-950/90 backdrop-blur-md border border-rose-500/50 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between text-xs text-rose-200 animate-bounce">
              <div class="flex items-center space-x-2.5">
                <span class="text-lg">⚠️</span>
                <span id="map-ai-alert-msg" class="font-bold">Route Deviation Detected!</span>
              </div>
              <button id="btn-dismiss-ai-alert" class="px-2.5 py-1 bg-rose-700 hover:bg-rose-600 rounded-lg text-white font-bold text-[10px]">Dismiss</button>
            </div>

            <!-- Floating Control Buttons (Bottom Right) -->
            <div class="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
              <!-- Auto-Follow Toggle -->
              <button id="toggle-autofollow-btn" title="Toggle Auto-Follow Location" class="w-11 h-11 rounded-2xl ${this.autoFollow ? 'bg-cyan-600 text-white' : 'bg-white/90 dark:bg-slate-900/90 text-slate-500'} border shadow-xl flex items-center justify-center transition active:scale-95 text-xs font-bold">
                🎯
              </button>

              <!-- Recenter Floating Button -->
              <button id="recenter-map-btn" title="${i18n.t('recenterMap')}" class="w-11 h-11 rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400 border shadow-xl flex items-center justify-center transition active:scale-95">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            </div>
          </div>

          <!-- RIGHT / MAP CONTROLS, AI SENTINEL & SAFE HAVENS -->
          <div class="lg:col-span-4 space-y-5">
            
            <!-- Live Telemetry & Address Card -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="relative flex h-3 w-3">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                  </span>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">${i18n.t('liveGpsTracking')}</span>
                </div>
                <span id="map-accuracy-tag" class="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-800/40 px-2.5 py-0.5 rounded-lg font-bold">
                  ±${Math.round(this.currentCoords.accuracy || 15)}m
                </span>
              </div>

              <!-- Address Preview -->
              <div id="map-address-text" class="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                ${locationService.currentAddress || i18n.t('resolvingAddress')}
              </div>

              <!-- Share Button -->
              <button id="share-live-map-btn" class="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-900/20 active:scale-98 transition flex items-center justify-center space-x-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>${i18n.t('shareLiveLocationBtn')}</span>
              </button>
            </div>

            <!-- AI Risk-Aware Safe Routing Card -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🤖 AI Risk-Aware Corridors</span>
                </h4>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                SafetyNet AI analyzes night lighting, crowd density, and incident history to plot safe walking routes.
              </p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <button id="btn-toggle-safe-corridor" class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 transition text-left">
                  🛡️ Safe Corridor (94/100)
                </button>
                <button id="btn-toggle-risk-zones" class="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-500/20 transition text-left">
                  ⚠️ Danger Zones (2)
                </button>
              </div>
            </div>

            <!-- Safe Haven Directories -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
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

    // Load last known position immediately for zero delay
    this.currentCoords = locationService.getLastKnownLocation();
    const lat = this.currentCoords.latitude;
    const lng = this.currentCoords.longitude;

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

    // Custom Live Marker with Coordinate Tooltip
    const pulseIcon = L.divIcon({
      className: 'custom-pulse-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-2xl relative flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-white"></div>
            <div class="absolute -inset-2 rounded-full bg-cyan-400 opacity-60 animate-ping"></div>
          </div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    this.userMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(this.map);
    this.userMarker.bindTooltip(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`, {
      permanent: true,
      direction: 'top',
      offset: [0, -12],
      className: 'bg-black/80 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-cyan-500/40 shadow-lg'
    });

    this.accuracyCircle = L.circle([lat, lng], {
      radius: this.currentCoords.accuracy || 20,
      color: '#06b6d4',
      fillColor: '#06b6d4',
      fillOpacity: 0.15,
      weight: 1.5
    }).addTo(this.map);

    this.polyline = L.polyline([[lat, lng]], {
      color: '#38bdf8',
      weight: 3.5,
      opacity: 0.8,
      dashArray: '6, 8'
    }).addTo(this.map);

    // Render AI risk zones & safe walking corridors
    this._renderAiRiskOverlays(lat, lng);
    this._updateHudUi(this.currentCoords);

    // Start continuous live tracking
    locationService.startTracking((newCoords, breadcrumbs) => {
      if (!this.map) return;
      this.currentCoords = newCoords;
      const newLatLng = [newCoords.latitude, newCoords.longitude];

      this.userMarker.setLatLng(newLatLng);
      this.userMarker.setTooltipContent(`📍 ${newCoords.latitude.toFixed(5)}, ${newCoords.longitude.toFixed(5)}`);
      this.accuracyCircle.setLatLng(newLatLng);
      this.accuracyCircle.setRadius(newCoords.accuracy || 15);

      if (breadcrumbs && breadcrumbs.length > 0) {
        this.polyline.setLatLngs(breadcrumbs);
      }

      if (this.autoFollow) {
        this.map.panTo(newLatLng, { animate: true, duration: 0.8 });
      }

      this._updateHudUi(newCoords);

      // AI Sentinel Checks
      aiSentinel.checkRouteDeviation(newCoords.latitude, newCoords.longitude);
      aiSentinel.evaluateMovementPattern(newCoords.speed, newCoords.latitude, newCoords.longitude);
    });

    // Request fresh location fix immediately
    locationService.getCurrentLocation().then(freshCoords => {
      if (this.map && freshCoords) {
        this.currentCoords = freshCoords;
        const freshLatLng = [freshCoords.latitude, freshCoords.longitude];
        this.userMarker.setLatLng(freshLatLng);
        this.accuracyCircle.setLatLng(freshLatLng);
        this._updateHudUi(freshCoords);
        if (this.autoFollow) {
          this.map.flyTo(freshLatLng, 16, { duration: 1.0 });
        }
      }
    });
  }

  _renderAiRiskOverlays(lat, lng) {
    const zones = aiSentinel.generateLocalRiskZones(lat, lng);

    // Clear previous layers
    this.riskZoneLayers.forEach(layer => this.map.removeLayer(layer));
    this.riskZoneLayers = [];

    zones.forEach(zone => {
      if (zone.type === 'DANGER') {
        const circle = L.circle(zone.center, {
          radius: zone.radius,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.2,
          weight: 2,
          dashArray: '4, 4'
        }).addTo(this.map);

        circle.bindPopup(`
          <div class="text-xs p-1 space-y-1 font-sans">
            <p class="font-bold text-rose-600">${zone.title}</p>
            <p class="text-slate-600 text-[11px]">${zone.reason}</p>
            <span class="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[9px] font-bold">Risk Score: ${zone.riskScore}/100</span>
          </div>
        `);
        this.riskZoneLayers.push(circle);
      } else if (zone.type === 'SAFE' && zone.path) {
        const safeLine = L.polyline(zone.path, {
          color: '#10b981',
          weight: 5,
          opacity: 0.85
        }).addTo(this.map);

        safeLine.bindPopup(`
          <div class="text-xs p-1 space-y-1 font-sans">
            <p class="font-bold text-emerald-600">${zone.title}</p>
            <p class="text-slate-600 text-[11px]">${zone.reason}</p>
            <span class="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold">Safety Score: ${zone.safetyScore}/100</span>
          </div>
        `);
        this.riskZoneLayers.push(safeLine);
        aiSentinel.startRouteMonitoring(zone.path);
      }
    });
  }

  _updateHudUi(coords) {
    const latLngEl = this.container.querySelector('#hud-lat-lng');
    if (latLngEl) {
      latLngEl.innerText = `${coords.latitude.toFixed(5)}°N, ${coords.longitude.toFixed(5)}°E`;
    }

    const accuracyTag = this.container.querySelector('#map-accuracy-tag');
    if (accuracyTag) {
      accuracyTag.innerText = `±${Math.round(coords.accuracy || 15)}m`;
    }

    const gpsPill = this.container.querySelector('#hud-gps-pill');
    const gpsText = this.container.querySelector('#hud-gps-status-text');
    const gpsIcon = this.container.querySelector('#hud-gps-icon');

    if (gpsText && gpsPill) {
      if (locationService.gpsStatus === 'LOCKED') {
        gpsText.innerText = `GPS Lock (±${Math.round(coords.accuracy || 10)}m)`;
        gpsPill.className = 'pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-emerald-500/40 shadow-xl flex items-center space-x-2 text-xs font-bold text-emerald-400';
        if (gpsIcon) gpsIcon.innerText = '🟢';
      } else {
        gpsText.innerText = 'Acquiring GPS Signal...';
        gpsPill.className = 'pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-500/40 shadow-xl flex items-center space-x-2 text-xs font-bold text-amber-400 animate-pulse';
        if (gpsIcon) gpsIcon.innerText = '🛰️';
      }
    }

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

    window.addEventListener('safetynet:ai-anomaly', (e) => {
      const banner = this.container.querySelector('#map-ai-alert-banner');
      const msg = this.container.querySelector('#map-ai-alert-msg');
      if (banner && msg) {
        msg.innerText = e.detail.message;
        banner.classList.remove('hidden');
      }
    });

    const dismissBtn = this.container.querySelector('#btn-dismiss-ai-alert');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const banner = this.container.querySelector('#map-ai-alert-banner');
        if (banner) banner.classList.add('hidden');
      });
    }

    const toggleFollowBtn = this.container.querySelector('#toggle-autofollow-btn');
    if (toggleFollowBtn) {
      toggleFollowBtn.addEventListener('click', () => {
        this.autoFollow = !this.autoFollow;
        if (this.autoFollow) {
          toggleFollowBtn.className = 'w-11 h-11 rounded-2xl bg-cyan-600 text-white border shadow-xl flex items-center justify-center transition active:scale-95 text-xs font-bold';
          if (this.map && this.currentCoords) {
            this.map.panTo([this.currentCoords.latitude, this.currentCoords.longitude], { animate: true });
          }
        } else {
          toggleFollowBtn.className = 'w-11 h-11 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-500 border shadow-xl flex items-center justify-center transition active:scale-95 text-xs font-bold';
        }
      });
    }

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
          } catch {}
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