// Gemini 2.0 Flash AI Safety Assistant with Dual-Language Smart Offline Engine
import { storage } from './storage.js';
import { i18n } from './i18n.js';

const SYSTEM_INSTRUCTION_EN = `You are SafetyNet AI, an expert, calm, authoritative, and concise personal safety and emergency response specialist.
Provide clear, life-saving, step-by-step action plans for urgent or dangerous situations in English.
Rules:
1. Put critical life-safety action FIRST in bold bullet points.
2. If medical or physical danger is imminent, instruct them to call local emergency services (112/911/999) immediately.
3. Keep answers compact, easy to read in high-stress moments. No fluff.`;

const SYSTEM_INSTRUCTION_HI = `आप सेफ्टीनेट एआई (SafetyNet AI) हैं, जो एक शांत, आधिकारिक और सटीक व्यक्तिगत सुरक्षा और आपातकालीन प्रतिक्रिया विशेषज्ञ हैं।
किसी भी खतरनाक या आपातकालीन स्थिति में तुरंत जीवन रक्षक, चरण-दर-चरण निर्देश शुद्ध और सरल हिन्दी में दें।
नियम:
1. सबसे महत्वपूर्ण सुरक्षा निर्देश को सबसे पहले बोल्ड बुलेट पॉइंट्स में लिखें।
2. यदि तत्काल खतरा है, तो तुरंत 112 या आपातकालीन हेल्पलाइन पर कॉल करने का निर्देश दें।
3. उत्तर संक्षिप्त, स्पष्ट और आसानी से पढ़े जाने योग्य रखें।`;

// Bilingual Offline Safety Knowledge Base
const OFFLINE_KNOWLEDGE_EN = [
  {
    keywords: ['follow', 'followed', 'stalker', 'stalking', 'walking alone', 'someone behind me'],
    title: '🚶‍♂️ If You Suspect You Are Being Followed',
    response: `**DO NOT go home or to an isolated spot.** Follow these immediate survival steps:

1. **Change Pace & Cross the Street**: Cross diagonally or make 4 consecutive right turns. If they do the same, they are definitely following you.
2. **Head to a Lit, Public Place**: Enter an open convenience store, supermarket, restaurant, or hotel lobby immediately.
3. **Make Yourself Visible & Vocal**: Call a friend on speakerphone: *"Hey, I'm right outside Starbucks, see you in 1 minute."*
4. **Project Confidence**: Keep your chin up, scan your surroundings, and walk with purposeful strides.
5. **If Cornered, Make Maximum Noise**: Yell *"FIRE!"* or *"STAY BACK!"* — this attracts far more immediate bystander attention.
6. **Activate SafetyNet SOS**: Use the top Panic Button to broadcast your live GPS to your emergency contacts.`
  },
  {
    keywords: ['de-escalate', 'aggressive', 'stranger', 'angry', 'confrontation', 'fight', 'mugging'],
    title: '🛡️ Safe De-escalation Tactics',
    response: `**Prioritize escaping safely over pride or possessions:**

1. **Give Them Space**: Keep a 6-to-8 foot barrier. Never cross your arms or turn your back completely.
2. **Open Hand Posture**: Keep open palms visible at chest height (the universal calming gesture).
3. **Calm Tone**: Speak in a measured, lower-pitched voice: *"I don't want any trouble, let's keep it calm."*
4. **If Mugged, Comply with Property Demands**: Toss wallet/phone in one direction, then immediately run in the other direction.
5. **Look for Exits**: Always look for your closest escape route rather than locking eye contact.`
  },
  {
    keywords: ['bleeding', 'blood', 'cut', 'wound', 'hemorrhage'],
    title: '🩸 First Aid: Severe Bleeding',
    response: `**CRITICAL: Stop the blood loss immediately!**

1. **Call Emergency Services (112 / 911)** right away.
2. **Direct Hard Pressure**: Press firmly on the wound with a clean cloth or gauze using both hands.
3. **Pack the Wound**: If deep, pack clean cloth tightly into the wound and maintain continuous pressure.
4. **Tourniquet for Limbs**: If bleeding from an arm or leg doesn't stop, apply a tourniquet 2-3 inches ABOVE the wound.
5. **Keep Victim Warm**: Cover with a blanket or jacket to prevent hemorrhagic shock.`
  },
  {
    keywords: ['cpr', 'unconscious', 'fainted', 'not breathing', 'heart attack', 'cardiac'],
    title: '🫀 First Aid: Hands-Only CPR',
    response: `**Act immediately — brain cells begin dying in 4 minutes!**

1. **Check Responsiveness**: Tap shoulders loudly: *"Are you okay?!"*
2. **Call 112 / 911**: Put on speakerphone. Ask bystanders for an AED.
3. **Hand Placement**: Place heel of hand in center of the chest. Interlock other hand.
4. **Push Hard & Fast**:
   - Depth: 2 to 2.4 inches (5-6 cm).
   - Rate: 100-120 beats/min (to the rhythm of *"Stayin' Alive"*).
5. **Do Not Stop**: Continue compressions until medical personnel arrive or person starts breathing.`
  },
  {
    keywords: ['car', 'uber', 'taxi', 'ride', 'rideshare', 'suspicious driver'],
    title: '🚗 Rideshare / Taxi Safety Checklist',
    response: `**Never get into an unverified vehicle:**

1. **Match 3 Details**: License plate, car make/model, and driver face MUST match the app.
2. **Ask "Who are you picking up?"**: Make the driver say your name first.
3. **Sit in the Back Seat**: Creates a safe buffer zone with two door exits.
4. **Share Live Trip**: Use SafetyNet to broadcast your real-time GPS with family.
5. **Check Child Locks**: Test that your door handle opens from the inside before driving off.`
  }
];

