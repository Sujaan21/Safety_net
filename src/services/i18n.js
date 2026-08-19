// SafetyNet Bilingual Internationalization (English & Hindi)
import { storage } from './storage.js';

export const translations = {
  en: {
    // App header & nav
    appTitle: "SafetyNet",
    sentinelLive: "Sentinel Live",
    toggleTheme: "Toggle Theme",
    toggleLang: "हिन्दी",
    navSos: "SOS",
    navTimer: "Timer",
    navMap: "Map",
    navChat: "AI Chat",
    navMedical: "Medical",

    // SOS Component
    sosTitle: "EMERGENCY SOS",
    sosSubtitle: "Tap or Hold 2s",
    sosDesc: "Sends your live GPS coordinates, battery status, and emergency alert to trusted contacts.",
    whatsapp: "WhatsApp",
    smsAlert: "SMS Alert",
    sirenAlarm: "Siren Alarm",
    sirenPlaying: "Stop Siren",
    sirenSubtext: "Dual Tone Audio",
    sirenActiveSubtext: "Alarm Blaring",
    callPolice: "Call Police / 112",
    callDispatch: "Official Dispatch",
    sentinelActive: "SafetyNet Sentinel Active",
    locatingGps: "Locating GPS...",
    copyGps: "Copy GPS",
    copied: "Copied!",
    emergencyBroadcastTitle: "EMERGENCY BROADCAST",
    emergencyBroadcastSub: "Live coordinates captured & ready to dispatch",
    sendWhatsapp: "Send WhatsApp",
    sendSms: "Send SMS",
    shareToApp: "Share to App",
    dismissAlert: "Dismiss Alert",
    defaultSosPrefix: "🚨 EMERGENCY ALERT! I need immediate assistance.",

    // Timer Component
    timerTitle: "Safety Check-In Timer",
    timerDesc: "If not checked in before zero, SafetyNet automatically alerts trusted contacts.",
    timerStatusIdle: "Idle",
    timerStatusMonitoring: "Monitoring",
    timeRemaining: "Time Remaining",
    readyToStart: "Ready to Start",
    selectDuration: "Select Duration",
    min5: "5 min",
    min15: "15 min",
    min30: "30 min",
    hr1: "1 hr",
    startTimer: "START SAFETY TIMER",
    imSafe: "I'M SAFE (CHECK-IN)",
    extend5Min: "+5 MIN",
    cancelTimer: "Cancel Safety Timer",
    timerCheckedInVoice: "Check-in confirmed. You are safe.",
    timerWarningVoice: "Warning! Safety timer expired without check-in. Alerting emergency contacts.",
    timerNotificationTitle: "🚨 SafetyNet Timer Expired!",
    timerNotificationBody: "Check-in was missed. Emergency contacts are being notified.",
    missedCheckinPrefix: "🚨 MISSED SAFETY CHECK-IN ALERT! I did not check in on my SafetyNet timer. Please call me or send help immediately!",

    // Map Component
    liveGpsTracking: "Live GPS Tracking",
    locating: "Locating...",
    accuracySuffix: "accuracy",
    resolvingAddress: "Resolving street address...",
    recenterMap: "Center on Me",
    shareLiveLocationBtn: "SHARE LIVE LOCATION LINK",
    safeHavensTitle: "Nearby Safe Havens",
    police: "Police",
    hospital: "Hospital",
    pharmacy: "Pharmacy",
    linkCopiedAlert: "Live Google Maps location link copied to clipboard!",

    // Chat Component
    chatWelcomeTitle: "🛡️ SafetyNet AI Assistant",
    chatWelcomeText: "I am your 24/7 personal safety specialist. I provide immediate step-by-step guidance for emergency situations, first aid, threat de-escalation, and personal protection.\n\nTap any quick prompt below or type your question:",
    chipFollowed: "🚶 Being Followed",
    chipDeescalate: "🛡️ De-escalation",
    chipBleeding: "🩸 Severe Bleeding",
    chipCpr: "🫀 CPR Steps",
    chipRideshare: "🚗 Rideshare Safety",
    promptFollowed: "I think someone is following me. What should I do right now?",
    promptDeescalate: "How do I de-escalate an aggressive stranger?",
    promptBleeding: "First aid for severe bleeding",
    promptCpr: "Step by step CPR instructions",
    promptRideshare: "Rideshare and taxi safety checklist",
    chatPlaceholder: "Ask safety emergency questions...",
    analyzingSafety: "Analyzing safety response...",
    speakBtn: "🔊 Speak",
    copyBtn: "📋 Copy",
    sourceGemini: "Gemini 2.0 Flash",
    sourceOffline: "Built-in Safety Knowledge",

    // Profile & Medical Component
    tabMedicalCard: "📋 Emergency Medical Card",
    tabSettings: "⚙️ Contacts & Settings",
    medicalIdTitle: "Emergency Medical ID",
    firstResponderAccess: "FIRST RESPONDER ACCESS",
    fullName: "Full Name",
    primaryContact: "Primary Contact",
    knownAllergies: "Known Allergies",
    medications: "Medications",
    criticalNotes: "Critical Notes",
    scanQrTitle: "Scan for Full Medical & Contact Profile",
    scanQrSub: "Accessible offline without unlocking device",
    personalMedicalDetails: "🩺 Personal Medical Details",
    bloodGroup: "Blood Group",
    emergencyHotline: "Emergency Hotline",
    emergencyContactsTitle: "📞 Emergency Contacts",
    addContact: "+ Add Contact",
    primaryTag: "Primary",
    setPrimary: "Set Primary",
    geminiApiKeyTitle: "🤖 Gemini 2.0 Flash API Key",
    geminiApiKeyDesc: "Add your Google Gemini API key to enable online deep contextual intelligence. (Leave empty to use offline emergency knowledge).",
    saveChanges: "SAVE CHANGES",
    exportBackup: "Export Backup",
    importBackup: "Import Backup",
    saveSuccess: "Settings & Medical Profile Saved Successfully!",
    promptContactName: "Contact Name:",
    promptContactPhone: "Contact Phone Number (with country code):",
    promptContactRel: "Relationship (e.g. Spouse, Parent, Friend):",
    desktopDashboard: "SafetyNet Command Center"
  },
  hi: {
    // App header & nav
    appTitle: "सेफ्टीनेट",
    sentinelLive: "सुरक्षा प्रहरी सक्रिय",
    toggleTheme: "थीम बदलें",
    toggleLang: "English",
    navSos: "एसओएस (SOS)",
    navTimer: "टाइमर",
    navMap: "नक्शा",
    navChat: "एआई चैट",
    navMedical: "मेडिकल कार्ड",

    // SOS Component
    sosTitle: "आपातकालीन एसओएस",
    sosSubtitle: "दबाएं या 2 सेकंड तक दबाए रखें",
    sosDesc: "आपके लाइव जीपीएस निर्देशांक, बैटरी स्थिति और आपातकालीन संदेश को विश्वसनीय संपर्कों को भेजता है।",
    whatsapp: "व्हाट्सएप",
    smsAlert: "एसएमएस अलर्ट",
    sirenAlarm: "सायरन अलार्म",
    sirenPlaying: "सायरन बंद करें",
    sirenSubtext: "दोहरी ध्वनि ऑडियो",
    sirenActiveSubtext: "अलार्म बज रहा है",
    callPolice: "पुलिस / 112 को कॉल करें",
    callDispatch: "आधिकारिक आपातकालीन सेवा",
    sentinelActive: "सेफ्टीनेट सुरक्षा प्रणाली सक्रिय",
    locatingGps: "जीपीएस खोजा जा रहा है...",
    copyGps: "जीपीएस कॉपी करें",
    copied: "कॉपी हो गया!",
    emergencyBroadcastTitle: "आपातकालीन प्रसारण",
    emergencyBroadcastSub: "लाइव स्थान प्राप्त हुआ - तुरंत भेजने के लिए तैयार",
    sendWhatsapp: "व्हाट्सएप भेजें",
    sendSms: "एसएमएस भेजें",
    shareToApp: "अन्य ऐप पर साझा करें",
    dismissAlert: "अलर्ट बंद करें",
    defaultSosPrefix: "🚨 आपातकालीन अलर्ट! मुझे तुरंत सहायता की आवश्यकता है।",

    // Timer Component
    timerTitle: "सुरक्षा चेक-इन टाइमर",
    timerDesc: "यदि समय समाप्त होने से पहले चेक-इन नहीं किया गया, तो सेफ्टीनेट स्वचालित रूप से संपर्कों को सूचित करेगा।",
    timerStatusIdle: "निष्क्रिय",
    timerStatusMonitoring: "निगरानी जारी",
    timeRemaining: "शेष समय",
    readyToStart: "शुरू करने के लिए तैयार",
    selectDuration: "अवधि चुनें",
    min5: "5 मिनट",
    min15: "15 मिनट",
    min30: "30 मिनट",
    hr1: "1 घंटा",
    startTimer: "सुरक्षा टाइमर शुरू करें",
    imSafe: "मैं सुरक्षित हूँ (चेक-इन)",
    extend5Min: "+5 मिनट",
    cancelTimer: "सुरक्षा टाइमर रद्द करें",
    timerCheckedInVoice: "चेक-इन की पुष्टि हो गई। आप सुरक्षित हैं।",
    timerWarningVoice: "चेतावनी! समय समाप्त हो गया है। आपातकालीन संपर्कों को सूचित किया जा रहा है।",
    timerNotificationTitle: "🚨 सेफ्टीनेट टाइमर समाप्त!",
    timerNotificationBody: "चेक-इन नहीं किया गया। आपातकालीन संपर्कों को सूचना भेजी जा रही है।",
    missedCheckinPrefix: "🚨 छूटा हुआ सुरक्षा चेक-इन अलर्ट! मैंने सेफ्टीनेट टाइमर पर चेक-इन नहीं किया है। कृपया मुझे तुरंत कॉल करें या सहायता भेजें!",

    // Map Component
    liveGpsTracking: "लाइव जीपीएस ट्रैकिंग",
    locating: "स्थान खोज जारी...",
    accuracySuffix: "सटीकता",
    resolvingAddress: "सड़क का पता खोजा जा रहा है...",
    recenterMap: "मेरे स्थान पर केंद्रित करें",
    shareLiveLocationBtn: "लाइव स्थान लिंक साझा करें",
    safeHavensTitle: "निकटतम सुरक्षित स्थान",
    police: "पुलिस स्टेशन",
    hospital: "अस्पताल",
    pharmacy: "दवा की दुकान",
    linkCopiedAlert: "लाइव गूगल मैप्स स्थान लिंक क्लिपबोर्ड पर कॉपी हो गया!",

    // Chat Component
    chatWelcomeTitle: "🛡️ सेफ्टीनेट एआई सुरक्षा सहायक",
    chatWelcomeText: "मैं आपका 24/7 व्यक्तिगत सुरक्षा विशेषज्ञ हूँ। मैं आपातकालीन स्थितियों, प्राथमिक उपचार, तनाव नियंत्रण और व्यक्तिगत सुरक्षा के लिए तत्काल कदम-दर-कदम मार्गदर्शन प्रदान करता हूँ।\n\nनीचे दिए गए त्वरित प्रश्नों पर टैप करें या अपना प्रश्न लिखें:",
    chipFollowed: "🚶 पीछा किया जा रहा है",
    chipDeescalate: "🛡️ आक्रामकता शांत करें",
    chipBleeding: "🩸 अत्यधिक रक्तस्राव",
    chipCpr: "🫀 सीपीआर (CPR) चरण",
    chipRideshare: "🚗 टैक्सी/सवारी सुरक्षा",
    promptFollowed: "मुझे लगता है कोई मेरा पीछा कर रहा है। मुझे अभी क्या करना चाहिए?",
    promptDeescalate: "किसी आक्रामक अजनबी को कैसे शांत और नियंत्रित करें?",
    promptBleeding: "गंभीर रक्तस्राव के लिए प्राथमिक उपचार",
    promptCpr: "चरण-दर-चरण सीपीआर (CPR) निर्देश",
    promptRideshare: "टैक्सी और राइडशेयर सुरक्षा चेकलिस्ट",
    chatPlaceholder: "सुरक्षा संबंधी आपातकालीन प्रश्न पूछें...",
    analyzingSafety: "सुरक्षा प्रतिक्रिया तैयार की जा रही है...",
    speakBtn: "🔊 बोलकर सुनें",
    copyBtn: "📋 कॉपी करें",
    sourceGemini: "जेमिनी 2.0 फ्लैश (Gemini 2.0)",
    sourceOffline: "इनबिल्ट सुरक्षा ज्ञानकोश",

    // Profile & Medical Component
    tabMedicalCard: "📋 आपातकालीन मेडिकल कार्ड",
    tabSettings: "⚙️ संपर्क और सेटिंग्स",
    medicalIdTitle: "आपातकालीन मेडिकल आईडी",
    firstResponderAccess: "प्राथमिक चिकित्सा कर्मियों के लिए",
    fullName: "पूरा नाम",
    primaryContact: "मुख्य आपातकालीन संपर्क",
    knownAllergies: "ज्ञात एलर्जी",
    medications: "वर्तमान दवाइयाँ",
    criticalNotes: "महत्वपूर्ण मेडिकल नोट्स",
    scanQrTitle: "पूरा मेडिकल और संपर्क विवरण देखने के लिए स्कैन करें",
    scanQrSub: "फोन लॉक होने पर भी ऑफलाइन उपलब्ध",
    personalMedicalDetails: "🩺 व्यक्तिगत मेडिकल विवरण",
    bloodGroup: "रक्त समूह (Blood Group)",
    emergencyHotline: "आपातकालीन हेल्पलाइन नंबर",
    emergencyContactsTitle: "📞 आपातकालीन संपर्क सूची",
    addContact: "+ नया संपर्क जोड़ें",
    primaryTag: "मुख्य",
    setPrimary: "मुख्य बनाएं",
    geminiApiKeyTitle: "🤖 जेमिनी 2.0 फ्लैश एपीआई कुंजी",
    geminiApiKeyDesc: "गहन बातचीत के लिए अपनी गूगल जेमिनी एपीआई कुंजी दर्ज करें। (ऑफलाइन ज्ञानकोश का उपयोग करने के लिए खाली छोड़ें)।",
    saveChanges: "परिवर्तन सहेजें",
    exportBackup: "डेटा बैकअप डाउनलोड करें",
    importBackup: "डेटा बैकअप अपलोड करें",
    saveSuccess: "सेटिंग्स और मेडिकल प्रोफाइल सफलतापूर्वक सहेज लिया गया!",
    promptContactName: "संपर्क का नाम:",
    promptContactPhone: "फोन नंबर (देश कोड सहित):",
    promptContactRel: "संबंध (जैसे: माता-पिता, जीवनसाथी, मित्र):",
    desktopDashboard: "सेफ्टीनेट कमांड सेंटर"
  }
};

class I18nService {
  constructor() {
    this.currentLang = storage.getSettings().language || 'en';
  }

  get lang() {
    return this.currentLang;
  }

  setLanguage(lang) {
    if (lang !== 'en' && lang !== 'hi') return;
    this.currentLang = lang;
    const settings = storage.getSettings();
    storage.saveSettings({ ...settings, language: lang });
    window.dispatchEvent(new CustomEvent('safetynet:language-changed', { detail: { lang } }));
  }

  toggleLanguage() {
    const nextLang = this.currentLang === 'en' ? 'hi' : 'en';
    this.setLanguage(nextLang);
    return nextLang;
  }

  t(key) {
    const dict = translations[this.currentLang] || translations.en;
    return dict[key] || translations.en[key] || key;
  }
}

export const i18n = new I18nService();