// Tamil Nadu Tamil History & Archaeology Data (2021-2026)
// Source: Research February 2026

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface HistoryScheme {
  id: string;
  name: { en: string; ta: string };
  description: { en: string; ta: string };
  launchDate?: string;
  beneficiaries: {
    count: string;
    description: { en: string; ta: string };
  };
  budget?: {
    amount: string;
    year?: string;
    details?: string;
  };
  highlights?: { en: string; ta: string }[];
  icon: string;
  sources?: SchemeSource[];
}

export const historySchemes: HistoryScheme[] = [
  {
    id: "karl-marx-statue",
    name: {
      en: "Karl Marx Statue - Connemara Library",
      ta: "கார்ல் மார்க்ஸ் சிலை - கான்னிமாரா நூலகம்",
    },
    description: {
      en: "Commanding statue of Karl Marx unveiled at Connemara Public Library, Chennai. 'Installing Marx. Uninstalling inequality. Chennai reaffirms red.'",
      ta: "சென்னை கான்னிமாரா பொது நூலகத்தில் கார்ல் மார்க்ஸ் சிலை திறப்பு.",
    },
    launchDate: "February 6, 2026",
    beneficiaries: {
      count: "Public monument",
      description: {
        en: "Heritage site at Connemara Library",
        ta: "கான்னிமாரா நூலகத்தில் பாரம்பரிய தளம்",
      },
    },
    highlights: [
      { en: "Unveiled by CM MK Stalin", ta: "முதலமைச்சர் மு.க.ஸ்டாலின் திறந்து வைத்தார்" },
      { en: "Located at Connemara Public Library", ta: "கான்னிமாரா பொது நூலகத்தில்" },
      { en: "First major Marx statue in Chennai", ta: "சென்னையின் முதல் மார்க்ஸ் சிலை" },
    ],
    icon: "🗽",
    sources: [
      { title: "CM Twitter", url: "https://fxtwitter.com/mkstalin/status/2019653868607664532", type: "government" },
    ],
  },
  {
    id: "john-marshall-statue",
    name: {
      en: "Sir John Marshall Statue - Egmore Museum",
      ta: "சர் ஜான் மார்ஷல் சிலை - எழும்பூர் அருங்காட்சியகம்",
    },
    description: {
      en: "Statue of Sir John Marshall, former Director-General of ASI who discovered and announced the Indus Valley Civilisation, unveiled at Chennai Egmore Museum Complex on his birth anniversary.",
      ta: "சிந்துவெளி நாகரிகத்தை கண்டறிந்த ASI முன்னாள் இயக்குநர் சர் ஜான் மார்ஷல் சிலை.",
    },
    launchDate: "March 19, 2025",
    beneficiaries: {
      count: "Public monument",
      description: {
        en: "At Chennai Egmore Museum Complex",
        ta: "சென்னை எழும்பூர் அருங்காட்சியக வளாகத்தில்",
      },
    },
    highlights: [
      { en: "Unveiled on Marshall's birth anniversary", ta: "மார்ஷல் பிறந்தநாளில் திறப்பு" },
      { en: "Discoverer of Indus Valley Civilisation", ta: "சிந்துவெளி நாகரிகத்தின் கண்டுபிடிப்பாளர்" },
      { en: "100 years since IVC announcement (1924)", ta: "IVC அறிவிப்பின் 100 ஆண்டுகள்" },
    ],
    icon: "🏛️",
    sources: [
      { title: "CM Twitter", url: "https://fxtwitter.com/mkstalin/status/1902247349856170170", type: "government" },
    ],
  },
  {
    id: "periyar-library-coimbatore",
    name: {
      en: "Periyar Arivulagam (Library & Science Center)",
      ta: "பெரியார் அறிவாலயம் (நூலகம் & அறிவியல் மையம்)",
    },
    description: {
      en: "Massive 8-floor, 1,98,000 sq ft library and science center in Coimbatore with ₹301 crore investment. Features planetarium, STEM exhibit, auditorium, and 1.2 lakh books.",
      ta: "கோயம்புத்தூரில் 8 தளங்கள், 1,98,000 சதுர அடி நூலகம் & அறிவியல் மையம், ₹301 கோடி முதலீடு. கோளரங்கம், STEM கண்காட்சி, அரங்கம், 1.2 லட்சம் புத்தகங்கள்.",
    },
    launchDate: "Foundation: November 2024, Opening: February 2026",
    beneficiaries: {
      count: "Public facility",
      description: {
        en: "8-floor facility at Anupparlayam, Coimbatore North",
        ta: "அனுப்பர்லையம், கோயம்புத்தூர் வடக்கில் 8-தள வசதி",
      },
    },
    budget: {
      amount: "₹301 crore",
      details: "Largest public library complex in Tamil Nadu",
    },
    highlights: [
      { en: "8 floors, 1,98,000 sq ft on 6.98 acres", ta: "8 தளங்கள், 1,98,000 சதுர அடி, 6.98 ஏக்கர்" },
      { en: "Planetarium, STEM exhibit, children's library", ta: "கோளரங்கம், STEM கண்காட்சி, குழந்தைகள் நூலகம்" },
      { en: "1.2 lakh books capacity", ta: "1.2 லட்சம் புத்தகங்கள் திறன்" },
    ],
    icon: "📚",
    sources: [
      { title: "Deccan Herald", url: "https://www.deccanherald.com/india/tamil-nadu/tamil-nadu-cm-m-k-stalin-lays-foundation-stone-for-rs-300-crore-periyar-library-science-centre-3264388", type: "media" },
    ],
  },
  {
    id: "keezhadi",
    name: {
      en: "Keezhadi Excavations & Museum",
      ta: "கீழடி அகழாய்வு & அருங்காட்சியகம்",
    },
    description: {
      en: "Archaeological excavations revealing 6th century BCE Tamil civilization with urban settlement, drainage systems, and Tamili inscriptions.",
      ta: "கி.மு. 6ஆம் நூற்றாண்டு தமிழ் நாகரிகத்தை வெளிப்படுத்தும் தொல்லியல் அகழாய்வு - நகர குடியிருப்பு, வடிகால் அமைப்பு, தமிழி கல்வெட்டுகள்.",
    },
    launchDate: "Museum: March 2023",
    beneficiaries: {
      count: "10 excavation phases",
      description: {
        en: "Phase 10 completed June 2024",
        ta: "பேஸ் 10 ஜூன் 2024 நிறைவு",
      },
    },
    budget: {
      amount: "₹35.42 crore",
      details: "Museum ₹18.42 cr + Open-Air ₹17 cr",
    },
    highlights: [
      { en: "Dating confirmed to 580 BCE", ta: "கி.மு. 580 தேதி உறுதி" },
      { en: "Heritage Museum opened March 2023", ta: "பாரம்பரிய அருங்காட்சியகம் மார்ச் 2023 திறப்பு" },
      { en: "Open-Air Museum foundation Jan 2025", ta: "திறந்தவெளி அருங்காட்சியகம் அஸ்திவாரம் ஜன 2025" },
    ],
    icon: "🏛️",
    sources: [
      { title: "Keeladi Museum", url: "https://www.keeladimuseum.tn.gov.in/", type: "government" },
      { title: "Archaeology Policy Note", url: "https://cms.tn.gov.in/sites/default/files/documents/archaeology_e_pn_2024_25.pdf", type: "government" },
    ],
  },
  {
    id: "porunai-museum",
    name: {
      en: "Porunai Archaeological Museum",
      ta: "பொருநை தொல்லியல் அருங்காட்சியகம்",
    },
    description: {
      en: "State-of-the-art archaeological museum showcasing Tamil civilization artifacts from Sivagalai, Adichanallur, Thulukkarpatti and Korkai. Features digital technology, immersive displays, and well-curated galleries.",
      ta: "சிவகலை, ஆதிச்சநல்லூர், துளுக்கர்பட்டி, கொற்கை ஆகிய இடங்களிலிருந்து தமிழ் நாகரிக தொல்பொருட்களை காட்சிப்படுத்தும் நவீன தொல்லியல் அருங்காட்சியகம்.",
    },
    launchDate: "December 20, 2025",
    beneficiaries: {
      count: "Public facility",
      description: {
        en: "13-acre museum complex at Reddiarpatti, Tirunelveli",
        ta: "திருநெல்வேலி ரெட்டியார்பட்டியில் 13 ஏக்கர் அருங்காட்சியக வளாகம்",
      },
    },
    budget: {
      amount: "₹62 crore",
      details: "Preserving Thamiraparani River basin heritage",
    },
    highlights: [
      { en: "Inaugurated by CM MK Stalin", ta: "முதலமைச்சர் மு.க.ஸ்டாலின் திறந்து வைத்தார்" },
      { en: "13 acres with digital displays", ta: "13 ஏக்கர், டிஜிட்டல் காட்சிகள்" },
      { en: "Public opening: December 23, 2025", ta: "பொது திறப்பு: டிசம்பர் 23, 2025" },
    ],
    icon: "🏛️",
    sources: [
      { title: "India Herald", url: "https://www.indiaherald.com/Breaking/Read/994869341/Porunai-Museum-Inaugurated-in-Tirunelveli-at-a-Cost-of-Crore-to-Showcase-the-Ancient-Legacy-of-Tamils-Chief-Minister-M-K-Stalin", type: "media" },
    ],
  },
  {
    id: "porunai",
    name: {
      en: "Porunai (Thamiraparani) Civilization",
      ta: "பொருநை (தாமிரபரணி) நாகரிகம்",
    },
    description: {
      en: "Excavations along Thamiraparani River revealing 3,200-year-old civilization with rice grains dated to 1155 BCE.",
      ta: "தாமிரபரணி நதியோரம் 3,200 ஆண்டு பழமையான நாகரிகம் - கி.மு. 1155 அரிசி தானியங்கள்.",
    },
    launchDate: "September 2021",
    beneficiaries: {
      count: "Multiple sites",
      description: {
        en: "Adichanallur, Sivakalai, Korkai, Thulukkarpatti",
        ta: "ஆதிச்சநல்லூர், சிவகலை, கொற்கை, துளுக்கர்பட்டி",
      },
    },
    budget: {
      amount: "₹67.25 crore",
      details: "Excavation & research funding",
    },
    highlights: [
      { en: "Rice grains dated 1155 BCE (Beta Analytics)", ta: "அரிசி தானியங்கள் கி.மு. 1155 (பீட்டா அனலிட்டிக்ஸ்)" },
      { en: "Silver coins prove ancient commerce", ta: "வெள்ளி நாணயங்கள் பண்டைய வணிகத்தை நிரூபிக்கின்றன" },
      { en: "3,200 years of Tamil civilization", ta: "3,200 ஆண்டு தமிழ் நாகரிகம்" },
    ],
    icon: "⚱️",
    sources: [
      { title: "TN Archaeology Dept", url: "https://tnarch.gov.in/", type: "government" },
    ],
  },
  {
    id: "mayiladumparai",
    name: {
      en: "Mayiladumparai Iron Age Discovery",
      ta: "மயிலாடும்பாறை இரும்பு யுக கண்டுபிடிப்பு",
    },
    description: {
      en: "Excavations proving Iron Age in Tamil Nadu began 5,300 years ago (3345 BCE) - oldest in India.",
      ta: "தமிழ்நாட்டில் இரும்பு யுகம் 5,300 ஆண்டுகளுக்கு முன்பு (கி.மு. 3345) தொடங்கியது என்று நிரூபிக்கும் அகழாய்வு - இந்தியாவில் மிகப்பழமையானது.",
    },
    launchDate: "January 2025",
    beneficiaries: {
      count: "Research breakthrough",
      description: {
        en: "Krishnagiri District",
        ta: "கிருஷ்ணகிரி மாவட்டம்",
      },
    },
    budget: {
      amount: "State-funded",
      details: "Multi-lab verification",
    },
    highlights: [
      { en: "Iron Age dated to 3345 BCE (5,300 years)", ta: "இரும்பு யுகம் கி.மு. 3345 (5,300 ஆண்டுகள்)" },
      { en: "Verified by Beta Analytics, BSIP, PRL", ta: "பீட்டா அனலிட்டிக்ஸ், BSIP, PRL மூலம் சரிபார்க்கப்பட்டது" },
      { en: "Rock paintings & Neolithic artifacts", ta: "பாறை ஓவியங்கள் & நியோலிதிக் தொல்பொருட்கள்" },
    ],
    icon: "⛏️",
    sources: [
      { title: "TN Archaeology Dept", url: "https://tnarch.gov.in/", type: "government" },
      { title: "Oldest Iron Age Site Discovery", url: "https://www.thenewsminute.com/article/mayiladumparai-indias-oldest-iron-age-site-discovered-tamil-nadu-163789", type: "media" },
    ],
  },
  {
    id: "adichanallur",
    name: {
      en: "Adichanallur Iconic Site Museum",
      ta: "ஆதிச்சநல்லூர் சின்னமான அருங்காட்சியகம்",
    },
    description: {
      en: "India's first In-Situ Museum at Iron Age burial site. One of 5 'Iconic Archaeological Sites' in India.",
      ta: "இரும்பு யுக புதைகுழியில் இந்தியாவின் முதல் இன்-சிட்டு அருங்காட்சியகம். இந்தியாவின் 5 'சின்னமான தொல்லியல் தளங்களில்' ஒன்று.",
    },
    launchDate: "Foundation: Aug 2023",
    beneficiaries: {
      count: "169+ burial urns",
      description: {
        en: "Gold ornaments found",
        ta: "தங்க நகைகள் கண்டுபிடிப்பு",
      },
    },
    budget: {
      amount: "Union-funded",
      details: "Iconic Sites scheme",
    },
    highlights: [
      { en: "First gold excavation in Tamil Nadu", ta: "தமிழ்நாட்டில் முதல் தங்க அகழாய்வு" },
      { en: "In-situ museum with glass viewing", ta: "கண்ணாடி பார்வையுடன் இன்-சிட்டு அருங்காட்சியகம்" },
      { en: "Sand mining ban to protect site", ta: "தளத்தை பாதுகாக்க மணல் குவாரி தடை" },
    ],
    icon: "🏺",
    sources: [
      { title: "TN Archaeology Dept", url: "https://tnarch.gov.in/", type: "government" },
      { title: "ASI Site Museum Work", url: "https://www.thenewsminute.com/article/asi-begins-work-site-museum-adichanallur-tamil-nadu-156321", type: "media" },
    ],
  },
  {
    id: "harappan-research",
    name: {
      en: "Indus Script Decipherment Prize",
      ta: "சிந்து எழுத்து விடுவிப்பு பரிசு",
    },
    description: {
      en: "$1 million global prize for deciphering Indus Valley script. Research shows 60% sign match with Tamil Nadu ceramics.",
      ta: "சிந்து சமவெளி எழுத்தை விடுவிக்க $1 மில்லியன் உலகளாவிய பரிசு. தமிழ்நாடு மட்பாண்டங்களுடன் 60% அடையாள பொருத்தம்.",
    },
    launchDate: "January 2024",
    beneficiaries: {
      count: "Global scholars",
      description: {
        en: "International researchers eligible",
        ta: "சர்வதேச ஆராய்ச்சியாளர்கள் தகுதியானவர்கள்",
      },
    },
    budget: {
      amount: "$1 million (₹8 crore)",
      details: "Prize money",
    },
    highlights: [
      { en: "60% sign match with TN ceramics", ta: "தமிழ்நாடு மட்பாண்டங்களுடன் 60% பொருத்தம்" },
      { en: "14,000+ ceramic sherds compared", ta: "14,000+ மண்பாண்ட துண்டுகள் ஒப்பிடப்பட்டன" },
      { en: "AI & machine learning employed", ta: "AI & இயந்திர கற்றல் பயன்படுத்தப்படுகிறது" },
    ],
    icon: "📜",
    sources: [
      { title: "TN Archaeology Dept", url: "https://tnarch.gov.in/", type: "government" },
      { title: "Keeladi-Indus Link Research", url: "https://www.indiatoday.in/science/story/keeladi-excavations-establish-link-between-tamil-nadu-indus-valley-civilization-1601270-2019-09-20", type: "media" },
    ],
  },
  {
    id: "archaeology-dept",
    name: {
      en: "State Archaeology Department Expansion",
      ta: "மாநில தொல்லியல் துறை விரிவாக்கம்",
    },
    description: {
      en: "Major expansion of Tamil Nadu State Archaeology Department with new staff and equipment.",
      ta: "புதிய ஊழியர்கள் மற்றும் உபகரணங்களுடன் தமிழ்நாடு மாநில தொல்லியல் துறையின் பெரிய விரிவாக்கம்.",
    },
    launchDate: "2021-2026",
    beneficiaries: {
      count: "100+ new positions",
      description: {
        en: "Archaeologists, conservators",
        ta: "தொல்லியல் வல்லுநர்கள், பாதுகாப்பாளர்கள்",
      },
    },
    budget: {
      amount: "₹50+ crore",
      year: "Annual budget increase",
    },
    highlights: [
      { en: "Budget increased 3x since 2021", ta: "2021 முதல் பட்ஜெட் 3 மடங்கு அதிகரிப்பு" },
      { en: "New excavation equipment", ta: "புதிய அகழாய்வு உபகரணங்கள்" },
      { en: "Carbon dating facilities", ta: "கார்பன் தேதி வசதிகள்" },
    ],
    icon: "🔬",
    sources: [
      { title: "TN Archaeology Dept", url: "https://www.tn.gov.in/detail_contact/1810/4", type: "government" },
      { title: "Policy Note 2024-25", url: "https://cms.tn.gov.in/sites/default/files/documents/archaeology_e_pn_2024_25.pdf", type: "government" },
    ],
  },
  {
    id: "tamil-museum",
    name: {
      en: "Tamil Heritage Museums",
      ta: "தமிழ் பாரம்பரிய அருங்காட்சியகங்கள்",
    },
    description: {
      en: "New museums and upgrades to existing facilities showcasing Tamil history and culture.",
      ta: "தமிழ் வரலாறு மற்றும் கலாச்சாரத்தை காட்சிப்படுத்தும் புதிய அருங்காட்சியகங்கள் மற்றும் தற்போதுள்ள வசதிகளின் மேம்பாடுகள்.",
    },
    beneficiaries: {
      count: "Multiple museums",
      description: {
        en: "Across Tamil Nadu",
        ta: "தமிழ்நாடு முழுவதும்",
      },
    },
    budget: {
      amount: "₹100+ crore",
      details: "Museum infrastructure",
    },
    highlights: [
      { en: "Keezhadi site museum", ta: "கீழடி இட அருங்காட்சியகம்" },
      { en: "Government Museum Chennai upgrades", ta: "அரசு அருங்காட்சியகம் சென்னை மேம்பாடுகள்" },
      { en: "Digital archives initiative", ta: "டிஜிட்டல் காப்பக முன்முயற்சி" },
    ],
    icon: "🏛️",
    sources: [
      { title: "TN Archaeology Dept", url: "https://tnarch.gov.in/", type: "government" },
      { title: "CM Inaugurates Keeladi Museum", url: "https://www.thehindu.com/news/national/tamil-nadu/cm-stalin-inaugurates-keeladi-museum/article66583210.ece", type: "media" },
    ],
  },
  {
    id: "sangam-literature",
    name: {
      en: "Sangam Literature Digitization",
      ta: "சங்க இலக்கியம் டிஜிட்டல் மயமாக்கல்",
    },
    description: {
      en: "Project to digitize and preserve ancient Sangam Tamil literature for global access.",
      ta: "உலகளாவிய அணுகலுக்காக பண்டைய சங்க தமிழ் இலக்கியத்தை டிஜிட்டல் மயமாக்கி பாதுகாக்கும் திட்டம்.",
    },
    beneficiaries: {
      count: "2,381 poems",
      description: {
        en: "Sangam corpus preserved",
        ta: "சங்க தொகுப்பு பாதுகாப்பு",
      },
    },
    budget: {
      amount: "State-funded",
      details: "TNTDPC project",
    },
    highlights: [
      { en: "Free online access", ta: "இலவச ஆன்லைன் அணுகல்" },
      { en: "Multi-language translations", ta: "பல மொழி மொழிபெயர்ப்புகள்" },
      { en: "Audio renditions available", ta: "ஒலி வடிவங்கள் கிடைக்கும்" },
    ],
    icon: "📚",
    sources: [
      { title: "TN Archaeology Dept", url: "https://tnarch.gov.in/", type: "government" },
      { title: "Sangam Era-Indus Link", url: "https://www.newindianexpress.com/states/tamil-nadu/2019/sep/20/keeladi-findings-trace-link-between-sangam-era-indus-valley-civilisation-2036423.html", type: "media" },
    ],
  },
  {
    id: "thiruvalluvar",
    name: {
      en: "Thiruvalluvar Commemoration",
      ta: "திருவள்ளுவர் நினைவு திட்டங்கள்",
    },
    description: {
      en: "Programs and installations honoring the ancient Tamil poet and philosopher Thiruvalluvar.",
      ta: "பண்டைய தமிழ் கவிஞர் மற்றும் தத்துவஞானி திருவள்ளுவரை கௌரவிக்கும் திட்டங்கள் மற்றும் நிறுவல்கள்.",
    },
    beneficiaries: {
      count: "Multiple projects",
      description: {
        en: "Statues & memorials",
        ta: "சிலைகள் & நினைவுச்சின்னங்கள்",
      },
    },
    budget: {
      amount: "₹50+ crore",
      details: "Various projects",
    },
    highlights: [
      { en: "New statues in districts", ta: "மாவட்டங்களில் புதிய சிலைகள்" },
      { en: "Thiruvalluvar Day celebrations", ta: "திருவள்ளுவர் தின கொண்டாட்டங்கள்" },
      { en: "International Tamil conferences", ta: "சர்வதேச தமிழ் மாநாடுகள்" },
    ],
    icon: "🗿",
    sources: [
      { title: "TTDC", url: "https://www.ttdconline.com/", type: "government" },
      { title: "Thiruvalluvar Statue Coating", url: "https://www.newindianexpress.com/states/tamil-nadu/2022/jun/08/chemical-coating-for-thiruvalluvar-statue-begins-2463121.html", type: "media" },
    ],
  },
  {
    id: "cambridge-companion-periyar",
    name: {
      en: "Cambridge Companion to Periyar - Oxford Book Launch",
      ta: "கேம்பிரிட்ஜ் பெரியார் தொகுப்பு - ஆக்ஸ்போர்டு புத்தக வெளியீடு",
    },
    description: {
      en: "Historic launch of 'The Cambridge Companion to Periyar' at Oxford University, published by Cambridge University Press. Released by CM Stalin at Self-Respect Movement centenary conference.",
      ta: "கேம்பிரிட்ஜ் பதிப்பகத்தால் வெளியிடப்பட்ட 'The Cambridge Companion to Periyar' புத்தகம் ஆக்ஸ்போர்டு பல்கலைக்கழகத்தில் வரலாற்று சிறப்புமிக்க வெளியீடு.",
    },
    launchDate: "September 2025",
    beneficiaries: {
      count: "Global academia",
      description: {
        en: "Self-Respect Movement centenary celebration at Oxford",
        ta: "ஆக்ஸ்போர்டில் சுயமரியாதை இயக்கம் நூற்றாண்டு கொண்டாட்டம்",
      },
    },
    highlights: [
      { en: "Edited by A.R. Venkatachalapathy & Karthick Ram Manoharan", ta: "A.R. வெங்கடாசலபதி & கார்த்திக் ராம் மனோகரன் தொகுப்பு" },
      { en: "Published by Cambridge University Press", ta: "கேம்பிரிட்ஜ் பதிப்பகம் வெளியீடு" },
      { en: "Periyar portrait unveiled at Oxford", ta: "ஆக்ஸ்போர்டில் பெரியார் உருவப்படம் திறப்பு" },
    ],
    icon: "📖",
    sources: [
      { title: "Zee News", url: "https://zeenews.india.com/india/tamil-nadu-cm-stalin-unveils-periyar-portrait-at-oxford-university-says-his-rationalist-light-shines-across-the-world-2955935.html", type: "media" },
    ],
  },
];

export const historyStats = {
  excavationSites: 15,
  artifactsDiscovered: "18,000+",
  museumsUpgraded: 10,
  budgetIncrease: "3x since 2021",
  oldestFinding: "3,200 years (Iron Age)",
};

export function getHistoryStats() {
  return {
    totalSchemes: historySchemes.length,
    excavationSites: 15,
    artifactsCount: 18000,
    museumsCount: 10,
    yearsOfHistory: 3200,
  };
}
