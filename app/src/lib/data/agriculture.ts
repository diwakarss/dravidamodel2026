// Tamil Nadu Agriculture Schemes Data (2021-2026)
// Source: Research February 2026

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface AgricultureScheme {
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

export const agricultureSchemes: AgricultureScheme[] = [
  {
    id: "crop-insurance",
    name: {
      en: "Crop Insurance (PMFBY)",
      ta: "பயிர் காப்பீடு (PMFBY)",
    },
    description: {
      en: "Comprehensive crop insurance protecting farmers against natural calamities and crop loss.",
      ta: "இயற்கை பேரழிவுகள் மற்றும் பயிர் இழப்புக்கு எதிராக விவசாயிகளை பாதுகாக்கும் விரிவான பயிர் காப்பீடு.",
    },
    beneficiaries: {
      count: "Lakhs of farmers",
      description: {
        en: "Enrolled farmers statewide",
        ta: "மாநிலம் முழுவதும் பதிவுசெய்த விவசாயிகள்",
      },
    },
    budget: {
      amount: "₹1,000+ crore",
      year: "Annual premium subsidy",
    },
    highlights: [
      { en: "Premium subsidy by state", ta: "மாநிலத்தால் பிரீமியம் மானியம்" },
      { en: "Coverage for all major crops", ta: "அனைத்து முக்கிய பயிர்களுக்கும் காப்பீடு" },
      { en: "Quick claim settlement", ta: "விரைவான உரிமைகோரல் தீர்வு" },
    ],
    icon: "🌾",
    sources: [
      { title: "PMFBY Official", url: "https://pmfby.gov.in/adminStatistics/dashboard", type: "government" },
      { title: "TN Horticulture PMFBY", url: "https://tnhorticulture.tn.gov.in/pmfby", type: "government" },
      { title: "DES TN", url: "https://des.tn.gov.in/en/node/15", type: "government" },
    ],
  },
  {
    id: "free-electricity",
    name: {
      en: "Free Electricity for Farmers",
      ta: "விவசாயிகளுக்கு இலவச மின்சாரம்",
    },
    description: {
      en: "Continuation of free electricity for agricultural pumpsets across Tamil Nadu.",
      ta: "தமிழ்நாடு முழுவதும் விவசாய பம்ப்செட்களுக்கு இலவச மின்சாரத்தின் தொடர்ச்சி.",
    },
    beneficiaries: {
      count: "21+ lakh farmers",
      description: {
        en: "Agricultural connections",
        ta: "விவசாய இணைப்புகள்",
      },
    },
    budget: {
      amount: "₹5,000+ crore",
      year: "Annual subsidy",
    },
    highlights: [
      { en: "Free since 1984", ta: "1984 முதல் இலவசம்" },
      { en: "No limit on usage", ta: "பயன்பாட்டில் வரம்பு இல்லை" },
      { en: "24x7 agricultural feeders", ta: "24x7 விவசாய ஊட்டிகள்" },
    ],
    icon: "⚡",
    sources: [
      { title: "TNEB Agri Service", url: "https://www.tnebltd.gov.in/agrifreeservice/repbycatnew.xhtml", type: "government" },
      { title: "1 Lakh Free Connections Record", url: "https://www.deccanherald.com/india/tamil-nadu-sets-record-provides-1-lakh-free-power-connections-to-farmers-in-a-year-1101308.html", type: "media" },
    ],
  },
  {
    id: "uzhavar-sandhai",
    name: {
      en: "Uzhavar Sandhai (Farmer Markets)",
      ta: "உழவர் சந்தை",
    },
    description: {
      en: "Direct farmer-to-consumer markets eliminating middlemen for better prices.",
      ta: "சிறந்த விலைகளுக்காக இடைத்தரகர்களை அகற்றும் நேரடி விவசாயி-நுகர்வோர் சந்தைகள்.",
    },
    beneficiaries: {
      count: "179 markets",
      description: {
        en: "Across Tamil Nadu",
        ta: "தமிழ்நாடு முழுவதும்",
      },
    },
    budget: {
      amount: "State-funded",
      details: "Infrastructure support",
    },
    highlights: [
      { en: "No commission charged", ta: "கமிஷன் வசூலிக்கப்படுவதில்லை" },
      { en: "Fresh produce daily", ta: "தினசரி புதிய விளைபொருட்கள்" },
      { en: "20-30% cheaper than retail", ta: "சில்லறை விலையை விட 20-30% குறைவு" },
    ],
    icon: "🥬",
    sources: [
      { title: "Uzhavar Santhai Portal", url: "https://www.agrimark.tn.gov.in/index.php/Infra/us_details", type: "government" },
      { title: "Agrimark TN", url: "https://www.agrimark.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "organic-farming",
    name: {
      en: "Organic Farming Mission",
      ta: "இயற்கை வேளாண்மை இயக்கம்",
    },
    description: {
      en: "Promoting organic farming practices with certification support and market linkages.",
      ta: "சான்றிதழ் ஆதரவு மற்றும் சந்தை இணைப்புகளுடன் இயற்கை வேளாண்மை நடைமுறைகளை ஊக்குவித்தல்.",
    },
    beneficiaries: {
      count: "Thousands of farmers",
      description: {
        en: "Certified organic farmers",
        ta: "சான்றிதழ் பெற்ற இயற்கை விவசாயிகள்",
      },
    },
    budget: {
      amount: "₹100+ crore",
      details: "Certification & training",
    },
    highlights: [
      { en: "Free organic certification", ta: "இலவச இயற்கை சான்றிதழ்" },
      { en: "Premium price support", ta: "பிரீமியம் விலை ஆதரவு" },
      { en: "Export market linkages", ta: "ஏற்றுமதி சந்தை இணைப்புகள்" },
    ],
    icon: "🌱",
    sources: [
      { title: "TN Organic Certification", url: "https://www.tnocd.net/", type: "government" },
      { title: "CM Releases Organic Farming Policy", url: "https://www.thehindu.com/news/national/tamil-nadu/tn-cm-stalin-releases-organic-farming-policy-gene-bank-to-be-set-up-for-preservation-of-traditional-seeds/article66617994.ece", type: "media" },
    ],
  },
  {
    id: "drip-irrigation",
    name: {
      en: "Micro Irrigation (Drip & Sprinkler)",
      ta: "நுண் நீர்ப்பாசனம் (சொட்டு & தெளிப்பான்)",
    },
    description: {
      en: "Subsidies for drip and sprinkler irrigation systems to conserve water.",
      ta: "நீரை சேமிக்க சொட்டு மற்றும் தெளிப்பான் நீர்ப்பாசன அமைப்புகளுக்கான மானியங்கள்.",
    },
    beneficiaries: {
      count: "Lakhs of farmers",
      description: {
        en: "Small & marginal farmers priority",
        ta: "சிறு & குறு விவசாயிகளுக்கு முன்னுரிமை",
      },
    },
    budget: {
      amount: "100% subsidy for SF/MF",
      details: "PMKSY scheme",
    },
    highlights: [
      { en: "100% subsidy for small farmers", ta: "சிறு விவசாயிகளுக்கு 100% மானியம்" },
      { en: "75% subsidy for others", ta: "மற்றவர்களுக்கு 75% மானியம்" },
      { en: "50% water savings", ta: "50% நீர் சேமிப்பு" },
    ],
    icon: "💧",
    sources: [
      { title: "TN Micro Irrigation", url: "https://www.tn.gov.in/scheme/data_view/19311", type: "government" },
      { title: "PMKSY 100% Subsidy", url: "https://krishijagran.com/agriculture-world/pmksy-government-to-provide-100-subsidy-to-install-drip-sprinkler-systems/", type: "media" },
    ],
  },
  {
    id: "fertilizer-subsidy",
    name: {
      en: "Fertilizer & Seed Subsidy",
      ta: "உர & விதை மானியம்",
    },
    description: {
      en: "Subsidized fertilizers and quality seeds distribution through cooperative societies.",
      ta: "கூட்டுறவு சங்கங்கள் மூலம் மானிய உரங்கள் மற்றும் தரமான விதைகள் விநியோகம்.",
    },
    beneficiaries: {
      count: "All farmers",
      description: {
        en: "Through PACs network",
        ta: "PACs வலையமைப்பு மூலம்",
      },
    },
    budget: {
      amount: "State + Union subsidy",
    },
    highlights: [
      { en: "Subsidized through DBT", ta: "DBT மூலம் மானியம்" },
      { en: "Quality seeds at reduced rates", ta: "குறைந்த விலையில் தரமான விதைகள்" },
      { en: "Bio-fertilizer promotion", ta: "உயிர் உர ஊக்குவிப்பு" },
    ],
    icon: "🌿",
    sources: [
      { title: "TN Agriculture Dept", url: "https://www.tn.gov.in/department/2", type: "government" },
    ],
  },
  {
    id: "horticulture",
    name: {
      en: "Horticulture Development",
      ta: "தோட்டக்கலை மேம்பாடு",
    },
    description: {
      en: "Promoting fruits, vegetables, flowers, and spices cultivation with technical support.",
      ta: "தொழில்நுட்ப ஆதரவுடன் பழங்கள், காய்கறிகள், பூக்கள் மற்றும் மசாலா பொருட்கள் சாகுபடியை ஊக்குவித்தல்.",
    },
    beneficiaries: {
      count: "Horticulture farmers",
      description: {
        en: "Across all districts",
        ta: "அனைத்து மாவட்டங்களிலும்",
      },
    },
    budget: {
      amount: "₹500+ crore",
      year: "Annual allocation",
    },
    highlights: [
      { en: "Mango, banana, coconut focus", ta: "மாம்பழம், வாழை, தேங்காய் கவனம்" },
      { en: "Cold storage infrastructure", ta: "குளிர்பதன சேமிப்பு உள்கட்டமைப்பு" },
      { en: "Processing units support", ta: "பதப்படுத்தும் அலகுகள் ஆதரவு" },
    ],
    icon: "🍎",
    sources: [
      { title: "TN Horticulture Dept", url: "https://tnhorticulture.tn.gov.in/", type: "government" },
      { title: "Agriculture Budget 2024", url: "https://www.deccanherald.com/amp/story/india/tamil-nadu/tamil-nadu-agriculture-budget-2024-focuses-on-sustainable-chemical-free-practices-2902514", type: "media" },
    ],
  },
  {
    id: "fisheries",
    name: {
      en: "Fisheries Development",
      ta: "மீன்வளர்ப்பு மேம்பாடு",
    },
    description: {
      en: "Support for marine and inland fisheries including aquaculture promotion.",
      ta: "நீர்வாழ் வேளாண்மை ஊக்குவிப்பு உட்பட கடல் மற்றும் உள்நாட்டு மீன்வளர்ப்புக்கான ஆதரவு.",
    },
    beneficiaries: {
      count: "10+ lakh fishermen",
      description: {
        en: "Marine & inland fishers",
        ta: "கடல் & உள்நாட்டு மீனவர்கள்",
      },
    },
    budget: {
      amount: "₹500+ crore",
      year: "Annual",
    },
    highlights: [
      { en: "Fishing ban relief (₹5,000)", ta: "மீன்பிடி தடை நிவாரணம் (₹5,000)" },
      { en: "Boat engine subsidy", ta: "படகு இயந்திர மானியம்" },
      { en: "Fish landing centers", ta: "மீன் இறங்கு மையங்கள்" },
    ],
    icon: "🐟",
    sources: [
      { title: "TN Fisheries", url: "https://www.fisheries.tn.gov.in/", type: "government" },
      { title: "TN Fishermen Welfare Board", url: "https://www.tnfwb.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "dairy-development",
    name: {
      en: "Dairy & Animal Husbandry",
      ta: "பால்வளம் & கால்நடை வளர்ப்பு",
    },
    description: {
      en: "Support for dairy farming, veterinary services, and livestock insurance.",
      ta: "பால் பண்ணை, கால்நடை மருத்துவ சேவைகள் மற்றும் கால்நடை காப்பீட்டுக்கான ஆதரவு.",
    },
    beneficiaries: {
      count: "Lakhs of farmers",
      description: {
        en: "Dairy & livestock farmers",
        ta: "பால் & கால்நடை விவசாயிகள்",
      },
    },
    budget: {
      amount: "₹300+ crore",
      year: "Annual",
    },
    highlights: [
      { en: "Aavin cooperative support", ta: "ஆவின் கூட்டுறவு ஆதரவு" },
      { en: "Free veterinary services", ta: "இலவச கால்நடை மருத்துவ சேவைகள்" },
      { en: "Livestock insurance scheme", ta: "கால்நடை காப்பீட்டு திட்டம்" },
    ],
    icon: "🐄",
    sources: [
      { title: "TN Animal Husbandry", url: "https://www.tn.gov.in/department/3", type: "government" },
      { title: "Free Goat Scheme", url: "https://krishijagran.com/animal-husbandry/free-goat-sheep-scheme-for-widows-and-destitutes-with-100-government-subsidy-details-inside/", type: "media" },
    ],
  },
  {
    id: "farm-mechanization",
    name: {
      en: "Farm Mechanization",
      ta: "பண்ணை இயந்திரமயமாக்கல்",
    },
    description: {
      en: "Subsidies for tractors, harvesters, and modern agricultural equipment.",
      ta: "டிராக்டர்கள், அறுவடை இயந்திரங்கள் மற்றும் நவீன விவசாய உபகரணங்களுக்கான மானியங்கள்.",
    },
    beneficiaries: {
      count: "Thousands annually",
      description: {
        en: "Equipment purchasers",
        ta: "உபகரண வாங்குபவர்கள்",
      },
    },
    budget: {
      amount: "25-50% subsidy",
      details: "On equipment cost",
    },
    highlights: [
      { en: "Tractor subsidy up to ₹1 lakh", ta: "டிராக்டர் மானியம் ₹1 லட்சம் வரை" },
      { en: "Custom hiring centers", ta: "தனிப்பயன் வாடகை மையங்கள்" },
      { en: "Drone spraying promotion", ta: "ட்ரோன் தெளிப்பு ஊக்குவிப்பு" },
    ],
    icon: "🚜",
    sources: [
      { title: "Agricultural Engineering Dept", url: "https://aed.tn.gov.in/en/schemes/agricultural-mechanisation/sub-mission-on-agricultural-mechanisation/", type: "government" },
      { title: "Machinery Subsidies Guide", url: "https://krishijagran.com/farm-mechanization/agriculture-machinery-subsidies-documents-required-to-avail-it/", type: "media" },
    ],
  },
  {
    id: "athikadavu-avinashi",
    name: {
      en: "Athikadavu-Avinashi Scheme",
      ta: "அத்திக்கடவு-அவினாசி திட்டம்",
    },
    description: {
      en: "Six-decade old dream project diverting 1.5 TMC surplus water from Bhavani River to rejuvenate 1,045 water bodies and irrigate 24,468 acres across Erode, Tiruppur and Coimbatore districts.",
      ta: "பவானி ஆற்றின் 1.5 TMC உபரி நீரை திருப்பி ஈரோடு, திருப்பூர், கோயம்புத்தூர் மாவட்டங்களில் 1,045 நீர்நிலைகளை புத்துயிர் பெறச்செய்து 24,468 ஏக்கர் நிலத்திற்கு பாசனம் செய்யும் 67 ஆண்டுகால கனவு திட்டம்.",
    },
    launchDate: "August 17, 2024",
    beneficiaries: {
      count: "24,468 acres",
      description: {
        en: "Farmers in Erode, Tiruppur, Coimbatore districts",
        ta: "ஈரோடு, திருப்பூர், கோயம்புத்தூர் மாவட்ட விவசாயிகள்",
      },
    },
    budget: {
      amount: "₹1,916.41 crore",
      details: "67-year-old dream project completed",
    },
    highlights: [
      { en: "1.5 TMC water from Bhavani River", ta: "பவானி ஆற்றிலிருந்து 1.5 TMC நீர்" },
      { en: "1,045 water bodies rejuvenated", ta: "1,045 நீர்நிலைகள் புத்துயிர்" },
      { en: "Groundwater recharge for 3 districts", ta: "3 மாவட்டங்களுக்கு நிலத்தடி நீர் நிரப்புதல்" },
    ],
    icon: "🌊",
    sources: [
      { title: "Deccan Chronicle", url: "https://www.deccanchronicle.com/southern-states/tamil-nadu/tamil-nadu-cm-stalin-launches-athikadavu-avinashi-irrigation-scheme-1817168", type: "media" },
    ],
  },
];

export const agricultureStats = {
  farmersWithFreeElectricity: "21+ lakh",
  uzhavarSandhaiMarkets: 179,
  cropInsuranceCoverage: "Major crops",
  irrigationCoverage: "60%+ net sown area",
};

export function getAgricultureStats() {
  return {
    totalSchemes: agricultureSchemes.length,
    farmersElectricity: 2100000,
    marketsCount: 179,
    irrigationPercent: 60,
  };
}
