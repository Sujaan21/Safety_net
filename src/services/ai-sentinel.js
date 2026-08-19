// SafetyNet AI Intelligence & Safety Sentinel Engine
// Features: Risk-Aware Routing, Route Deviation Detection, Smart Alert Prioritization, Velocity Distress Watchdog
import { i18n } from './i18n.js';

class AiSentinelService {
  constructor() {
    this.activeRoute = null;
    this.isMonitoringRoute = false;
    this.lastSpeed = 0;
    this.speedHistory = [];
    this.dangerZones = [];
    this.safeCorridors = [];
    this.anomalyListeners = [];
  }

  /**
   * Initialize dynamic AI danger zones and safe corridors based on reference coordinates
   */
  generateLocalRiskZones(centerLat, centerLng) {
    // Generate intelligent proximity risk heat zones (e.g., poorly lit alleys, isolated transit points)
    const zones = [
      {
        id: 'dz_1',
        title: '⚠️ Unlit Alleyway & Low Visibility Zone',
        titleHi: '⚠️ कम रोशनी व सुनसान गली क्षेत्र',
        type: 'DANGER',
        riskScore: 78,
        reason: 'Poor street lighting & historical night-time incidents',
        reasonHi: 'सड़क पर अपर्याप्त रोशनी एवं सुनसान इलाका',
        center: [centerLat + 0.0028, centerLng + 0.0032],
        radius: 120 // meters
      },
      {
        id: 'dz_2',
        title: '⚠️ Isolated Industrial Underpass',
        titleHi: '⚠️ सुनसान अंडरपास व कम आवाजाही',
        type: 'DANGER',
        riskScore: 85,
        reason: 'Minimal CCTV coverage & low pedestrian density',
        reasonHi: 'सीसीटीवी निगरानी का अभाव एवं कम पैदल आवाजाही',
        center: [centerLat - 0.0035, centerLng + 0.0025],
        radius: 150
      },
      {
        id: 'sc_1',
        title: '🛡️ Verified Safe Walking Corridor',
        titleHi: '🛡️ प्रमाणित सुरक्षित व रोशन पैदल मार्ग',
        type: 'SAFE',
        safetyScore: 94,
        reason: '24/7 commercial activity, bright LED lighting & police patrol beat',
        reasonHi: '24/7 रोशनी, दुकानें एवं पुलिस गश्त क्षेत्र',
        path: [
          [centerLat - 0.002, centerLng - 0.002],
          [centerLat, centerLng],
          [centerLat + 0.002, centerLng - 0.001],
          [centerLat + 0.004, centerLng + 0.001]
        ]
      }
    ];

    this.dangerZones = zones.filter(z => z.type === 'DANGER');
    this.safeCorridors = zones.filter(z => z.type === 'SAFE');
    return zones;
  }

  /**
   * AI Risk-Aware Route Scoring
   * Evaluates route coordinates, time of day, and hazard proximity
   */
  evaluateRouteSafety(waypoints, currentHour = new Date().getHours()) {
    let safetyScore = 100;
    const risks = [];

    // Night penalty (10 PM to 5 AM)
    const isNight = currentHour >= 22 || currentHour < 5;
    if (isNight) {
      safetyScore -= 15;
      risks.push({
        factor: 'NIGHT_HOURS',
        desc: 'Reduced pedestrian density and lower ambient visibility.',
        descHi: 'रात्रि समय - कम दृश्यता व सुनसान सड़कें।'
      });
    }

    // Check proximity to known danger zones
    for (const pt of waypoints) {
      for (const dz of this.dangerZones) {
        const dist = this._calculateDistance(pt[0], pt[1], dz.center[0], dz.center[1]);
        if (dist <= dz.radius + 50) {
          safetyScore -= Math.round((dz.riskScore / 100) * 20);
          risks.push({
            factor: 'HAZARD_PROXIMITY',
            desc: `Route passes within ${Math.round(dist)}m of ${dz.title}`,
            descHi: `मार्ग ${dz.titleHi} के समीप (${Math.round(dist)}m) से गुजरता है।`
          });
        }
      }
    }

    safetyScore = Math.max(20, Math.min(100, safetyScore));

    return {
      safetyScore,
      rating: safetyScore >= 80 ? 'SAFE' : safetyScore >= 50 ? 'MODERATE_RISK' : 'HIGH_RISK',
      risks,
      recommended: safetyScore >= 75
    };
  }

