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
    navMedical: "Medical & Vault",

    // Auth Strings
    authLoginTitle: "Welcome Back",
    authSignupTitle: "Create Sentinel ID",
    authSubtitle: "Your decentralized identity for emergency telemetry and zero-knowledge health records.",
    authLoginBtn: "Log In",
    authSignupBtn: "Sign Up",
    authEmailOrPhone: "Email or Phone Number",
    authPassword: "Password",
    authSubmitLogin: "Log In to Dashboard",
    authSubmitSignup: "Create Account & Start Protection",
    authDemoLogin: "1-Tap Demo Evaluator Login",
    logout: "Log Out",

    // SOS Component
    sosTitle: "EMERGENCY SOS",
    sosSubtitle: "Tap or Hold 1.5s",
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
    missedCheckinPrefix: "🚨 MISSED SAFETY CHECK-IN ALERT! I failed to check in on my SafetyNet timer. Please call me or send help immediately!",

    // Map Component
    liveGpsTracking: "Live GPS Tracking",
    locating: "Locating...",
    accuracySuffix: "accuracy",
    resolvingAddress: "Resolving street address...",
    recenterMap: "Recenter on Me",
    shareLiveLocationBtn: "Share Live Location Link",
    safeHavensTitle: "Nearby Safe Havens",
    police: "Police",
    hospital: "Hospital",
    pharmacy: "Pharmacy",
    linkCopiedAlert: "Live Google Maps location link copied to clipboard!",

    // Chat Component
    chatWelcomeTitle: "🛡️ SafetyNet AI Safety Companion",
    chatWelcomeText: "I am your 24/7 personal safety specialist. I provide immediate, step-by-step guidance for emergency situations, first aid, de-escalation, and personal protection.\n\nTap a quick scenario below or ask any emergency question:",
    chipFollowed: "🚶 Being Followed",
    chipDeescalate: "🛡️ De-escalate",
    chipBleeding: "🩸 Severe Bleeding",
    chipCpr: "🫀 CPR Steps",
    chipRideshare: "🚗 Rideshare Safety",
    promptFollowed: "I think someone is following me. What should I do right now?",
    promptDeescalate: "How do I safely de-escalate an aggressive stranger?",
    promptBleeding: "First aid protocol for severe bleeding",
    promptCpr: "Step-by-step Hands-Only CPR instructions",
    promptRideshare: "Rideshare and taxi safety checklist",
    chatPlaceholder: "Ask any emergency or safety question...",
    analyzingSafety: "Formulating emergency response...",
    speakBtn: "🔊 Speak",
    copyBtn: "📋 Copy",
    sourceGemini: "Gemini 2.0 Flash",
    sourceOffline: "Offline Safety Engine",

    // Profile & Medical Component
    tabMedicalCard: "📋 Emergency Medical ID",
    tabSettings: "⚙️ Contacts & Vault",
    medicalIdTitle: "Emergency Medical ID",
    firstResponderAccess: "First Responder View",
    fullName: "Full Name",
    primaryContact: "Primary Emergency Contact",
    knownAllergies: "Known Allergies",
    medications: "Current Medications",
    criticalNotes: "Critical Medical Notes",
    scanQrTitle: "Scan for Complete Emergency & Medical Profile",
    scanQrSub: "Accessible offline by paramedics & first responders",
    personalMedicalDetails: "🩺 Medical Details",
    bloodGroup: "Blood Group",
    emergencyHotline: "Emergency Dispatch Number",
    emergencyContactsTitle: "📞 Emergency Contacts",
    addContact: "+ Add Contact",
    primaryTag: "PRIMARY",
    setPrimary: "Make Primary",
    geminiApiKeyTitle: "🤖 Google Gemini 2.0 Flash API Key",
    geminiApiKeyDesc: "Enter your Gemini API key for deep conversational intelligence. (Leave empty to use built-in offline emergency knowledge).",
    saveChanges: "Save Changes",
    exportBackup: "Export Vault Backup (JSON)",
    importBackup: "Import Vault Backup (JSON)",
    saveSuccess: "Settings & Medical Profile Saved Successfully!",
    promptContactName: "Contact Name:",
    promptContactPhone: "Contact Phone Number (with country code):",
    promptContactRel: "Relationship (e.g. Spouse, Parent, Friend):",
    desktopDashboard: "SafetyNet Command Center",

    // Security & Cryptography Vault
    securityVault: "🔐 Zero-Knowledge Security Vault",
    securityVaultDesc: "Protect your emergency data and API keys with military-grade AES-256-GCM encryption.",
    vaultLocked: "Vault Locked",
    vaultUnlocked: "Vault Unlocked",
    enterPin: "Enter 4-6 Digit Security PIN",
    setPin: "Set Master Security PIN",
    removePin: "Disable PIN Protection",
    duressPinTitle: "🎭 Duress / Silent SOS PIN",
    duressPinDesc: "Entering this secondary PIN displays a normal decoy screen while silently broadcasting emergency distress beacons in the background.",
    autoLockTitle: "Auto-Lock on App Background / Minimized",
    lockVaultNow: "Lock Vault Now",
    unlockVaultNow: "Unlock Vault",
    invalidPin: "Incorrect PIN. Access Denied.",
    camouflageMode: "Stealth Disguise Mode (Calculator)",
    pinSetSuccess: "Zero-Knowledge Encryption Vault Enabled!"
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
    navMedical: "मेडिकल व वॉल्ट",

    // Auth Strings
    authLoginTitle: "लॉग इन करें",
    authSignupTitle: "खाता बनाएं",
    authSubtitle: "आपातकालीन टेलीमेट्री और शून्य-ज्ञान स्वास्थ्य रिकॉर्ड के लिए आपका व्यक्तिगत सुरक्षा खाता।",
    authLoginBtn: "लॉग इन",
    authSignupBtn: "साइन अप",
    authEmailOrPhone: "ईमेल या फोन नंबर",
    authPassword: "पासवर्ड",
    authSubmitLogin: "डैशबोर्ड में प्रवेश करें",
    authSubmitSignup: "खाता बनाएं व सुरक्षा शुरू करें",
    authDemoLogin: "⚡ 1-क्लिक डेमो परीक्षक लॉगिन",
    logout: "लॉग आउट",

    // SOS Component
    sosTitle: "आपातकालीन एसओएस",
    sosSubtitle: "दबाएं या 1.5 सेकंड तक दबाए रखें",
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
    tabSettings: "⚙️ संपर्क और सुरक्षा वॉल्ट",
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
    desktopDashboard: "सेफ्टीनेट कमांड सेंटर",

    // Security & Cryptography Vault
    securityVault: "🔐 ज़ीरो-नॉलेज सुरक्षा वॉल्ट",
    securityVaultDesc: "अपने मेडिकल डेटा और सेटिंग्स को AES-256-GCM मिलिट्री-ग्रेड एन्क्रिप्शन से सुरक्षित करें।",
    vaultLocked: "वॉल्ट लॉक है",
    vaultUnlocked: "वॉल्ट अनलॉक है",
    enterPin: "4-6 अंकों का सुरक्षा पिन दर्ज करें",
    setPin: "मास्टर सुरक्षा पिन सेट करें",
    removePin: "पिन सुरक्षा हटाएं",
    duressPinTitle: "🎭 ड्रेस / गुप्त पिन (शांत एसओएस)",
    duressPinDesc: "यह पिन डालने पर सामान्य स्क्रीन दिखती है परंतु बैकग्राउंड में तुरंत शांत आपातकालीन एसओएस सिग्नल चला जाता है।",
    autoLockTitle: "ऐप बैकग्राउंड होने पर स्वतः लॉक करें",
    lockVaultNow: "वॉल्ट लॉक करें",
    unlockVaultNow: "वॉल्ट अनलॉक करें",
    invalidPin: "गलत पिन। प्रवेश अस्वीकृत।",
    camouflageMode: "गुप्त कैलकुलेटर मोड",
    pinSetSuccess: "सुरक्षा पिन और एन्क्रिप्टेड वॉल्ट सक्रिय हो गया!"
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
