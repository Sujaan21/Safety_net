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
    this.tileLayer = null;
    this.autoFollow = true;
    this.currentTileStyle = 'dark'; // 'dark' | 'satellite' | 'streets'
    this.riskZoneLayers = [];
    this.safeRouteLayer = null;
    this.currentCoords = locationService.getLastKnownLocation();
  }

  async render() {
    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in w-full">
        
        <!-- TOP COMMAND CENTER HEADER -->
        <div class="glass-card p-4 md:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 class="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>🛰️ Tactical GPS Sentinel & Live Radar</span>
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Continuous high-precision satellite positioning with AI risk-corridor analysis.
              </p>
            </div>
          </div>

          <!-- Tile Style Switcher Buttons -->
          <div class="flex items-center space-x-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button id="tile-btn-dark" class="px-3 py-1.5 rounded-xl transition ${this.currentTileStyle === 'dark' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'}">
              🌙 Cyber Dark
            </button>
            <button id="tile-btn-satellite" class="px-3 py-1.5 rounded-xl transition ${this.currentTileStyle === 'satellite' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'}">
              🛰️ Satellite
            </button>
            <button id="tile-btn-streets" class="px-3 py-1.5 rounded-xl transition ${this.currentTileStyle === 'streets' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400'}">
              ☀️ Street
            </button>
          </div>
        </div>

        <!-- MAIN GRID: Map on Left (col-8), Telemetry & Havens on Right (col-4) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- LEFT / MAIN MAP CANVAS -->
          <div class="lg:col-span-8 relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-cyan-500/30 shadow-2xl h-[460px] md:h-[600px] bg-slate-950">
            <div id="leaflet-map-canvas" class="w-full h-full z-0"></div>

            <!-- TOP FLOATING HUD: Live Telemetry & Satellite Status -->
            <div class="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              
              <!-- Real-time Coordinates & Precision Badge -->
              <div class="pointer-events-auto glass-hud px-4 py-2 rounded-2xl flex items-center space-x-3 text-white">
                <div class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                </div>
                <div>
                  <span class="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block font-mono">Live Coordinates</span>
                  <span id="hud-lat-lng" class="text-white font-black text-xs md:text-sm font-mono tracking-wide">
                    ${this.currentCoords.latitude.toFixed(5)}°N, ${this.currentCoords.longitude.toFixed(5)}°E
                  </span>
                </div>
              </div>

              <!-- GPS Lock & Accuracy Pill -->
              <div id="hud-gps-pill" class="pointer-events-auto glass-hud px-3.5 py-2 rounded-2xl flex items-center space-x-2 text-xs font-black text-emerald-400">
                <span id="hud-gps-icon">🟢</span>
                <span id="hud-gps-status-text">GPS Lock (±${Math.round(this.currentCoords.accuracy || 10)}m)</span>
              </div>
            </div>

            <!-- AI Deviation Alert Banner -->
            <div id="map-ai-alert-banner" class="hidden absolute top-20 left-4 right-4 z-20 bg-rose-950/95 backdrop-blur-md border border-rose-500 p-4 rounded-2xl shadow-2xl flex items-center justify-between text-xs text-rose-100 animate-bounce">
              <div class="flex items-center space-x-3">
                <span class="text-2xl">⚠️</span>
                <div>
                  <p class="font-black text-sm uppercase">AI Route Deviation Warning</p>
                  <p id="map-ai-alert-msg" class="text-[11px] text-rose-300">You have drifted 180m off your verified safe walking route.</p>
                </div>
              </div>
              <button id="btn-dismiss-ai-alert" class="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 rounded-xl text-white font-bold text-xs">Dismiss</button>
            </div>

            <!-- FLOATING MAP CONTROLS (Bottom Right) -->
            <div class="absolute bottom-5 right-5 z-10 flex flex-col space-y-2.5 pointer-events-auto">
              <!-- Auto-Follow Toggle -->
              <button id="toggle-autofollow-btn" title="Toggle Auto-Follow Center" class="w-12 h-12 rounded-2xl ${this.autoFollow ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/40 ring-2 ring-cyan-400' : 'bg-slate-900/90 text-slate-400'} border border-white/20 shadow-2xl flex items-center justify-center transition active:scale-90 text-lg">
                🎯
              </button>

              <!-- Zoom In -->
              <button id="btn-zoom-in" title="Zoom In" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 shadow-2xl flex items-center justify-center transition active:scale-90 font-bold text-lg">
                +
              </button>

              <!-- Zoom Out -->
              <button id="btn-zoom-out" title="Zoom Out" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 shadow-2xl flex items-center justify-center transition active:scale-90 font-bold text-lg">
                −
              </button>

              <!-- Recenter Floating Button -->
              <button id="recenter-map-btn" title="${i18n.t('recenterMap')}" class="w-12 h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-white/20 shadow-2xl flex items-center justify-center transition active:scale-90">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            </div>
          </div>

          <!-- RIGHT COLUMN: Telemetry, AI Corridors & Safe Havens -->
          <div class="lg:col-span-4 space-y-5">
            
            <!-- Resolved Street Address Card -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xl">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📍 Current Location Anchor</span>
                </span>
                <span id="map-accuracy-tag" class="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                  ±${Math.round(this.currentCoords.accuracy || 15)}m Precision
                </span>
              </div>

              <!-- Street Address Output -->
              <div id="map-address-text" class="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100 dark:bg-slate-900/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                ${locationService.currentAddress || i18n.t('resolvingAddress')}
              </div>

              <!-- Share Live GPS Link Button -->
              <button id="share-live-map-btn" class="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/25 active:scale-98 transition flex items-center justify-center space-x-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                <span>${i18n.t('shareLiveLocationBtn')}</span>
              </button>
            </div>

            <!-- AI Risk-Aware Safe Corridors Card -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xl">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <span>🤖 AI Risk-Aware Corridors</span>
                </h4>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active Sentinel</span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                SafetyNet AI plots verified lit routes and flags unlit underpasses and high-risk zones.
              </p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex flex-col justify-between">
                  <span class="text-[10px] uppercase font-bold text-emerald-500">Safe Corridor</span>
                  <span class="text-base font-black font-mono mt-1">94/100</span>
                </div>
                <div class="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold flex flex-col justify-between">
                  <span class="text-[10px] uppercase font-bold text-rose-500">Risk Zones Flagged</span>
                  <span class="text-base font-black font-mono mt-1">2 Areas</span>
                </div>
              </div>
            </div>

            <!-- Safe Haven 1-Tap Directions -->
            <div class="glass-card p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xl">
              <h4 class="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <span>🛡️ ${i18n.t('safeHavensTitle')}</span>
              </h4>
              <div class="space-y-2">
                <button id="find-police-btn" class="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-800 flex items-center justify-between transition active:scale-98">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">👮</span>
                    <div class="text-left">
                      <p class="font-bold">${i18n.t('police')}</p>
                      <p class="text-[10px] text-slate-500 font-normal">Nearest Station & Patrol</p>
                    </div>
                  </div>
                  <span class="text-[11px] text-cyan-500 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-xl">Directions →</span>
                </button>

                <button id="find-hospital-btn" class="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-800 flex items-center justify-between transition active:scale-98">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">🏥</span>
                    <div class="text-left">
                      <p class="font-bold">${i18n.t('hospital')}</p>
                      <p class="text-[10px] text-slate-500 font-normal">Trauma & Emergency Care</p>
                    </div>
                  </div>
                  <span class="text-[11px] text-cyan-500 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-xl">Directions →</span>
                </button>

                <button id="find-pharmacy-btn" class="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-800 flex items-center justify-between transition active:scale-98">
                  <div class="flex items-center space-x-3">
                    <span class="text-2xl">💊</span>
                    <div class="text-left">
                      <p class="font-bold">${i18n.t('pharmacy')}</p>
                      <p class="text-[10px] text-slate-500 font-normal">24/7 Medical Supplies</p>
                    </div>
                  </div>
                  <span class="text-[11px] text-cyan-500 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-xl">Directions →</span>
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

    this._applyTileLayer(this.currentTileStyle);

    // High-tech Glowing User Pulse Marker
    const pulseIcon = L.divIcon({
      className: 'custom-pulse-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white shadow-2xl relative flex items-center justify-center">
            <div class="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
            <div class="absolute -inset-2.5 rounded-full bg-cyan-400 opacity-60 animate-ping"></div>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    this.userMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(this.map);
    this.userMarker.bindTooltip(`📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`, {
      permanent: true,
      direction: 'top',
      offset: [0, -14],
      className: 'leaflet-tooltip-custom'
    });

    this.accuracyCircle = L.circle([lat, lng], {
      radius: this.currentCoords.accuracy || 20,
      color: '#06b6d4',
      fillColor: '#06b6d4',
      fillOpacity: 0.18,
      weight: 1.5
    }).addTo(this.map);

    this.polyline = L.polyline([[lat, lng]], {
      color: '#38bdf8',
      weight: 4,
      opacity: 0.9,
      dashArray: '6, 8'
    }).addTo(this.map);

    this._renderAiRiskOverlays(lat, lng);
    this._updateHudUi(this.currentCoords);

    // Start continuous tracking
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

  _applyTileLayer(style) {
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }

    let tileUrl = '';
    let maxZoom = 20;

    if (style === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 19;
    } else if (style === 'streets') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    } else {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }

    this.tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; CARTO / OpenStreetMap / Esri',
      subdomains: 'abcd',
      maxZoom
    }).addTo(this.map);
  }

  _renderAiRiskOverlays(lat, lng) {
    const zones = aiSentinel.generateLocalRiskZones(lat, lng);

    this.riskZoneLayers.forEach(layer => this.map.removeLayer(layer));
    this.riskZoneLayers = [];

    zones.forEach(zone => {
      if (zone.type === 'DANGER') {
        const circle = L.circle(zone.center, {
          radius: zone.radius,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.25,
          weight: 2,
          dashArray: '4, 4'
        }).addTo(this.map);

        circle.bindPopup(`
          <div class="text-xs p-1 space-y-1 font-sans">
            <p class="font-bold text-rose-500">${zone.title}</p>
            <p class="text-slate-300 text-[11px]">${zone.reason}</p>
            <span class="inline-block px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full text-[9px] font-bold">Risk: ${zone.riskScore}/100</span>
          </div>
        `);
        this.riskZoneLayers.push(circle);
      } else if (zone.type === 'SAFE' && zone.path) {
        const safeLine = L.polyline(zone.path, {
          color: '#10b981',
          weight: 6,
          opacity: 0.9
        }).addTo(this.map);

        safeLine.bindPopup(`
          <div class="text-xs p-1 space-y-1 font-sans">
            <p class="font-bold text-emerald-400">${zone.title}</p>
            <p class="text-slate-300 text-[11px]">${zone.reason}</p>
            <span class="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] font-bold">Safety Score: ${zone.safetyScore}/100</span>
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
      accuracyTag.innerText = `±${Math.round(coords.accuracy || 15)}m Precision`;
    }

    const gpsPill = this.container.querySelector('#hud-gps-pill');
    const gpsText = this.container.querySelector('#hud-gps-status-text');
    const gpsIcon = this.container.querySelector('#hud-gps-icon');

    if (gpsText && gpsPill) {
      if (locationService.gpsStatus === 'LOCKED') {
        gpsText.innerText = `GPS Lock (±${Math.round(coords.accuracy || 10)}m)`;
        gpsPill.className = 'pointer-events-auto glass-hud px-3.5 py-2 rounded-2xl flex items-center space-x-2 text-xs font-black text-emerald-400';
        if (gpsIcon) gpsIcon.innerText = '🟢';
      } else {
        gpsText.innerText = 'Acquiring GPS Signal...';
        gpsPill.className = 'pointer-events-auto glass-hud px-3.5 py-2 rounded-2xl flex items-center space-x-2 text-xs font-black text-amber-400 animate-pulse';
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

    // Tile Layer Switchers
    const bindTile = (btnId, style) => {
      const btn = this.container.querySelector(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          this.currentTileStyle = style;
          this._applyTileLayer(style);
          this.container.querySelectorAll('[id^="tile-btn-"]').forEach(b => {
            b.className = 'px-3 py-1.5 rounded-xl transition text-slate-600 dark:text-slate-400';
          });
          btn.className = 'px-3 py-1.5 rounded-xl transition bg-cyan-600 text-white shadow-md font-bold';
        });
      }
    };

    bindTile('#tile-btn-dark', 'dark');
    bindTile('#tile-btn-satellite', 'satellite');
    bindTile('#tile-btn-streets', 'streets');

    // Zoom Controls
    const zoomInBtn = this.container.querySelector('#btn-zoom-in');
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.map?.zoomIn());

    const zoomOutBtn = this.container.querySelector('#btn-zoom-out');
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.map?.zoomOut());

    const toggleFollowBtn = this.container.querySelector('#toggle-autofollow-btn');
    if (toggleFollowBtn) {
      toggleFollowBtn.addEventListener('click', () => {
        this.autoFollow = !this.autoFollow;
        if (this.autoFollow) {
          toggleFollowBtn.className = 'w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-cyan-500/40 ring-2 ring-cyan-400 border border-white/20 shadow-2xl flex items-center justify-center transition active:scale-90 text-lg';
          if (this.map && this.currentCoords) {
            this.map.panTo([this.currentCoords.latitude, this.currentCoords.longitude], { animate: true });
          }
        } else {
          toggleFollowBtn.className = 'w-12 h-12 rounded-2xl bg-slate-900/90 text-slate-400 border border-white/20 shadow-2xl flex items-center justify-center transition active:scale-90 text-lg';
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
        const text = `📍 My Live GPS Location:\n${url}\nAddress: ${locationService.currentAddress || 'Locating...'}`;

        if (navigator.share) {
          try {
            await navigator.share({ title: 'My Live GPS Location', text, url });
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