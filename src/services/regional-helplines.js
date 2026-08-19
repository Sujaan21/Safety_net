// Regional and State-Wise Emergency Helpline Directory
// Comprehensive database of Pan-India & Northeast State Hotlines (Assam, Meghalaya, etc.)

export const REGIONAL_HELPLINES = {
  national: [
    { title: 'National Emergency Unified Hotline', titleHi: 'अखिल भारतीय आपातकालीन नंबर', number: '112', category: 'Unified', icon: '🚨', desc: 'Police, Fire, Ambulance 24/7' },
    { title: 'National Police Dispatch', titleHi: 'राष्ट्रीय पुलिस नियंत्रण', number: '100', category: 'Police', icon: '👮', desc: 'Immediate police response' },
    { title: 'Women Helpline (National)', titleHi: 'राष्ट्रीय महिला हेल्पलाइन', number: '1091', category: 'Women Safety', icon: '👩', desc: '24/7 Women in distress support' },
    { title: 'National Women Domestic Abuse (NCW)', titleHi: 'महिला सुरक्षा हेल्पलाइन (NCW)', number: '7827170170', category: 'Women Safety', icon: '🛡️', desc: 'National Commission for Women 24/7' },
    { title: 'National Ambulance / Medical Emergency', titleHi: 'राष्ट्रीय एम्बुलेंस सेवा', number: '108', category: 'Medical', icon: '🚑', desc: 'Emergency trauma & medical transport' },
    { title: 'Fire & Rescue Emergency', titleHi: 'अग्निशमन व बचाव सेवा', number: '101', category: 'Fire', icon: '🚒', desc: 'Fire incidents and structural rescue' },
    { title: 'National Cyber Crime Helpline', titleHi: 'साइबर अपराध हेल्पलाइन', number: '1930', category: 'Cyber', icon: '💻', desc: 'Financial fraud & cyber stalking' },
    { title: 'Disaster Management Control (NDRF)', titleHi: 'राष्ट्रीय आपदा प्रबंधन (NDRF)', number: '1078', category: 'Disaster', icon: '🌊', desc: 'Flood, earthquake & cyclone relief' },
    { title: 'Childline Emergency', titleHi: 'चाइल्डलाइन आपातकालीन', number: '1098', category: 'Child', icon: '👶', desc: 'Children in distress & rescue' }
  ],
  states: {
    'Assam': {
      stateName: 'Assam',
      stateNameHi: 'असम',
      region: 'Northeast',
      hotlines: [
        { title: 'Assam Unified Emergency Dispatch', number: '112', icon: '🚨', desc: 'Assam state 24/7 centralized dispatch' },
        { title: 'Assam 181 Women Helpline', number: '181', icon: '👩', desc: 'Statewide 24/7 women emergency line' },
        { title: 'Assam State Disaster Management (ASDMA)', number: '1070', icon: '🌊', desc: 'Disaster, flood & emergency response' },
        { title: 'Guwahati City Police Control Room', number: '03612461556', icon: '👮', desc: 'Guwahati Metropolitan Police' },
        { title: 'Assam Police CID Control', number: '03612464557', icon: '🛡️', desc: 'Crime investigation & serious threat cell' },
        { title: 'Assam Emergency Medical Ambulance (GVK EMRI)', number: '108', icon: '🚑', desc: 'Free emergency ambulance service' }
      ]
    },
    'Meghalaya': {
      stateName: 'Meghalaya',
      stateNameHi: 'मेघालय',
      region: 'Northeast',
      hotlines: [
        { title: 'Meghalaya Unified Emergency', number: '112', icon: '🚨', desc: 'Central emergency response system' },
        { title: 'Meghalaya Women Helpline', number: '181', icon: '👩', desc: 'State women distress & rescue line' },
        { title: 'Shillong Police Control Room', number: '03642222214', icon: '👮', desc: 'East Khasi Hills & Shillong Police' },
        { title: 'Meghalaya Disaster Management', number: '1070', icon: '🌊', desc: 'Landslide & weather emergency' },
        { title: 'Meghalaya Emergency Ambulance', number: '108', icon: '🚑', desc: 'Statewide 108 trauma ambulance' }
      ]
    },
    'Manipur': {
      stateName: 'Manipur',
      stateNameHi: 'मणिपुर',
      region: 'Northeast',
      hotlines: [
        { title: 'Manipur Emergency Response', number: '112', icon: '🚨', desc: 'State unified emergency response' },
        { title: 'Manipur Women Helpline', number: '181', icon: '👩', desc: 'Women safety & crisis intervention' },
        { title: 'Imphal West Police Control Room', number: '03852450000', icon: '👮', desc: 'Imphal city police control' },
        { title: 'Manipur State Disaster Helpline', number: '1070', icon: '🌊', desc: 'Disaster management authority' }
      ]
    },
    'Nagaland': {
      stateName: 'Nagaland',
      stateNameHi: 'नागालैंड',
      region: 'Northeast',
      hotlines: [
        { title: 'Nagaland Unified Emergency', number: '112', icon: '🚨', desc: 'Police, Fire, Ambulance' },
        { title: 'Nagaland Women Helpline', number: '181', icon: '👩', desc: 'Statewide women support center' },
        { title: 'Kohima Police Control Room', number: '03702244279', icon: '👮', desc: 'Kohima police emergency line' },
        { title: 'Dimapur Police Control Room', number: '03862228400', icon: '👮', desc: 'Dimapur urban police control' },
        { title: 'Nagaland State Disaster Management', number: '1070', icon: '🌊', desc: 'NSDMA emergency operations' }
      ]
    },
    'Arunachal Pradesh': {
      stateName: 'Arunachal Pradesh',
      stateNameHi: 'अरुणाचल प्रदेश',
      region: 'Northeast',
      hotlines: [
        { title: 'Arunachal Emergency System', number: '112', icon: '🚨', desc: 'State unified emergency line' },
        { title: 'Arunachal Women Helpline', number: '181', icon: '👩', desc: 'Women & child safety cell' },
        { title: 'Itanagar Police Control Room', number: '03602212377', icon: '👮', desc: 'Capital complex police' },
        { title: 'State Disaster Management Authority', number: '1070', icon: '🌊', desc: 'Monsoon & landslide emergency' }
      ]
    },
    'Tripura': {
      stateName: 'Tripura',
      stateNameHi: 'त्रिपुरा',
      region: 'Northeast',
      hotlines: [
        { title: 'Tripura Unified Emergency', number: '112', icon: '🚨', desc: 'All-in-one emergency dispatch' },
        { title: 'Tripura Women Helpline', number: '181', icon: '👩', desc: 'Women crisis support' },
        { title: 'Agartala Police Control Room', number: '03812325858', icon: '👮', desc: 'West Tripura & Agartala police' },
        { title: 'Tripura Disaster Management', number: '1070', icon: '🌊', desc: 'State emergency operations' }
      ]
    },
    'Mizoram': {
      stateName: 'Mizoram',
      stateNameHi: 'मिज़ोरम',
      region: 'Northeast',
      hotlines: [
        { title: 'Mizoram Unified Emergency', number: '112', icon: '🚨', desc: 'Unified emergency response' },
        { title: 'Mizoram Women Helpline', number: '181', icon: '👩', desc: 'State women support network' },
        { title: 'Aizawl Police Control Room', number: '03892322375', icon: '👮', desc: 'Aizawl city police headquarters' },
        { title: 'Mizoram Disaster Management', number: '1070', icon: '🌊', desc: 'Landslide & cyclone emergency' }
      ]
    },
    'Sikkim': {
      stateName: 'Sikkim',
      stateNameHi: 'सिक्किम',
      region: 'Northeast',
      hotlines: [
        { title: 'Sikkim Unified Emergency', number: '112', icon: '🚨', desc: 'State emergency service' },
        { title: 'Sikkim Women Helpline', number: '181', icon: '👩', desc: '24/7 Women distress support' },
        { title: 'Gangtok Police Control Room', number: '03592202022', icon: '👮', desc: 'East Sikkim police control' },
        { title: 'Sikkim State Disaster Authority', number: '1070', icon: '🌊', desc: 'Mountain & flash flood relief' }
      ]
    },
    'Delhi NCR': {
      stateName: 'Delhi NCR',
      stateNameHi: 'दिल्ली एनसीआर',
      region: 'North',
      hotlines: [
        { title: 'Delhi Unified Emergency', number: '112', icon: '🚨', desc: 'Centralized emergency response' },
        { title: 'Delhi Police Women Helpline', number: '1091', icon: '👩', desc: 'Delhi Police special women cell' },
        { title: 'Delhi Commission for Women (DCW)', number: '181', icon: '🛡️', desc: '24/7 Mobile helpline for women' },
        { title: 'Delhi Anti-Stalking Helpline', number: '1096', icon: '⚠️', desc: 'Harassment & cyber-stalking' },
        { title: 'Delhi Senior Citizen Helpline', number: '1291', icon: '👴', desc: 'Elderly assistance & safety' }
      ]
    },
    'Maharashtra': {
      stateName: 'Maharashtra',
      stateNameHi: 'महाराष्ट्र',
      region: 'West',
      hotlines: [
        { title: 'Maharashtra Unified Emergency', number: '112', icon: '🚨', desc: 'Police, Fire, Medical' },
        { title: 'Mumbai Police Control Room', number: '02222621855', icon: '👮', desc: 'Mumbai city police headquarters' },
        { title: 'Maharashtra Women Helpline', number: '181', icon: '👩', desc: 'State women assistance' },
        { title: 'Maharashtra Emergency Ambulance', number: '108', icon: '🚑', desc: '24/7 Free medical emergency' }
      ]
    },
    'Karnataka': {
      stateName: 'Karnataka',
      stateNameHi: 'कर्नाटक',
      region: 'South',
      hotlines: [
        { title: 'Karnataka Unified Emergency', number: '112', icon: '🚨', desc: 'State emergency system' },
        { title: 'Bengaluru Police Control Room', number: '08022942222', icon: '👮', desc: 'Bengaluru city police' },
        { title: 'Vanitha Sahayavani (Women Helpline)', number: '08022943225', icon: '👩', desc: 'Bengaluru women crisis wing' }
      ]
    },
    'West Bengal': {
      stateName: 'West Bengal',
      stateNameHi: 'पश्चिम बंगाल',
      region: 'East',
      hotlines: [
        { title: 'West Bengal Emergency', number: '112', icon: '🚨', desc: 'Unified emergency response' },
        { title: 'Kolkata Police Control Room', number: '03322143024', icon: '👮', desc: 'Lalbazar central control' },
        { title: 'West Bengal Women Helpline', number: '181', icon: '👩', desc: 'State women assistance' }
      ]
    }
  }
};

class RegionalHelplinesService {
  getAvailableStates() {
    return Object.keys(REGIONAL_HELPLINES.states);
  }

  getNortheastStates() {
    return Object.entries(REGIONAL_HELPLINES.states)
      .filter(([_, data]) => data.region === 'Northeast')
      .map(([name]) => name);
  }

  getStateHelplines(stateName) {
    return REGIONAL_HELPLINES.states[stateName]?.hotlines || [];
  }

  getNationalHelplines() {
    return REGIONAL_HELPLINES.national;
  }

  detectStateFromAddress(addressString = '') {
    if (!addressString) return 'Assam'; // Default Northeast spotlight
    const normalized = addressString.toLowerCase();
    
    for (const state of Object.keys(REGIONAL_HELPLINES.states)) {
      if (normalized.includes(state.toLowerCase())) {
        return state;
      }
    }
    return 'Assam';
  }
}

export const regionalHelplines = new RegionalHelplinesService();