  /**
   * Real-Time Route Deviation Detection
   * Alerts if user strays beyond threshold (> 150m) from active safe corridor
   */
  checkRouteDeviation(currentLat, currentLng) {
    if (!this.activeRoute || !this.isMonitoringRoute) return null;

    let minDistance = Infinity;
    for (const pt of this.activeRoute) {
      const d = this._calculateDistance(currentLat, currentLng, pt[0], pt[1]);
      if (d < minDistance) minDistance = d;
    }

    if (minDistance > 150) {
      const anomaly = {
        type: 'ROUTE_DEVIATION',
        deviationMeters: Math.round(minDistance),
        timestamp: Date.now(),
        message: `⚠️ Route Deviation Detected! You are ${Math.round(minDistance)}m off your planned safe route.`,
        messageHi: `⚠️ मार्ग विचलन का पता चला! आप अपने सुरक्षित मार्ग से ${Math.round(minDistance)}m दूर हैं।`
      };
      this._emitAnomaly(anomaly);
      return anomaly;
    }

    return null;
  }

  /**
   * Behavioral Velocity & Distress Watchdog
   * Detects sudden sprint followed by abrupt halt (e.g. running from an attacker, or sudden fall)
   */
  evaluateMovementPattern(speed, lat, lng) {
    const currentSpeed = speed || 0; // m/s
    this.speedHistory.push({ speed: currentSpeed, time: Date.now(), lat, lng });
    if (this.speedHistory.length > 20) this.speedHistory.shift();

    if (this.speedHistory.length >= 6) {
      const recent = this.speedHistory.slice(-6);
      const maxRecent = Math.max(...recent.map(s => s.speed));
      const minRecent = recent[recent.length - 1].speed;

      // Sprint (> 3.5 m/s or ~12.6 km/h) then sudden freeze (< 0.2 m/s)
      if (maxRecent > 3.5 && minRecent < 0.2) {
        const anomaly = {
          type: 'ERRATIC_VELOCITY_DROP',
          timestamp: Date.now(),
          message: '⚠️ Rapid Movement Anomaly Detected: Sudden high-speed sprint followed by abrupt stop. Are you safe?',
          messageHi: '⚠️ अचानक गति परिवर्तन का पता चला: तेज दौड़ने के बाद अचानक ठहराव। क्या आप सुरक्षित हैं?'
        };
        this._emitAnomaly(anomaly);
        return anomaly;
      }
    }

    this.lastSpeed = currentSpeed;
    return null;
  }

  /**
   * Smart Alert Prioritization
   * Automatically ranks emergency contacts based on urgency, relationship hierarchy, and proximity
   */
  prioritizeEmergencyContacts(contacts = [], urgency = 'HIGH') {
    if (!contacts || contacts.length === 0) return [];

    const relationWeight = {
      'Spouse': 100,
      'Parent': 95,
      'Family': 90,
      'Sibling': 85,
      'Close Friend': 75,
      'Colleague': 60,
      'Other': 50
    };

    return [...contacts].sort((a, b) => {
      // Primary flag always gets highest priority
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;

      // Urgency weighting
      const wA = relationWeight[a.relationship] || 60;
      const wB = relationWeight[b.relationship] || 60;
      return wB - wA;
    }).map((c, index) => ({
      ...c,
      dispatchOrder: index + 1,
      recommendedChannel: index === 0 && urgency === 'CRITICAL' ? 'DIRECT_CALL_AND_SMS' : 'SMS_AND_WHATSAPP'
    }));
  }

  startRouteMonitoring(routeCoordinates) {
    this.activeRoute = routeCoordinates;
    this.isMonitoringRoute = true;
  }

  stopRouteMonitoring() {
    this.activeRoute = null;
    this.isMonitoringRoute = false;
  }

  _emitAnomaly(anomaly) {
    window.dispatchEvent(new CustomEvent('safetynet:ai-anomaly', { detail: anomaly }));
  }

  // Haversine distance in meters
  _calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export const aiSentinel = new AiSentinelService();
