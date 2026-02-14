// Tamil Nadu Social Welfare Schemes Data (2021-2026)
// Source: Research February 2026

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface WelfareScheme {
  id: string;
  name: { en: string; ta: string };
  description: { en: string; ta: string };
  launchDate?: string;
  beneficiaries: {
    count: string;
    description: { en: string; ta: string };
  };
  budget: {
    amount: string;
    year?: string;
    details?: string;
  };
  eligibility?: { en: string; ta: string };
  highlights?: { en: string; ta: string }[];
  icon: string;
  sources?: SchemeSource[];
}

export const welfareSchemes: WelfareScheme[] = [
  {
    id: "magalir-urimai",
    name: {
      en: "Kalaignar Magalir Urimai Thogai",
      ta: "கலைஞர் மகளிர் உரிமைத் தொகை",
    },
    description: {
      en: "Flagship scheme providing ₹1,000 monthly financial assistance to women heads of households.",
      ta: "குடும்பத் தலைவிகளுக்கு மாதம் ₹1,000 நிதி உதவி வழங்கும் முதன்மைத் திட்டம்.",
    },
    launchDate: "September 15, 2023",
    beneficiaries: {
      count: "1.31 crore women",
      description: {
        en: "Receiving monthly DBT payments",
        ta: "மாதாந்திர DBT கொடுப்பனவுகள்",
      },
    },
    budget: {
      amount: "₹13,027 crore",
      year: "2025-26",
      details: "Increased from ₹7,000 crore (2023-24)",
    },
    eligibility: {
      en: "Women 21+, family income < ₹2.5 lakh/year",
      ta: "21+ வயது பெண்கள், குடும்ப வருமானம் < ₹2.5 லட்சம்",
    },
    highlights: [
      { en: "Direct Benefit Transfer (DBT)", ta: "நேரடி பயன் பரிமாற்றம் (DBT)" },
      { en: "Phase 1: 1.13 crore enrolled", ta: "கட்டம் 1: 1.13 கோடி பேர்" },
      { en: "₹5,000 bonus payment (2026)", ta: "₹5,000 போனஸ் கொடுப்பனவு (2026)" },
    ],
    icon: "👩",
    sources: [
      { title: "KMUT Official Portal", url: "https://kmut.tn.gov.in/", type: "government" },
      { title: "SPC Page", url: "https://spc.tn.gov.in/kalaignar-magalir-urimai-thittam/", type: "government" },
    ],
  },
  {
    id: "vidiyal-payanam",
    name: {
      en: "Vidiyal Payanam",
      ta: "விடியல் பயணம்",
    },
    description: {
      en: "Free bus travel for women in government buses across Tamil Nadu.",
      ta: "தமிழ்நாடு முழுவதும் அரசு பேருந்துகளில் பெண்களுக்கு இலவச பயணம்.",
    },
    launchDate: "January 27, 2024",
    beneficiaries: {
      count: "Crores of women",
      description: {
        en: "Daily commuters across TN",
        ta: "தினசரி பயணிகள்",
      },
    },
    budget: {
      amount: "₹3,600 crore",
      year: "2025-26",
      details: "Annual subsidy allocation",
    },
    eligibility: {
      en: "All women in TNSTC and MTC buses",
      ta: "TNSTC மற்றும் MTC பேருந்துகளில் அனைத்து பெண்கள்",
    },
    highlights: [
      { en: "Free travel on ordinary buses", ta: "சாதாரண பேருந்துகளில் இலவச பயணம்" },
      { en: "Valid across all 38 districts", ta: "அனைத்து 38 மாவட்டங்களிலும்" },
      { en: "No registration required", ta: "பதிவு தேவையில்லை" },
    ],
    icon: "🚌",
    sources: [
      { title: "SPC Vidiyal Payanam", url: "https://spc.tn.gov.in/vidiyal-payanam-scheme/", type: "government" },
      { title: "TNSTC Official", url: "https://www.tnstc.in/", type: "government" },
      { title: "The Hindu", url: "https://www.thehindu.com/news/cities/chennai/where-does-this-bus-go/article68089045.ece", type: "media" },
    ],
  },
  {
    id: "pongal-gift",
    name: {
      en: "Pongal Gift Package",
      ta: "பொங்கல் பரிசு தொகுப்பு",
    },
    description: {
      en: "Annual Pongal festival gift package for ration card holders including cash and essentials.",
      ta: "ரேஷன் அட்டை வைத்திருப்பவர்களுக்கு பொங்கல் பண்டிகையில் ரொக்கம் மற்றும் அத்தியாவசியப் பொருட்கள்.",
    },
    launchDate: "Annual (January)",
    beneficiaries: {
      count: "2.14 crore families",
      description: {
        en: "Rice card holders",
        ta: "அரிசி அட்டை வைத்திருப்பவர்கள்",
      },
    },
    budget: {
      amount: "₹2,500+ crore",
      year: "2026",
      details: "₹2,500 cash + essentials",
    },
    highlights: [
      { en: "₹2,500 cash (increased from ₹1,000)", ta: "₹2,500 ரொக்கம் (₹1,000 இல் இருந்து உயர்வு)" },
      { en: "1 kg sugar + 1 kg raw rice", ta: "1 கிலோ சர்க்கரை + 1 கிலோ பச்சரிசி" },
      { en: "Sugarcane distributed free", ta: "கரும்பு இலவசமாக வழங்கப்படுகிறது" },
    ],
    icon: "🎁",
    sources: [
      { title: "DD News", url: "https://ddnews.gov.in/en/tamil-nadu-to-launch-rs-3000-pongal-gift-scheme-for-over-two-crore-ration-card-holders-today/", type: "government" },
      { title: "Tenkasi District PR", url: "https://tenkasi.nic.in/the-pongal-gift-package-will-be-distributed-to-all-eligible-beneficiaries-through-fair-price-shops-from-08-01-2026-press-release/", type: "government" },
      { title: "The News Minute", url: "https://www.thenewsminute.com/tamil-nadu/tn-announces-rs-3000-cash-with-pongal-gift-hampers-for-ration-card-holders", type: "media" },
    ],
  },
  {
    id: "kalaignar-kanavu-illam",
    name: {
      en: "Kalaignar Kanavu Illam",
      ta: "கலைஞர் கனவு இல்லம்",
    },
    description: {
      en: "Housing scheme to build 8 lakh concrete houses for rural families living in huts by 2030.",
      ta: "2030க்குள் குடிசைகளில் வாழும் கிராமப்புற குடும்பங்களுக்கு 8 லட்சம் கான்கிரீட் வீடுகள் கட்ட திட்டம்.",
    },
    launchDate: "March 2024",
    beneficiaries: {
      count: "76,450 houses built",
      description: {
        en: "1 lakh target by July 2025",
        ta: "ஜூலை 2025க்குள் 1 லட்சம் இலக்கு",
      },
    },
    budget: {
      amount: "₹3,500 crore",
      year: "2025-26",
      details: "₹3.5 lakh per house",
    },
    eligibility: {
      en: "Poor families living in thatched huts",
      ta: "ஓலை குடிசைகளில் வாழும் ஏழை குடும்பங்கள்",
    },
    highlights: [
      { en: "360 sq ft minimum plinth area", ta: "360 சதுர அடி குறைந்தபட்ச தளப் பரப்பு" },
      { en: "RCC roofing with kitchen", ta: "சமையலறையுடன் RCC கூரை" },
      { en: "Goal: Eliminate huts by 2030", ta: "இலக்கு: 2030க்குள் குடிசைகளை ஒழிப்பு" },
    ],
    icon: "🏠",
    sources: [
      { title: "TNRD Scheme Details", url: "https://www.tnrd.tn.gov.in/dyn_json_schemes_name_details.php?scheme_type=Mw%3D%3D&y=MjAyNA%3D%3D&sch_id=ODMx&go_type=MQ%3D%3D", type: "government" },
      { title: "TNRD Official", url: "https://tnrd.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "old-age-pension",
    name: {
      en: "Old Age Pension",
      ta: "முதியோர் ஓய்வூதியம்",
    },
    description: {
      en: "Monthly pension for senior citizens without income sources.",
      ta: "வருமான ஆதாரம் இல்லாத மூத்த குடிமக்களுக்கு மாதாந்திர ஓய்வூதியம்.",
    },
    beneficiaries: {
      count: "Lakhs of seniors",
      description: {
        en: "Citizens above 60 years",
        ta: "60 வயதுக்கு மேற்பட்டவர்கள்",
      },
    },
    budget: {
      amount: "₹1,000/month",
      details: "Per beneficiary",
    },
    eligibility: {
      en: "Senior citizens 60+ with no income",
      ta: "60+ வயது, வருமானம் இல்லாதவர்கள்",
    },
    highlights: [
      { en: "State-wide coverage", ta: "மாநில அளவில் கவரேஜ்" },
      { en: "Monthly DBT disbursement", ta: "மாதாந்திர DBT வழங்கல்" },
      { en: "Combined with IGNOAPS", ta: "IGNOAPS உடன் இணைந்து" },
    ],
    icon: "👴",
    sources: [
      { title: "OAP Portal", url: "https://oap.tn.gov.in/", type: "government" },
      { title: "CRA Schemes", url: "https://www.cra.tn.gov.in/about_schemes.php", type: "government" },
      { title: "TN Pensioner Portal", url: "https://tnpensioner.tn.gov.in/pensionportal/Schemes.aspx", type: "government" },
    ],
  },
  {
    id: "widow-pension",
    name: {
      en: "Widow Pension",
      ta: "விதவை ஓய்வூதியம்",
    },
    description: {
      en: "Financial support for widowed women across Tamil Nadu.",
      ta: "தமிழ்நாடு முழுவதும் விதவைப் பெண்களுக்கு நிதி ஆதரவு.",
    },
    beneficiaries: {
      count: "Lakhs of women",
      description: {
        en: "Widowed women statewide",
        ta: "மாநிலம் முழுவதும் விதவைகள்",
      },
    },
    budget: {
      amount: "₹1,000/month",
      details: "Per beneficiary",
    },
    eligibility: {
      en: "Women married at 18+, widowed after 30",
      ta: "18+ வயதில் திருமணம், 30 வயதுக்கு மேல் விதவை",
    },
    highlights: [
      { en: "State-wide coverage", ta: "மாநில அளவில் கவரேஜ்" },
      { en: "Regular monthly payment", ta: "வழக்கமான மாதாந்திர கொடுப்பனவு" },
      { en: "Combined with IGNWPS", ta: "IGNWPS உடன் இணைந்து" },
    ],
    icon: "🕯️",
    sources: [
      { title: "Widow Welfare Board", url: "https://www.tnsocialwelfare.tn.gov.in/en/specilisationswoman-welfare/widow-and-destitute-welfare-board", type: "government" },
      { title: "OAP Portal", url: "https://oap.tn.gov.in/", type: "government" },
      { title: "CRA Schemes", url: "https://cra.tn.gov.in/eleg_schemes.php", type: "government" },
    ],
  },
  {
    id: "disabled-pension",
    name: {
      en: "Differently Abled Pension",
      ta: "மாற்றுத்திறனாளிகள் ஓய்வூதியம்",
    },
    description: {
      en: "Enhanced pension for persons with disabilities (80%+ disability).",
      ta: "மாற்றுத்திறனாளிகளுக்கு (80%+ இயலாமை) மேம்படுத்தப்பட்ட ஓய்வூதியம்.",
    },
    beneficiaries: {
      count: "Lakhs of beneficiaries",
      description: {
        en: "Persons with 80%+ disability",
        ta: "80%+ இயலாமை உள்ளவர்கள்",
      },
    },
    budget: {
      amount: "₹1,500/month",
      details: "Increased from ₹1,000 (Jan 2023)",
    },
    eligibility: {
      en: "80%+ disability certified",
      ta: "80%+ இயலாமை சான்றிதழ்",
    },
    highlights: [
      { en: "50% increase from 2023", ta: "2023 இல் இருந்து 50% உயர்வு" },
      { en: "All disability types covered", ta: "அனைத்து இயலாமை வகைகளும்" },
      { en: "₹1,433 cr dept allocation (2025-26)", ta: "₹1,433 கோடி ஒதுக்கீடு" },
    ],
    icon: "♿",
    sources: [
      { title: "OAP Portal", url: "https://oap.tn.gov.in/", type: "government" },
      { title: "CRA Schemes", url: "https://www.cra.tn.gov.in/about_schemes.php", type: "government" },
    ],
  },
  {
    id: "pds",
    name: {
      en: "Universal Public Distribution System",
      ta: "பொது விநியோக முறை",
    },
    description: {
      en: "Tamil Nadu's unique universal PDS providing free rice to all family cardholders.",
      ta: "அனைத்து குடும்ப அட்டைதாரர்களுக்கும் இலவச அரிசி வழங்கும் தமிழ்நாட்டின் தனித்துவமான PDS.",
    },
    launchDate: "June 1, 2011",
    beneficiaries: {
      count: "2+ crore families",
      description: {
        en: "Through 33,609 fair price shops",
        ta: "33,609 நியாய விலை கடைகள் மூலம்",
      },
    },
    budget: {
      amount: "5 kg rice/person/month",
      details: "Free under NFSA",
    },
    highlights: [
      { en: "Only Universal PDS state in India", ta: "இந்தியாவில் அனைவருக்குமான PDS உள்ள ஒரே மாநிலம்" },
      { en: "Rice, sugar, wheat distributed", ta: "அரிசி, சர்க்கரை, கோதுமை விநியோகம்" },
      { en: "33,609 fair price shops", ta: "33,609 நியாய விலை கடைகள்" },
    ],
    icon: "🍚",
    sources: [
      { title: "TNCSC PDS Portal", url: "https://tncsc.tn.gov.in/en/PDS.html", type: "government" },
      { title: "TNPDS Official", url: "https://www.tnpds.gov.in/", type: "government" },
      { title: "Consumer Protection Dept", url: "https://consumer.tn.gov.in/pds_outline.htm", type: "government" },
    ],
  },
  {
    id: "marriage-assistance",
    name: {
      en: "Moovalur Ramamirtham Marriage Assistance",
      ta: "மூவலூர் ராமாமிர்தம் திருமண உதவி",
    },
    description: {
      en: "Financial assistance and gold coin for women's marriages. Gold coins resumed by DMK with ₹117 cr allocated to clear backlog.",
      ta: "பெண்களின் திருமணத்திற்கு நிதி உதவி மற்றும் தங்க நாணயம். DMK மூலம் தங்க நாணயங்கள் மீண்டும் தொடங்கப்பட்டது.",
    },
    beneficiaries: {
      count: "Lakhs of women",
      description: {
        en: "Eligible women across TN",
        ta: "தமிழ்நாடு முழுவதும் தகுதியுள்ள பெண்கள்",
      },
    },
    budget: {
      amount: "₹117.18 crore",
      year: "2023-24",
      details: "For gold coins + backlog clearance",
    },
    eligibility: {
      en: "Family income < ₹72,000, 10th pass",
      ta: "குடும்ப வருமானம் < ₹72,000, 10ஆம் வகுப்பு தேர்ச்சி",
    },
    highlights: [
      { en: "₹25,000 cash + 8g gold coin", ta: "₹25,000 ரொக்கம் + 8g தங்க நாணயம்" },
      { en: "Gold coins resumed by DMK (2021)", ta: "DMK மூலம் தங்க நாணயம் மீண்டும் (2021)" },
      { en: "Inter-caste: ₹2.5 lakh grant", ta: "கலப்பு திருமணம்: ₹2.5 லட்சம்" },
    ],
    icon: "💒",
    sources: [
      { title: "TN Social Welfare Marriage Schemes", url: "https://www.tnsocialwelfare.tn.gov.in/en/specilisationswoman-welfare/marriage-assistance-schemes", type: "government" },
      { title: "NRT Marriage Assistance", url: "https://nrtamils.tn.gov.in/pages/view/Marrage-Assistance", type: "government" },
    ],
  },
  {
    id: "farm-loan-waiver",
    name: {
      en: "Farm Loan Waiver",
      ta: "விவசாயக் கடன் தள்ளுபடி",
    },
    description: {
      en: "Waiver of crop loans and jewel loans for farmers affected by distress.",
      ta: "துயரத்தால் பாதிக்கப்பட்ட விவசாயிகளுக்கு பயிர் கடன் மற்றும் நகை கடன் தள்ளுபடி.",
    },
    launchDate: "2021-2024",
    beneficiaries: {
      count: "16.43 lakh farmers",
      description: {
        en: "Cooperative loans waived",
        ta: "கூட்டுறவு கடன்கள் தள்ளுபடி",
      },
    },
    budget: {
      amount: "₹12,110 crore",
      details: "Total waived (2021-24)",
    },
    highlights: [
      { en: "₹12,110 cr total waiver", ta: "₹12,110 கோடி மொத்த தள்ளுபடி" },
      { en: "Crop loans up to ₹2 lakh", ta: "₹2 லட்சம் வரை பயிர் கடன்" },
      { en: "Jewel loans included", ta: "நகை கடன்களும் சேர்க்கப்பட்டன" },
    ],
    icon: "🌾",
    sources: [
      { title: "RCS Cooperative Societies", url: "https://www.rcs.tn.gov.in/credit_copperative.php", type: "government" },
      { title: "TN Cooperative Portal", url: "https://kooturavu.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "fishermen-welfare",
    name: {
      en: "Fishermen Welfare Schemes",
      ta: "மீனவர் நலத் திட்டங்கள்",
    },
    description: {
      en: "Comprehensive welfare including diesel subsidy, insurance, and housing for fishing community.",
      ta: "மீனவ சமூகத்திற்கு டீசல் மானியம், காப்பீடு மற்றும் வீட்டு வசதி உள்ளிட்ட விரிவான நலத்திட்டங்கள்.",
    },
    beneficiaries: {
      count: "10+ lakh fishermen",
      description: {
        en: "Fishing community across TN coast",
        ta: "தமிழ்நாடு கடற்கரை மீனவர்கள்",
      },
    },
    budget: {
      amount: "₹500+ crore",
      year: "Annual",
      details: "Diesel subsidy + welfare schemes",
    },
    highlights: [
      { en: "Diesel subsidy for boats", ta: "படகுகளுக்கு டீசல் மானியம்" },
      { en: "₹10 lakh accident insurance", ta: "₹10 லட்சம் விபத்து காப்பீடு" },
      { en: "Fishing ban period relief", ta: "மீன்பிடி தடை காலத்தில் நிவாரணம்" },
    ],
    icon: "🎣",
    sources: [
      { title: "TN Fishermen Welfare Board", url: "https://www.tnfwb.tn.gov.in/", type: "government" },
      { title: "TN Fisheries Welfare Schemes", url: "https://www.fisheries.tn.gov.in/WelfareBoard", type: "government" },
      { title: "TAFCOFED Diesel", url: "https://www.fisheries.tn.gov.in/TAFCOFED.html", type: "government" },
    ],
  },
  {
    id: "sc-st-welfare",
    name: {
      en: "SC/ST Welfare Programs",
      ta: "SC/ST நலத் திட்டங்கள்",
    },
    description: {
      en: "Comprehensive welfare programs for Scheduled Castes and Scheduled Tribes.",
      ta: "தாழ்த்தப்பட்ட மற்றும் பழங்குடியினருக்கான விரிவான நலத் திட்டங்கள்.",
    },
    beneficiaries: {
      count: "SC/ST population",
      description: {
        en: "20%+ of TN population",
        ta: "தமிழ்நாட்டின் 20%+ மக்கள்",
      },
    },
    budget: {
      amount: "₹3,924 crore",
      year: "2025-26",
      details: "Adi Dravidar & Tribal Welfare Dept",
    },
    highlights: [
      { en: "Free housing under PMAY", ta: "PMAY கீழ் இலவச வீட்டு வசதி" },
      { en: "Higher education scholarships", ta: "உயர்கல்வி உதவித்தொகை" },
      { en: "Self-employment assistance", ta: "சுயதொழில் உதவி" },
    ],
    icon: "🏛️",
    sources: [
      { title: "TNADW Official", url: "https://www.tnadw.tn.gov.in/", type: "government" },
      { title: "ADW Scholarship Portal", url: "https://tnadtwscholarship.tn.gov.in/", type: "government" },
      { title: "Tribal Welfare Dept", url: "https://www.tntribalwelfare.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "transgender-welfare",
    name: {
      en: "Transgender Welfare Programs",
      ta: "திருநங்கை நலத்திட்டங்கள்",
    },
    description: {
      en: "Comprehensive welfare support including pension, self-employment, and healthcare for transgender persons.",
      ta: "திருநங்கைகளுக்கு ஓய்வூதியம், சுயதொழில் மற்றும் சுகாதாரம் உள்ளிட்ட விரிவான நலத் திட்டங்கள்.",
    },
    launchDate: "July 2025 (5-year policy)",
    beneficiaries: {
      count: "1,760 pension beneficiaries",
      description: {
        en: "Growing annually",
        ta: "ஆண்டுதோறும் வளர்ச்சி",
      },
    },
    budget: {
      amount: "₹3 crore",
      year: "2025-26",
      details: "Pension + self-employment",
    },
    eligibility: {
      en: "Destitute transgender persons 40+",
      ta: "40+ வயது ஏழை திருநங்கைகள்",
    },
    highlights: [
      { en: "₹1,000/month pension", ta: "₹1,000/மாதம் ஓய்வூதியம்" },
      { en: "₹50,000 self-employment subsidy", ta: "₹50,000 சுயதொழில் மானியம்" },
      { en: "Free gender-affirming procedures", ta: "இலவச பாலின உறுதி செயல்முறைகள்" },
    ],
    icon: "🏳️‍⚧️",
    sources: [
      { title: "TN Transgender Welfare Board", url: "https://www.tnsocialwelfare.tn.gov.in/en/specilisationstransgenders-welfare/tamil-nadu-transgender-welfare-board", type: "government" },
      { title: "UNDP TN Transgender Study", url: "https://www.undp.org/india/publications/case-tamil-nadu-transgender-welfare-board-insights-developing-practical-models-social-protection-programmes-transgender-people", type: "other" },
    ],
  },
  {
    id: "minority-welfare",
    name: {
      en: "Minority Welfare Schemes",
      ta: "சிறுபான்மையினர் நலத் திட்டங்கள்",
    },
    description: {
      en: "Education scholarships and welfare schemes for Muslim and Christian minorities.",
      ta: "இஸ்லாமிய மற்றும் கிறிஸ்தவ சிறுபான்மையினருக்கான கல்வி உதவித்தொகை மற்றும் நலத் திட்டங்கள்.",
    },
    beneficiaries: {
      count: "Minority students & families",
      description: {
        en: "Religious minorities across TN",
        ta: "தமிழ்நாடு முழுவதும் சிறுபான்மையினர்",
      },
    },
    budget: {
      amount: "₹1,563 crore",
      year: "2025-26",
      details: "BC/MBC/Minorities Dept",
    },
    highlights: [
      { en: "Pre-matric & post-matric scholarships", ta: "முன் & பின் மெட்ரிக் உதவித்தொகை" },
      { en: "Coaching for competitive exams", ta: "போட்டித் தேர்வுகளுக்கு பயிற்சி" },
      { en: "Marriage assistance schemes", ta: "திருமண உதவித் திட்டங்கள்" },
    ],
    icon: "🕌",
    sources: [
      { title: "BCMBC Minorities Welfare", url: "https://bcmbcmw.tn.gov.in/welfschemes_minorities.htm", type: "government" },
      { title: "BCMBCMW Official", url: "https://bcmbcmw.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "icds",
    name: {
      en: "Integrated Child Development Services",
      ta: "ஒருங்கிணைந்த குழந்தை வளர்ச்சி சேவைகள்",
    },
    description: {
      en: "Nutrition, healthcare, and early childhood education through Anganwadi centers.",
      ta: "அங்கன்வாடி மையங்கள் மூலம் ஊட்டச்சத்து, சுகாதாரம் மற்றும் ஆரம்பக் கல்வி.",
    },
    beneficiaries: {
      count: "Children 0-6 & mothers",
      description: {
        en: "Through 54,439 Anganwadis",
        ta: "54,439 அங்கன்வாடிகள் மூலம்",
      },
    },
    budget: {
      amount: "₹3,676 crore",
      year: "2025-26",
    },
    highlights: [
      { en: "Supplementary nutrition", ta: "கூடுதல் ஊட்டச்சத்து" },
      { en: "Pre-school education", ta: "பாலர் பள்ளி கல்வி" },
      { en: "Health checkups & immunization", ta: "சுகாதார பரிசோதனை & தடுப்பூசி" },
    ],
    icon: "👶",
    sources: [
      { title: "ICDS TN Official", url: "https://icds.tn.gov.in/icdstn/", type: "government" },
      { title: "Anganwadi Centers", url: "https://www.icds.tn.gov.in/icdstn/anganwadi_centers.html", type: "government" },
    ],
  },
];

export const welfareStats = {
  magalirBeneficiaries: "1.31 crore",
  magalirBudget: "₹13,027 crore",
  pdsShops: 33609,
  universalPds: true,
  pensionAmount: "₹1,000-1,500/month",
  vidiyalSubsidy: "₹3,600 crore",
  pongalBeneficiaries: "2.14 crore",
  farmLoanWaiver: "₹12,110 crore",
};

export function getWelfareStats() {
  return {
    totalSchemes: welfareSchemes.length,
    magalirBeneficiaries: 13100000,
    magalirBudgetCrore: 13027,
    pdsShops: 33609,
    pensionSchemes: 3,
    farmersHelped: 1643000,
  };
}