const OFFLINE_KNOWLEDGE_HI = [
  {
    keywords: ['पीछा', 'कोई पीछे', 'अकेले', 'follow', 'stalker', 'stalking'],
    title: '🚶‍♂️ यदि कोई आपका पीछा कर रहा हो',
    response: `**घर या किसी सुनसान जगह पर कभी न जाएं!** तुरंत ये कदम उठाएं:

1. **रास्ता बदलें और सड़क पार करें**: 4 बार लगातार दाएं मुड़ें। यदि वह व्यक्ति भी मुड़ता है, तो निश्चित रूप से वह आपका पीछा कर रहा है।
2. **भीड़भाड़ और रोशनी वाली जगह पर जाएं**: तुरंत किसी खुली दुकान, होटल लॉबी, रेस्टोरेंट या पेट्रोल पंप में प्रवेश करें।
3. **लाउडस्पीकर पर फोन कॉल करें**: जोर से कहें: *"हाँ, मैं बस 1 मिनट में पहुँच रहा हूँ।"*
4. **आत्मविश्वास से चलें**: सिर ऊंचा रखें, चारों ओर नजर रखें और तेज कदमों से चलें।
5. **यदि खतरा बढ़े, तो जोर से चिल्लाएं**: "आग! आग!" या "दूर हटो!" चिल्लाएं — यह लोगों का ध्यान तेजी से खींचता है।
6. **सेफ्टीनेट एसओएस (SOS) दबाएं**: अपने लाइव जीपीएस को तुरंत परिवार और संपर्कों को भेजें।`
  },
  {
    keywords: ['शांत', 'अजनबी', 'झगड़ा', 'गुस्सा', 'लड़ाई', 'de-escalate', 'aggressive'],
    title: '🛡️ आक्रामक अजनबी को शांत करने की रणनीति',
    response: `**अहंकार या सामान से अधिक अपनी सुरक्षा और जान को प्राथमिकता दें:**

1. **6 से 8 फीट की दूरी बनाएं**: कभी भी हाथ बांधकर न खड़े हों और पूरी तरह पीठ न मोड़ें।
2. **खुले हाथ सीने की ऊंचाई पर रखें**: यह सार्वभौमिक शांति का संकेत है।
3. **शांत और धीमी आवाज में बोलें**: *"मैं कोई विवाद नहीं चाहता, कृपया शांत रहें।"*
4. **लूटपाट की स्थिति में सामान सौंप दें**: बटुआ या फोन को दूर फेंकें और उल्टी दिशा में दौड़ें।
5. **हमेशा निकलने का रास्ता (Exit) तलाशें**: आंखें लड़ाने के बजाय भागने का सुरक्षित रास्ता देखें।`
  },
  {
    keywords: ['खून', 'रक्त', 'घाव', 'चोट', 'bleeding', 'blood'],
    title: '🩸 प्राथमिक उपचार: गंभीर रक्तस्राव',
    response: `**महत्वपूर्ण: खून के बहाव को तुरंत रोकें!**

1. **तुरंत 112 / आपातकालीन सेवा को कॉल करें।**
2. **सीधा और कड़ा दबाव डालें**: साफ कपड़े या पट्टी से घाव को दोनों हाथों से मजबूती से दबाएं।
3. **पट्टी न हटाएं**: यदि खून बहता रहे, तो ऊपर से और कपड़ा लगाकर लगातार दबाव बनाए रखें।
4. **टूर्निकेट (Tourniquet) का प्रयोग**: हाथ या पैर से अत्यधिक खून बहने पर घाव से 2-3 इंच ऊपर कसकर पट्टी बांधें।
5. **पीड़ित को गर्म रखें**: सदमे (Shock) से बचाने के लिए कंबल या जैकेट से ढकें।`
  },
  {
    keywords: ['सीपीआर', 'cpr', 'बेहोश', 'सांस', 'हार्ट अटैक'],
    title: '🫀 प्राथमिक उपचार: सीपीआर (CPR) तकनीक',
    response: `**तत्काल कार्रवाई करें — मस्तिष्क 4 मिनट में निष्क्रिय होने लगता है!**

1. **जांचें**: कंधे थपथपाएं और जोर से पूछें: *"क्या आप ठीक हैं?!"*
2. **112 पर कॉल करें**: फोन को स्पीकर पर रखें।
3. **हाथ की स्थिति**: सीने के बीच में (छाती की हड्डी के निचले हिस्से पर) हथेली का निचला हिस्सा रखें। दूसरी हथेली को ऊपर फंसाएं।
4. **तेज और गहरा दबाव दें**:
   - गहराई: 2 से 2.4 इंच (5-6 सेमी)।
   - गति: 100 से 120 बार प्रति मिनट।
5. **रुकें नहीं**: जब तक एम्बुलेंस न आए या व्यक्ति सांस न लेने लगे, सीने को दबाते रहें।`
  },
  {
    keywords: ['टैक्सी', 'कार', 'ड्राइवर', 'सवारी', 'uber', 'taxi', 'ride'],
    title: '🚗 टैक्सी और सवारी सुरक्षा चेकलिस्ट',
    response: `**अपुष्ट या संदिग्ध वाहन में कभी न बैठें:**

1. **3 चीजें मिलाएं**: नंबर प्लेट, कार का मॉडल और ड्राइवर का चेहरा ऐप से मेल खाना चाहिए।
2. **ड्राइवर से पूछें "आप किसे लेने आए हैं?"**: पहले अपना नाम न बताएं, ड्राइवर से आपका नाम बोलने को कहें।
3. **हमेशा पिछली सीट पर बैठें**: यह सुरक्षित दूरी और दोनों तरफ के दरवाजों का निकास देता है।
4. **लाइव लोकेशन शेयर करें**: सेफ्टीनेट से अपना लाइव स्थान परिवार को भेजें।
5. **चाइल्ड लॉक जांचें**: गाड़ी चलने से पहले अंदर से दरवाजा खोलकर देखें।`
  }
];

