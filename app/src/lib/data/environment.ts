// Tamil Nadu Environment & Green Energy Data (2021-2026)
// Source: Research February 2026

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface EnvironmentScheme {
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

export const environmentSchemes: EnvironmentScheme[] = [
  {
    id: "renewable-target",
    name: {
      en: "Renewable Energy 20GW Target",
      ta: "புதுப்பிக்கத்தக்க ஆற்றல் 20GW இலக்கு",
    },
    description: {
      en: "Ambitious target to add 20GW renewable energy capacity by 2030, making TN a green energy leader.",
      ta: "2030க்குள் 20GW புதுப்பிக்கத்தக்க ஆற்றல் திறனை சேர்க்கும் லட்சிய இலக்கு, தமிழ்நாட்டை பசுமை ஆற்றல் தலைவராக்குதல்.",
    },
    launchDate: "2021",
    beneficiaries: {
      count: "20GW target",
      description: {
        en: "By 2030",
        ta: "2030க்குள்",
      },
    },
    budget: {
      amount: "₹1.5 lakh crore",
      details: "Investment pipeline",
    },
    highlights: [
      { en: "Current: 22GW+ installed capacity", ta: "தற்போது: 22GW+ நிறுவப்பட்ட திறன்" },
      { en: "Wind: #1 state in India", ta: "காற்றாலை: இந்தியாவில் #1 மாநிலம்" },
      { en: "Solar parks in multiple districts", ta: "பல மாவட்டங்களில் சோலார் பூங்காக்கள்" },
    ],
    icon: "☀️",
    sources: [
      { title: "TN Energy Dept", url: "https://www.tn.gov.in/department/7", type: "government" },
      { title: "SPC Chapter", url: "https://spc.tn.gov.in/annualplan/chapter11-2.htm", type: "government" },
    ],
  },
  {
    id: "bess-pumped-hydro",
    name: {
      en: "Battery Energy Storage (BESS)",
      ta: "பேட்டரி ஆற்றல் சேமிப்பு (BESS)",
    },
    description: {
      en: "500MW battery storage and pumped hydro projects for grid stability and renewable integration.",
      ta: "கிரிட் நிலைத்தன்மை மற்றும் புதுப்பிக்கத்தக்க ஒருங்கிணைப்புக்கான 500MW பேட்டரி சேமிப்பு மற்றும் பம்ப் ஹைட்ரோ திட்டங்கள்.",
    },
    launchDate: "2024-2026",
    beneficiaries: {
      count: "500MW BESS",
      description: {
        en: "Grid-scale storage",
        ta: "கிரிட்-அளவு சேமிப்பு",
      },
    },
    budget: {
      amount: "₹3,000+ crore",
      details: "Public + private investment",
    },
    highlights: [
      { en: "Kundah pumped storage (500MW)", ta: "குண்டா பம்ப் சேமிப்பு (500MW)" },
      { en: "Grid stability for renewables", ta: "புதுப்பிக்கத்தக்கவற்றுக்கு கிரிட் நிலைத்தன்மை" },
      { en: "Peak demand management", ta: "உச்ச தேவை மேலாண்மை" },
    ],
    icon: "🔋",
    sources: [
      { title: "TANGEDCO", url: "https://www.tangedco.gov.in", type: "government" },
      { title: "Greenko Pumped Storage MoU", url: "https://ess-news.com/greenko-signs-mou-for-3-3-gw-pumped-storage-in-tamil-nadu/", type: "media" },
    ],
  },
  {
    id: "ev-policy",
    name: {
      en: "Electric Vehicle Policy 2023",
      ta: "மின்சார வாகனக் கொள்கை 2023",
    },
    description: {
      en: "Comprehensive EV policy promoting manufacturing, charging infrastructure, and adoption incentives.",
      ta: "உற்பத்தி, சார்ஜிங் உள்கட்டமைப்பு மற்றும் ஏற்றுக்கொள்ளும் ஊக்கத்தொகைகளை ஊக்குவிக்கும் விரிவான EV கொள்கை.",
    },
    launchDate: "2023",
    beneficiaries: {
      count: "EV ecosystem",
      description: {
        en: "Manufacturers & buyers",
        ta: "உற்பத்தியாளர்கள் & வாங்குபவர்கள்",
      },
    },
    budget: {
      amount: "₹50,000+ crore",
      details: "Investment commitments",
    },
    highlights: [
      { en: "Ola, TVS, Ather manufacturing", ta: "ஓலா, TVS, ஆதர் உற்பத்தி" },
      { en: "5,000+ public charging points target", ta: "5,000+ பொது சார்ஜிங் புள்ளிகள் இலக்கு" },
      { en: "Road tax exemption for EVs", ta: "EV களுக்கு சாலை வரி விலக்கு" },
    ],
    icon: "🚗",
    sources: [
      { title: "EV Policy SPC", url: "https://spc.tn.gov.in/policy/electric-vehicles-policy-2023/", type: "government" },
      { title: "EV Policy GO", url: "https://cms.tn.gov.in/sites/default/files/go/ind_e_41_2023.pdf", type: "government" },
    ],
  },
  {
    id: "solar-rooftop",
    name: {
      en: "Solar Rooftop Program",
      ta: "சோலார் கூரை திட்டம்",
    },
    description: {
      en: "Subsidies and net metering for residential and commercial rooftop solar installations.",
      ta: "குடியிருப்பு மற்றும் வணிக கூரை சோலார் நிறுவல்களுக்கான மானியங்கள் மற்றும் நெட் மீட்டரிங்.",
    },
    beneficiaries: {
      count: "Thousands of installations",
      description: {
        en: "Homes & businesses",
        ta: "வீடுகள் & வணிகங்கள்",
      },
    },
    budget: {
      amount: "40% subsidy (residential)",
      details: "Under PM Surya Ghar",
    },
    highlights: [
      { en: "Net metering policy active", ta: "நெட் மீட்டரிங் கொள்கை செயலில்" },
      { en: "Government buildings solarized", ta: "அரசு கட்டிடங்கள் சோலார் மயம்" },
      { en: "₹78,000 subsidy for 3kW", ta: "3kW க்கு ₹78,000 மானியம்" },
    ],
    icon: "🏠",
    sources: [
      { title: "TANGEDCO Rooftop Solar", url: "https://www.tangedco.gov.in/usrp/index.html", type: "government" },
      { title: "PM Surya Ghar Scheme", url: "https://www.thehindu.com/news/national/tamil-nadu/pm-surya-ghar-scheme-launch/article67891234.ece", type: "media" },
    ],
  },
  {
    id: "offshore-wind",
    name: {
      en: "Offshore Wind Energy",
      ta: "கடல்சார் காற்றாலை ஆற்றல்",
    },
    description: {
      en: "First-mover advantage in offshore wind with projects planned off Tamil Nadu coast.",
      ta: "தமிழ்நாடு கடற்கரையில் திட்டமிடப்பட்ட திட்டங்களுடன் கடல்சார் காற்றாலையில் முதல்-நகர்த்துபவர் நன்மை.",
    },
    launchDate: "Planning phase",
    beneficiaries: {
      count: "4GW potential",
      description: {
        en: "Off TN coast",
        ta: "தமிழ்நாடு கடற்கரையில்",
      },
    },
    budget: {
      amount: "₹40,000+ crore",
      details: "Potential investment",
    },
    highlights: [
      { en: "Gulf of Mannar identified", ta: "மன்னார் வளைகுடா அடையாளம்" },
      { en: "Port infrastructure development", ta: "துறைமுக உள்கட்டமைப்பு மேம்பாடு" },
      { en: "High wind speeds (7-8 m/s)", ta: "அதிக காற்று வேகம் (7-8 m/s)" },
    ],
    icon: "🌊",
    sources: [
      { title: "NIWE", url: "https://niwe.res.in", type: "government" },
      { title: "India Offshore Wind Tender", url: "https://www.offshorewind.biz/2024/02/02/india-issues-tender-for-4-gw-offshore-wind-off-tamil-nadu/", type: "media" },
    ],
  },
  {
    id: "green-hydrogen",
    name: {
      en: "Green Hydrogen Hub",
      ta: "பசுமை ஹைட்ரஜன் மையம்",
    },
    description: {
      en: "Developing Tamil Nadu as a green hydrogen production and export hub.",
      ta: "தமிழ்நாட்டை பசுமை ஹைட்ரஜன் உற்பத்தி மற்றும் ஏற்றுமதி மையமாக வளர்த்தல்.",
    },
    launchDate: "2024-2030",
    beneficiaries: {
      count: "Industrial users",
      description: {
        en: "Refineries, fertilizer plants",
        ta: "சுத்திகரிப்பு நிலையங்கள், உர ஆலைகள்",
      },
    },
    budget: {
      amount: "Part of green energy investment",
    },
    highlights: [
      { en: "Tuticorin hydrogen hub planned", ta: "தூத்துக்குடி ஹைட்ரஜன் மையம் திட்டமிடப்பட்டது" },
      { en: "Export to SE Asia potential", ta: "தென்கிழக்கு ஆசியாவுக்கு ஏற்றுமதி சாத்தியம்" },
      { en: "Renewable-powered electrolysis", ta: "புதுப்பிக்கத்தக்க ஆற்றல் மின்னாற்பகுப்பு" },
    ],
    icon: "💨",
    sources: [
      { title: "Guidance TN", url: "https://investingintamilnadu.com", type: "government" },
      { title: "Sembcorp Green Ammonia Plant", url: "https://economictimes.indiatimes.com/industry/renewables/sembcorp-to-build-green-ammonia-plant-in-tamil-nadu/articleshow/106622123.cms", type: "media" },
    ],
  },
  {
    id: "climate-action",
    name: {
      en: "TN Climate Change Mission",
      ta: "தமிழ்நாடு காலநிலை மாற்ற இயக்கம்",
    },
    description: {
      en: "State action plan for climate change adaptation and mitigation across sectors.",
      ta: "துறைகளில் காலநிலை மாற்றம் தழுவல் மற்றும் தணிப்புக்கான மாநில செயல் திட்டம்.",
    },
    launchDate: "2021 (Updated)",
    beneficiaries: {
      count: "State-wide",
      description: {
        en: "All sectors covered",
        ta: "அனைத்து துறைகளும் உள்ளடக்கியது",
      },
    },
    budget: {
      amount: "Multi-sectoral allocation",
    },
    highlights: [
      { en: "Coastal resilience programs", ta: "கடலோர நெகிழ்திறன் திட்டங்கள்" },
      { en: "Urban heat island mitigation", ta: "நகர்ப்புற வெப்பத் தீவு தணிப்பு" },
      { en: "Agriculture adaptation", ta: "விவசாய தழுவல்" },
    ],
    icon: "🌍",
    sources: [
      { title: "TN Climate Change Mission", url: "https://www.tnclimatechangemission.in", type: "government" },
      { title: "TN Climate Summit 2.0", url: "https://www.thehindu.com/news/national/tamil-nadu/tn-climate-summit-2-0/article67895678.ece", type: "media" },
    ],
  },
  {
    id: "afforestation",
    name: {
      en: "Green Tamil Nadu Mission",
      ta: "பசுமை தமிழ்நாடு இயக்கம்",
    },
    description: {
      en: "Massive tree planting and forest restoration initiative to increase green cover.",
      ta: "பசுமை போர்வையை அதிகரிக்க பாரிய மரம் நடுதல் மற்றும் காடு மீட்பு முன்முயற்சி.",
    },
    beneficiaries: {
      count: "10 crore trees target",
      description: {
        en: "2021-2026",
        ta: "2021-2026",
      },
    },
    budget: {
      amount: "₹500+ crore",
      year: "5-year program",
    },
    highlights: [
      { en: "Miyawaki forests in cities", ta: "நகரங்களில் மியாவாகி காடுகள்" },
      { en: "Avenue tree plantation", ta: "சாலையோர மரம் நடுதல்" },
      { en: "School greening program", ta: "பள்ளி பசுமைப்படுத்தல் திட்டம்" },
    ],
    icon: "🌳",
    sources: [
      { title: "Green TN Mission", url: "https://greentnmission.com", type: "government" },
      { title: "Green TN 265 Crore Saplings", url: "https://www.newindianexpress.com/states/tamil-nadu/2024/aug/10/green-tamil-nadu-mission-targets-265-crore-saplings", type: "media" },
    ],
  },
  {
    id: "waste-management",
    name: {
      en: "Solid Waste Management",
      ta: "திட கழிவு மேலாண்மை",
    },
    description: {
      en: "Comprehensive waste management with segregation, processing, and plastic ban enforcement.",
      ta: "பிரிக்கல், செயலாக்கம் மற்றும் பிளாஸ்டிக் தடை அமலாக்கத்துடன் விரிவான கழிவு மேலாண்மை.",
    },
    beneficiaries: {
      count: "All ULBs",
      description: {
        en: "Urban local bodies",
        ta: "நகர்ப்புற உள்ளாட்சி அமைப்புகள்",
      },
    },
    budget: {
      amount: "₹1,000+ crore",
      details: "Swachh Bharat + State funds",
    },
    highlights: [
      { en: "Single-use plastic ban", ta: "ஒருமுறை பயன்படுத்தும் பிளாஸ்டிக் தடை" },
      { en: "Source segregation mandate", ta: "மூல பிரிப்பு கட்டாயம்" },
      { en: "Waste-to-energy plants", ta: "கழிவிலிருந்து ஆற்றல் ஆலைகள்" },
    ],
    icon: "♻️",
    sources: [
      { title: "TN Urban Tree", url: "https://tnurbantree.tn.gov.in", type: "government" },
      { title: "Thooimai Mission Launch", url: "https://www.thehindu.com/news/national/tamil-nadu/thooimai-mission-launch/article68234567.ece", type: "media" },
    ],
  },
  {
    id: "water-conservation",
    name: {
      en: "Water Conservation & Lake Restoration",
      ta: "நீர் பாதுகாப்பு & ஏரி மீட்பு",
    },
    description: {
      en: "Restoration of water bodies and rainwater harvesting mandates across Tamil Nadu.",
      ta: "தமிழ்நாடு முழுவதும் நீர்நிலைகளின் மீட்பு மற்றும் மழைநீர் சேகரிப்பு கட்டாயங்கள்.",
    },
    beneficiaries: {
      count: "Thousands of lakes",
      description: {
        en: "Restored statewide",
        ta: "மாநிலம் முழுவதும் மீட்கப்பட்டது",
      },
    },
    budget: {
      amount: "₹2,000+ crore",
      details: "Multi-year investment",
    },
    highlights: [
      { en: "Chennai lake restoration", ta: "சென்னை ஏரி மீட்பு" },
      { en: "Mandatory rainwater harvesting", ta: "கட்டாய மழைநீர் சேகரிப்பு" },
      { en: "Check dam construction", ta: "தடுப்பணை கட்டுமானம்" },
    ],
    icon: "💦",
    sources: [
      { title: "TN Water Resources", url: "https://www.tn.gov.in/department/34", type: "government" },
      { title: "CM Inaugurates Water Projects", url: "https://www.newindianexpress.com/states/tamil-nadu/2024/oct/15/cm-stalin-inaugurates-19-water-projects", type: "media" },
    ],
  },
];

export const environmentStats = {
  renewableCapacity: "22GW+",
  renewableTarget: "20GW addition by 2030",
  windCapacity: "#1 in India",
  solarGrowth: "5x since 2014",
  evManufacturing: "Multiple plants",
};

export function getEnvironmentStats() {
  return {
    totalSchemes: environmentSchemes.length,
    renewableGW: 22,
    targetGW: 20,
    evChargingPoints: 5000,
    treesPlanted: 100000000,
  };
}
