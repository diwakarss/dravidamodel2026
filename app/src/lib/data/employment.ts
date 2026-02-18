// Tamil Nadu Employment and Skilling Schemes Data (2021-2026)
// Source: Research February 2026

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface EmploymentScheme {
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
  outcomes?: { en: string; ta: string };
  highlights?: { en: string; ta: string }[];
  icon: string;
  sources?: SchemeSource[];
}

export const employmentSchemes: EmploymentScheme[] = [
  {
    id: "naan-mudhalvan",
    name: {
      en: "Naan Mudhalvan",
      ta: "நான் முதல்வன்",
    },
    description: {
      en: "Flagship skill development and placement program for college students with industry partnerships.",
      ta: "தொழில்துறை கூட்டாண்மையுடன் கல்லூரி மாணவர்களுக்கான முதன்மை திறன் மேம்பாடு மற்றும் வேலை வாய்ப்பு திட்டம்.",
    },
    launchDate: "March 2022",
    beneficiaries: {
      count: "41.38 lakh students",
      description: {
        en: "Trained across 2,085 institutions",
        ta: "2,085 நிறுவனங்களில் பயிற்சி",
      },
    },
    budget: {
      amount: "~₹200 crore",
      details: "₹30.17 crore for engineering skill centers",
    },
    outcomes: {
      en: "3.28 lakh placements over 3 years",
      ta: "3 ஆண்டுகளில் 3.28 லட்சம் வேலைவாய்ப்புகள்",
    },
    highlights: [
      { en: "1 lakh+ teachers trained", ta: "1 லட்சம்+ ஆசிரியர்கள் பயிற்சி" },
      { en: "2023-24: 1.48 lakh placements", ta: "2023-24: 1.48 லட்சம் வேலைவாய்ப்புகள்" },
      { en: "Arts & Science: 83,195 placements", ta: "கலை & அறிவியல்: 83,195 வேலைவாய்ப்புகள்" },
    ],
    icon: "🎯",
    sources: [
      { title: "Naan Mudhalvan Portal", url: "https://www.naanmudhalvan.tn.gov.in/", type: "government" },
      { title: "TNSDC Naan Mudhalvan", url: "https://www.tnskill.tn.gov.in/naan-mudhalvan/", type: "government" },
    ],
  },
  {
    id: "vetri-nichayam",
    name: {
      en: "TN Vetri Nichayam Scheme",
      ta: "தமிழ்நாடு வெற்றி நிச்சயம் திட்டம்",
    },
    description: {
      en: "Skill voucher program providing training and financial support for youth employment.",
      ta: "இளைஞர் வேலைவாய்ப்புக்கான பயிற்சி மற்றும் நிதி ஆதரவு வழங்கும் திறன் வவுச்சர் திட்டம்.",
    },
    launchDate: "July 2025",
    beneficiaries: {
      count: "75,000 target",
      description: {
        en: "Youth seeking skills development",
        ta: "திறன் மேம்பாடு தேடும் இளைஞர்கள்",
      },
    },
    budget: {
      amount: "₹100 crore",
      details: "100 hours training + ₹12,000 skill voucher",
    },
    highlights: [
      { en: "₹12,000 skill voucher per person", ta: "நபருக்கு ₹12,000 திறன் வவுச்சர்" },
      { en: "100 hours of training", ta: "100 மணி நேர பயிற்சி" },
      { en: "70% placement target", ta: "70% வேலைவாய்ப்பு இலக்கு" },
    ],
    icon: "🏆",
    sources: [
      { title: "Vetri Nichayam Portal", url: "https://candidate.tnskill.tn.gov.in/skillwallet/", type: "government" },
      { title: "TNSDC", url: "https://www.tnskill.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "startup-tn",
    name: {
      en: "StartupTN Ecosystem",
      ta: "ஸ்டார்ட்அப் தமிழ்நாடு",
    },
    description: {
      en: "Comprehensive startup support with funding, incubation, and mentorship. 6x growth since 2021.",
      ta: "நிதியுதவி, இன்குபேஷன் மற்றும் வழிகாட்டுதலுடன் விரிவான ஸ்டார்ட்அப் ஆதரவு. 2021 முதல் 6 மடங்கு வளர்ச்சி.",
    },
    beneficiaries: {
      count: "12,000+ startups",
      description: {
        en: "6x growth from 2,000 in 2021",
        ta: "2021 இல் 2,000 இல் இருந்து 6 மடங்கு வளர்ச்சி",
      },
    },
    budget: {
      amount: "₹300+ crore",
      details: "Multiple funds combined",
    },
    outcomes: {
      en: "50.1% women-led startups, 120+ incubators",
      ta: "50.1% பெண்கள் தலைமையிலான ஸ்டார்ட்அப்கள், 120+ இன்குபேட்டர்கள்",
    },
    highlights: [
      { en: "TANSEED: ₹10-15 lakh grants", ta: "TANSEED: ₹10-15 லட்சம் மானியம்" },
      { en: "SC/ST Fund: ₹50 cr (43 startups)", ta: "SC/ST நிதி: ₹50 கோடி (43 ஸ்டார்ட்அப்கள்)" },
      { en: "Deep Tech Policy: ₹100 crore", ta: "டீப் டெக் கொள்கை: ₹100 கோடி" },
    ],
    icon: "🚀",
    sources: [
      { title: "TANSIM Official", url: "https://www.msmetamilnadu.tn.gov.in/tansim.php", type: "government" },
      { title: "iTNT Hub", url: "https://itnthub.tn.gov.in/", type: "government" },
      { title: "Startup Policy SPC", url: "https://spc.tn.gov.in/policy/tamil-nadu-startup-and-innovation-policy-2023/", type: "government" },
    ],
  },
  {
    id: "job-fairs",
    name: {
      en: "Job Fairs & Placement Drives",
      ta: "வேலைவாய்ப்பு முகாம்கள்",
    },
    description: {
      en: "Regular job fairs connecting employers with job seekers across all districts.",
      ta: "அனைத்து மாவட்டங்களிலும் முதலாளிகளை வேலை தேடுபவர்களுடன் இணைக்கும் வழக்கமான வேலைவாய்ப்பு முகாம்கள்.",
    },
    launchDate: "Ongoing",
    beneficiaries: {
      count: "1.12 lakh placements",
      description: {
        en: "May 2021 to December 2022",
        ta: "மே 2021 முதல் டிசம்பர் 2022 வரை",
      },
    },
    outcomes: {
      en: "41,200 placements in 2021-22 alone",
      ta: "2021-22 இல் மட்டும் 41,200 வேலைவாய்ப்புகள்",
    },
    highlights: [
      { en: "36 mega job fairs (2021-22)", ta: "36 மெகா வேலைவாய்ப்பு முகாம்கள் (2021-22)" },
      { en: "297 regular job fairs", ta: "297 வழக்கமான வேலைவாய்ப்பு முகாம்கள்" },
      { en: "District-wise employment drives", ta: "மாவட்ட வாரியான வேலைவாய்ப்பு இயக்கங்கள்" },
    ],
    icon: "🤝",
    sources: [
      { title: "TN Private Jobs Portal", url: "https://www.tnprivatejobs.tn.gov.in/Home/job_mela", type: "government" },
      { title: "70,000 Jobs at Mega Fair", url: "https://www.deccanherald.com/india/over-70000-jobs-up-for-grabs-at-mega-employment-fair-launched-by-tamil-nadu-cm-stalin-1093049.html", type: "media" },
    ],
  },
  {
    id: "uyegp",
    name: {
      en: "Unemployed Youth Employment Generation Programme",
      ta: "வேலையில்லா இளைஞர் வேலைவாய்ப்பு உருவாக்க திட்டம்",
    },
    description: {
      en: "Loan and subsidy program for youth entrepreneurship and self-employment.",
      ta: "இளைஞர் தொழில்முனைவு மற்றும் சுயதொழிலுக்கான கடன் மற்றும் மானியத் திட்டம்.",
    },
    beneficiaries: {
      count: "Thousands annually",
      description: {
        en: "Youth starting businesses",
        ta: "தொழில் தொடங்கும் இளைஞர்கள்",
      },
    },
    budget: {
      amount: "Loans up to ₹15 lakh",
      details: "25% subsidy (max ₹2.5 lakh)",
    },
    highlights: [
      { en: "Manufacturing: up to ₹15 lakh", ta: "உற்பத்தி: ₹15 லட்சம் வரை" },
      { en: "Services: up to ₹5 lakh", ta: "சேவைகள்: ₹5 லட்சம் வரை" },
      { en: "25% back-end subsidy", ta: "25% பின்முனை மானியம்" },
    ],
    icon: "💼",
    sources: [
      { title: "TN Velvai Vaippu", url: "https://www.tnvelaivaaippu.gov.in/", type: "government" },
    ],
  },
  {
    id: "women-employment",
    name: {
      en: "Women Employment & Safety Project",
      ta: "பெண்கள் வேலைவாய்ப்பு & பாதுகாப்பு திட்டம்",
    },
    description: {
      en: "World Bank-supported project to increase women's workforce participation with safety infrastructure.",
      ta: "பாதுகாப்பு உள்கட்டமைப்புடன் பெண்களின் பணியாளர் பங்கேற்பை அதிகரிக்க உலக வங்கி ஆதரவு திட்டம்.",
    },
    beneficiaries: {
      count: "Target: Lakhs of women",
      description: {
        en: "Women workforce participation",
        ta: "பெண்கள் பணியாளர் பங்கேற்பு",
      },
    },
    budget: {
      amount: "₹5,000 crore",
      details: "5-year World Bank framework",
    },
    highlights: [
      { en: "World Bank partnership", ta: "உலக வங்கி கூட்டாண்மை" },
      { en: "Safety infrastructure at workplaces", ta: "பணியிடங்களில் பாதுகாப்பு உள்கட்டமைப்பு" },
      { en: "Skilling & employment linkages", ta: "திறன் & வேலைவாய்ப்பு இணைப்புகள்" },
    ],
    icon: "👩‍💼",
    sources: [
      { title: "TN Mahalir Thittam", url: "https://new.tamilnadumahalir.org/", type: "government" },
      { title: "WESAFE World Bank Program", url: "https://www.worldbank.org/en/news/press-release/2025/06/24/new-world-bank-program-to-improve-access-to-quality-jobs-for-1-6-million-women-in-the-indian-state-of-tamil-nadu", type: "media" },
    ],
  },
  {
    id: "msme-support",
    name: {
      en: "MSME Support & Incentives",
      ta: "MSME ஆதரவு & ஊக்கத்தொகைகள்",
    },
    description: {
      en: "Comprehensive support for Micro, Small and Medium Enterprises with subsidies and incentives.",
      ta: "மானியங்கள் மற்றும் ஊக்கத்தொகைகளுடன் நுண், சிறு மற்றும் நடுத்தர நிறுவனங்களுக்கு விரிவான ஆதரவு.",
    },
    beneficiaries: {
      count: "Lakhs of MSMEs",
      description: {
        en: "Registered enterprises",
        ta: "பதிவு செய்யப்பட்ட நிறுவனங்கள்",
      },
    },
    budget: {
      amount: "Multiple schemes",
      details: "Capital subsidy, interest subvention",
    },
    highlights: [
      { en: "25% capital subsidy", ta: "25% மூலதன மானியம்" },
      { en: "3% interest subvention", ta: "3% வட்டி தள்ளுபடி" },
      { en: "Single window clearance", ta: "ஒற்றை சாளர அனுமதி" },
    ],
    icon: "🏭",
    sources: [
      { title: "MSME TN Portal", url: "https://www.msmetamilnadu.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "skill-labs",
    name: {
      en: "School Skill Labs",
      ta: "பள்ளி திறன் ஆய்வகங்கள்",
    },
    description: {
      en: "Setting up skill development labs in government schools for vocational training.",
      ta: "தொழிற்கல்வி பயிற்சிக்காக அரசு பள்ளிகளில் திறன் மேம்பாட்டு ஆய்வகங்கள் அமைத்தல்.",
    },
    launchDate: "2024",
    beneficiaries: {
      count: "15,000 labs target",
      description: {
        en: "Government school students",
        ta: "அரசு பள்ளி மாணவர்கள்",
      },
    },
    budget: {
      amount: "₹300 crore",
      year: "2024",
    },
    highlights: [
      { en: "Hands-on vocational training", ta: "நடைமுறை தொழிற்கல்வி பயிற்சி" },
      { en: "Industry-relevant skills", ta: "தொழில்துறை சார்ந்த திறன்கள்" },
      { en: "Early career exposure", ta: "ஆரம்ப தொழில் வாய்ப்பு" },
    ],
    icon: "🔧",
    sources: [
      { title: "Skill Training TN", url: "https://skilltraining.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "industrial-investments",
    name: {
      en: "Industrial Investments & MoUs",
      ta: "தொழில்துறை முதலீடுகள் & புரிந்துணர்வு ஒப்பந்தங்கள்",
    },
    description: {
      en: "Attracting investments through MoUs signed at Global Investors Meet and other forums.",
      ta: "உலகளாவிய முதலீட்டாளர் சந்திப்பு மற்றும் பிற மன்றங்களில் கையெழுத்தான புரிந்துணர்வு ஒப்பந்தங்கள் மூலம் முதலீடுகளை ஈர்த்தல்.",
    },
    launchDate: "GIM 2024",
    beneficiaries: {
      count: "6.64 lakh jobs proposed",
      description: {
        en: "From GIM 2024 MoUs",
        ta: "GIM 2024 புரிந்துணர்வு ஒப்பந்தங்களிலிருந்து",
      },
    },
    budget: {
      amount: "₹6.60 lakh crore",
      details: "Investment commitments from GIM 2024",
    },
    highlights: [
      { en: "59 MoUs worth ₹6.6 lakh crore", ta: "₹6.6 லட்சம் கோடி மதிப்புள்ள 59 புரிந்துணர்வு ஒப்பந்தங்கள்" },
      { en: "Tata, Hyundai, JSW investments", ta: "டாடா, ஹ்யூண்டாய், JSW முதலீடுகள்" },
      { en: "EV, semiconductors, data centers", ta: "EV, செமிகண்டக்டர்கள், தரவு மையங்கள்" },
    ],
    icon: "📈",
    sources: [
      { title: "GIM 2024 Official", url: "https://tngim2024.com/", type: "government" },
      { title: "Guidance TN", url: "https://investingintamilnadu.com/DIGIGOV/TN-pages/guidance.jsp?pagedisp=static", type: "government" },
    ],
  },
  {
    id: "tnsdc",
    name: {
      en: "TNSDC Skill Training",
      ta: "திறன் மேம்பாட்டு கழகம்",
    },
    description: {
      en: "Tamil Nadu Skill Development Corporation training programs with industry certification.",
      ta: "தொழில்துறை சான்றிதழுடன் தமிழ்நாடு திறன் மேம்பாட்டு கழக பயிற்சி திட்டங்கள்.",
    },
    beneficiaries: {
      count: "45,825 completed",
      description: {
        en: "In 2021-22 with 70% placement",
        ta: "2021-22 இல் 70% வேலைவாய்ப்புடன்",
      },
    },
    budget: {
      amount: "Multi-scheme funding",
      details: "State and Union schemes",
    },
    outcomes: {
      en: "70% placement target for certified candidates",
      ta: "சான்றிதழ் பெற்றவர்களுக்கு 70% வேலைவாய்ப்பு இலக்கு",
    },
    highlights: [
      { en: "59,143 registered (2021-22)", ta: "59,143 பதிவு (2021-22)" },
      { en: "Sector-specific programs", ta: "துறை சார்ந்த திட்டங்கள்" },
      { en: "Industry partnerships", ta: "தொழில்துறை கூட்டாண்மைகள்" },
    ],
    icon: "📚",
    sources: [
      { title: "TNSDC Official", url: "https://www.tnskill.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "apprenticeship",
    name: {
      en: "Apprenticeship Programs",
      ta: "பயிற்சியாளர் திட்டங்கள்",
    },
    description: {
      en: "Industry apprenticeship training with stipend for hands-on work experience.",
      ta: "நடைமுறை பணி அனுபவத்திற்கான உதவித்தொகையுடன் தொழில்துறை பயிற்சியாளர் பயிற்சி.",
    },
    beneficiaries: {
      count: "Thousands annually",
      description: {
        en: "ITI & diploma students",
        ta: "ITI & டிப்ளமா மாணவர்கள்",
      },
    },
    budget: {
      amount: "NAPS & State schemes",
      details: "Stipend support for apprentices",
    },
    highlights: [
      { en: "National Apprenticeship Promotion Scheme", ta: "தேசிய பயிற்சி ஊக்குவிப்புத் திட்டம்" },
      { en: "Industry-integrated training", ta: "தொழில்துறை ஒருங்கிணைந்த பயிற்சி" },
      { en: "Stipend during training", ta: "பயிற்சி காலத்தில் உதவித்தொகை" },
    ],
    icon: "🛠️",
    sources: [
      { title: "Apprenticeship Portal", url: "https://skilltraining.tn.gov.in/apprenticeship.html", type: "government" },
      { title: "Apprenticeship India", url: "https://www.apprenticeshipindia.gov.in/", type: "government" },
    ],
  },
  {
    id: "tnrising-thoothukudi",
    name: {
      en: "TN Rising Thoothukudi Investors Conclave",
      ta: "TN ரைசிங் தூத்துக்குடி முதலீட்டாளர் மாநாடு",
    },
    description: {
      en: "Inaugural TN Rising investors conclave in Thoothukudi securing ₹32,554 crore investments through 41 MoUs across electronics, defence, aerospace, green energy, and auto components sectors.",
      ta: "தூத்துக்குடியில் முதல் TN ரைசிங் முதலீட்டாளர் மாநாடு - மின்னணுவியல், பாதுகாப்பு, விண்வெளி, பசுமை ஆற்றல் மற்றும் வாகன உதிரிபாகங்கள் துறைகளில் 41 புரிந்துணர்வு ஒப்பந்தங்கள் மூலம் ₹32,554 கோடி முதலீடுகள்.",
    },
    launchDate: "August 2025",
    beneficiaries: {
      count: "49,800+ jobs",
      description: {
        en: "Employment in southern Tamil Nadu districts",
        ta: "தென் தமிழ்நாடு மாவட்டங்களில் வேலைவாய்ப்பு",
      },
    },
    budget: {
      amount: "₹32,554 crore",
      details: "Investment through 41 MoUs",
    },
    outcomes: {
      en: "VinFast plant inaugurated, 256-acre space park announced",
      ta: "VinFast ஆலை திறப்பு, 256 ஏக்கர் விண்வெளி பூங்கா அறிவிப்பு",
    },
    highlights: [
      { en: "41 MoUs signed at conclave", ta: "41 புரிந்துணர்வு ஒப்பந்தங்கள் கையெழுத்து" },
      { en: "Sakthi Group: ₹5,000 Cr largest single investment", ta: "சக்தி குழுமம்: ₹5,000 கோடி மிகப்பெரிய முதலீடு" },
      { en: "256-acre space park, shipbuilding facility announced", ta: "256 ஏக்கர் விண்வெளி பூங்கா, கப்பல் கட்டும் வசதி அறிவிப்பு" },
    ],
    icon: "💼",
    sources: [
      { title: "Business Standard", url: "https://www.business-standard.com/economy/news/tn-deal-rs-32554-crore-investments-south-tamil-nadu-jsw-rge-125080401249_1.html", type: "media" },
    ],
  },
];

export const employmentStats = {
  naanMudhalvanTrained: "41.38 lakh",
  naanMudhalvanPlacements: "3.28 lakh",
  startups: "12,000+",
  womenLedStartups: "50.1%",
  jobFairPlacements: "1.12 lakh",
  gimInvestments: "₹6.60 lakh crore",
  gimJobs: "6.64 lakh",
  unemploymentUrban: "2.05%",
  unemploymentRural: "4.51%",
};

export function getEmploymentStats() {
  return {
    totalSchemes: employmentSchemes.length,
    studentsTrained: 4138000,
    totalPlacements: 328000,
    activeStartups: 12000,
    womenStartupPercent: 50.1,
    incubators: 120,
    proposedJobs: 664000,
  };
}