export async function askGemini(prompt, history = []) {
  const settings = storage.getSettings();
  const apiKey = settings.geminiApiKey?.trim();
  const isHi = i18n.lang === 'hi';

  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const systemInstruction = isHi ? SYSTEM_INSTRUCTION_HI : SYSTEM_INSTRUCTION_EN;

      const contents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: isHi ? "समझा। मैं तत्काल, स्पष्ट और जीवन रक्षक सुरक्षा मार्गदर्शन प्रदान करूंगा।" : "Understood. I will provide calm, rapid, life-saving emergency guidance." }] }
      ];

      history.slice(-6).forEach(h => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });

      contents.push({
        role: 'user',
        parts: [{ text: prompt }]
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 650
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return { text: reply, source: 'gemini-2.0-flash' };
        }
      }
    } catch (e) {
      console.warn('Gemini fetch failed, using offline fallback:', e);
    }
  }

  // Offline Engine
  const knowledgeBase = isHi ? OFFLINE_KNOWLEDGE_HI : OFFLINE_KNOWLEDGE_EN;
  const lowerPrompt = prompt.toLowerCase();

  for (const item of knowledgeBase) {
    if (item.keywords.some(k => lowerPrompt.includes(k.toLowerCase()))) {
      return {
        text: `### ${item.title}\n\n${item.response}`,
        source: apiKey ? 'fallback-offline' : 'built-in-safety-engine'
      };
    }
  }

  // Fallback default message
  if (isHi) {
    return {
      text: `### 🚨 सामान्य आपातकालीन सुरक्षा प्रोटोकॉल
यदि आप तत्काल खतरे में हैं:
1. **तुरंत 112 / 100 पर कॉल करें।**
2. **सेफ्टीनेट एसओएस (SOS) बटन दबाएं** ताकि आपकी लाइव जीपीएस लोकेशन आपके प्राथमिक संपर्कों तक पहुंच सके।
3. किसी सुरक्षित, रोशनी वाली या सार्वजनिक जगह की ओर जाएं।
4. आप विशिष्ट प्रश्न पूछ सकते हैं जैसे: *"कोई पीछा कर रहा है"*, *"रक्तस्राव का उपचार"*, *"सीपीआर कैसे दें"*, या *"टैक्सी सुरक्षा"*।`,
      source: 'built-in-safety-engine'
    };
  }

  return {
    text: `### 🚨 General Emergency Protocol
If you are in immediate physical danger:
1. **Call 112 / 911** for emergency dispatch.
2. **Press the SafetyNet SOS button** to broadcast your exact GPS coordinates to your primary contacts.
3. Move toward a well-lit, crowded public area.
4. Try asking specific questions like *"I am being followed"*, *"First aid for bleeding"*, *"CPR steps"*, or *"Rideshare safety"*.`,
    source: 'built-in-safety-engine'
  };
}