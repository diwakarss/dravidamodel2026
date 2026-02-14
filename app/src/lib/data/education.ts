// Tamil Nadu Education Schemes Data (2021-2026)
// Source: Research February 2026

export interface SchemeSource {
  title: string;
  url: string;
  type?: "government" | "media" | "other";
}

export interface EducationScheme {
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
  coverage: string;
  highlights?: { en: string; ta: string }[];
  icon: string;
  sources?: SchemeSource[];
}

export const educationSchemes: EducationScheme[] = [
  {
    id: "illam-thedi-kalvi",
    name: {
      en: "Illam Thedi Kalvi",
      ta: "இல்லம் தேடிக் கல்வி",
    },
    description: {
      en: "Community volunteer program providing free supplementary education at doorsteps to address COVID-19 learning loss.",
      ta: "கோவிட்-19 கற்றல் இழப்பை சரிசெய்ய வீடுகளில் இலவச கூடுதல் கல்வி வழங்கும் சமூக தன்னார்வ திட்டம்.",
    },
    launchDate: "October 27, 2021",
    beneficiaries: {
      count: "96 lakh",
      description: {
        en: "Classes 1-8, govt schools",
        ta: "1-8 வகுப்பு, அரசு பள்ளிகள்",
      },
    },
    budget: {
      amount: "State-funded",
      details: "2 lakh+ volunteers engaged",
    },
    coverage: "All 38 districts, evening classes 5-7 PM",
    highlights: [
      { en: "Launched by CM Stalin at Mudaliarkuppam", ta: "முதலமைச்சர் ஸ்டாலின் முதலியார்குப்பத்தில் தொடங்கினார்" },
      { en: "35 lakh students benefited in first 2 years", ta: "முதல் 2 ஆண்டுகளில் 35 லட்சம் மாணவர்கள் பயனடைந்தனர்" },
      { en: "Volunteers: Class 12 for primary, UG for upper primary", ta: "தன்னார்வலர்கள்: ஆரம்பநிலைக்கு 12ஆம் வகுப்பு, மேல்நிலைக்கு இளங்கலை" },
    ],
    icon: "📚",
    sources: [
      { title: "State Planning Commission", url: "https://spc.tn.gov.in/illam-thedi-kalvi-scheme/", type: "government" },
      { title: "School Education Dept GOs", url: "https://www.tn.gov.in/go_view/dept/28", type: "government" },
    ],
  },
  {
    id: "pudhumai-penn",
    name: {
      en: "Pudhumai Penn (Moovalur Ramamirtham Scheme)",
      ta: "புதுமைப் பெண் (மூவலூர் ராமமிர்தம் திட்டம்)",
    },
    description: {
      en: "Monthly financial assistance for girl students from government schools to pursue higher education.",
      ta: "அரசு பள்ளிகளில் படித்த பெண் மாணவர்களுக்கு உயர்கல்வி தொடர மாதாந்திர நிதி உதவி.",
    },
    launchDate: "September 5, 2022",
    beneficiaries: {
      count: "2.73 lakh",
      description: {
        en: "Girls from govt schools (6-12)",
        ta: "அரசு பள்ளி பெண்கள் (6-12)",
      },
    },
    budget: {
      amount: "₹1,000/month",
      year: "Until graduation",
      details: "Direct Benefit Transfer",
    },
    coverage: "UG degree, Diploma, ITI, recognized courses",
    highlights: [
      { en: "13,681 additional college enrollments (6.9% increase)", ta: "13,681 கூடுதல் கல்லூரி சேர்க்கைகள் (6.9% அதிகரிப்பு)" },
      { en: "Extended to aided schools from July 2024", ta: "ஜூலை 2024 முதல் உதவி பெறும் பள்ளிகளுக்கு விரிவாக்கம்" },
      { en: "Beneficiaries: SC 38.6%, MBC 34.4%, BC 24.8%", ta: "பயனாளிகள்: SC 38.6%, MBC 34.4%, BC 24.8%" },
    ],
    icon: "👩‍🎓",
    sources: [
      { title: "Pudhumai Penn Portal", url: "https://www.pudhumaipenn.tn.gov.in/", type: "government" },
      { title: "Social Welfare Dept", url: "https://www.tnsocialwelfare.tn.gov.in/en/pudhumai-penn-scheme", type: "government" },
      { title: "SPC Evaluation", url: "https://spc.tn.gov.in/evaluation-of-pudhumai-penn-scheme/", type: "government" },
    ],
  },
  {
    id: "tamil-pudhalvan",
    name: {
      en: "Tamil Pudhalvan",
      ta: "தமிழ் புதல்வன்",
    },
    description: {
      en: "Monthly financial assistance for male students from Tamil medium government schools pursuing higher education.",
      ta: "தமிழ் வழி அரசு பள்ளிகளில் படித்த ஆண் மாணவர்களுக்கு உயர்கல்விக்கான மாதாந்திர நிதி உதவி.",
    },
    launchDate: "August 9, 2024",
    beneficiaries: {
      count: "3.28 lakh",
      description: {
        en: "Boys from Tamil medium (6-12)",
        ta: "தமிழ் வழி ஆண்கள் (6-12)",
      },
    },
    budget: {
      amount: "₹1,000/month",
      year: "2024-25: ₹360 crore",
      details: "Direct Benefit Transfer via UMIS portal",
    },
    coverage: "Until completion of first higher education course",
    highlights: [
      { en: "Launched by CM Stalin in Coimbatore", ta: "முதலமைச்சர் ஸ்டாலின் கோவையில் தொடங்கினார்" },
      { en: "Aims to reduce dropout rate among male students", ta: "ஆண் மாணவர்களிடையே இடைநிறுத்தத்தை குறைக்க இலக்கு" },
      { en: "Online application through UMIS portal", ta: "UMIS போர்ட்டல் வழியாக ஆன்லைன் விண்ணப்பம்" },
    ],
    icon: "👨‍🎓",
    sources: [
      { title: "Social Welfare Dept", url: "https://www.tnsocialwelfare.tn.gov.in/en/specilisationswoman-welfare/tamil-pudhalvan", type: "government" },
    ],
  },
  {
    id: "breakfast-scheme",
    name: {
      en: "Chief Minister's Breakfast Scheme",
      ta: "முதலமைச்சர் காலை உணவுத் திட்டம்",
    },
    description: {
      en: "Free nutritious breakfast for primary school students to improve attendance and cognitive development.",
      ta: "ஆரம்பப் பள்ளி மாணவர்களுக்கு வருகை மற்றும் அறிவாற்றல் வளர்ச்சியை மேம்படுத்த இலவச சத்தான காலை உணவு.",
    },
    launchDate: "September 15, 2022",
    beneficiaries: {
      count: "20.73 lakh",
      description: {
        en: "Classes 1-5 in 31K schools",
        ta: "31K பள்ளிகளில் 1-5 வகுப்பு",
      },
    },
    budget: {
      amount: "₹600 crore",
      year: "2024-25",
      details: "Phase 1: ₹33.56 crore (2022)",
    },
    coverage: "Government and Government-aided primary schools",
    highlights: [
      { en: "2.50 lakh new school admissions attributed to scheme", ta: "திட்டத்தால் 2.50 லட்சம் புதிய பள்ளி சேர்க்கைகள்" },
      { en: "Variety menu: upma, pongal, rava kesari, etc.", ta: "பலவகை உணவு: உப்புமா, பொங்கல், ரவா கேசரி போன்றவை" },
      { en: "Phase 3 (2024): Extended to 3,995 aided schools", ta: "கட்டம் 3 (2024): 3,995 உதவி பெறும் பள்ளிகளுக்கு விரிவாக்கம்" },
    ],
    icon: "🍳",
    sources: [
      { title: "Social Welfare Dept", url: "https://www.tnsocialwelfare.tn.gov.in/en/specilisationsnutritious-meal-programme/chief-ministers-breakfast-scheme", type: "government" },
      { title: "SPC Evaluation", url: "https://spc.tn.gov.in/chief-ministers-breakfast-scheme/", type: "government" },
    ],
  },
  {
    id: "noon-meal",
    name: {
      en: "Puratchi Thalaivar MGR Nutritious Meal Programme",
      ta: "புரட்சித் தலைவர் எம்.ஜி.ஆர். சத்துணவுத் திட்டம்",
    },
    description: {
      en: "Pioneer mid-day meal program providing hot, nutritious lunch to school children.",
      ta: "பள்ளி குழந்தைகளுக்கு சூடான, சத்தான மதிய உணவு வழங்கும் முன்னோடி திட்டம்.",
    },
    launchDate: "1982 (Continuously upgraded)",
    beneficiaries: {
      count: "68 lakh+",
      description: {
        en: "Classes 1-10",
        ta: "1-10 வகுப்புகள்",
      },
    },
    budget: {
      amount: "Part of ₹46,767 crore",
      year: "2025-26",
      details: "School Education budget",
    },
    coverage: "Govt, aided schools, STCs, Madarasas, Maktabs",
    highlights: [
      { en: "CM reviews every 6 months", ta: "முதலமைச்சர் ஒவ்வொரு 6 மாதமும் மதிப்பாய்வு" },
      { en: "Double Fortified Salt & Oil (Vitamin A, D)", ta: "இரட்டை வலுவூட்டப்பட்ட உப்பு & எண்ணெய் (வைட்டமின் A, D)" },
      { en: "First state-wide mid-day meal program in India", ta: "இந்தியாவில் முதல் மாநில அளவிலான மதிய உணவு திட்டம்" },
    ],
    icon: "🍱",
    sources: [
      { title: "Social Welfare Dept", url: "https://www.tnsocialwelfare.tn.gov.in/en/specilisationsnutritious-meal-programme/puratchi-thalaivar-mgr-nutritious-meal-programme", type: "government" },
      { title: "Mid Day Meal Portal", url: "https://middaymeal.tn.gov.in/", type: "government" },
    ],
  },
  {
    id: "laptop-scheme",
    name: {
      en: "Ulagam Ungal Kaiyil (Free Laptops)",
      ta: "உலகம் உங்கள் கையில் திட்டம்",
    },
    description: {
      en: "Free laptop distribution to final year college students for digital empowerment.",
      ta: "இறுதி ஆண்டு கல்லூரி மாணவர்களுக்கு டிஜிட்டல் வலுவூட்டலுக்காக இலவச மடிக்கணினி வழங்கல்.",
    },
    launchDate: "January 5, 2026",
    beneficiaries: {
      count: "10 lakh (Phase 1)",
      description: {
        en: "Final year, govt colleges",
        ta: "இறுதி ஆண்டு, அரசு கல்லூரிகள்",
      },
    },
    budget: {
      amount: "₹2,000 crore",
      year: "2025-26",
    },
    coverage: "Engineering, Arts & Science, Medicine, Agriculture, Law, Polytechnic",
    highlights: [
      { en: "Dell, Acer, HP laptops with Intel i3/AMD Ryzen 3", ta: "Dell, Acer, HP மடிக்கணினிகள் Intel i3/AMD Ryzen 3 உடன்" },
      { en: "8GB RAM, 256GB SSD, Windows 11 + BOSS Linux", ta: "8GB RAM, 256GB SSD, Windows 11 + BOSS Linux" },
      { en: "6-month Perplexity Pro AI subscription included", ta: "6 மாத Perplexity Pro AI சந்தா சேர்க்கப்பட்டுள்ளது" },
    ],
    icon: "💻",
    sources: [
      { title: "ELCOT Laptop Portal", url: "https://elcotlaptop.tn.gov.in/home", type: "government" },
      { title: "ELCOT Student Info", url: "https://elcot.tn.gov.in/student-free-laptop", type: "government" },
    ],
  },
  {
    id: "naan-mudhalvan",
    name: {
      en: "Naan Mudhalvan (Skill Development)",
      ta: "நான் முதல்வன்",
    },
    description: {
      en: "Comprehensive skill development program for students including UPSC preparation support.",
      ta: "UPSC தயாரிப்பு ஆதரவு உட்பட மாணவர்களுக்கான விரிவான திறன் மேம்பாட்டு திட்டம்.",
    },
    launchDate: "March 2022",
    beneficiaries: {
      count: "10 lakh/year",
      description: {
        en: "Students aged 18-35",
        ta: "18-35 வயது மாணவர்கள்",
      },
    },
    budget: {
      amount: "Multi-crore",
      details: "UPSC: ₹7,500/month prelims, ₹25K mains, ₹50K interview",
    },
    coverage: "Engineering, Arts & Sciences, Polytechnic, ITI, Medical",
    highlights: [
      { en: "Industry-aligned skill training", ta: "தொழில்துறை சார்ந்த திறன் பயிற்சி" },
      { en: "1,000 candidates for UPSC prelims coaching", ta: "UPSC முதல்நிலை பயிற்சிக்கு 1,000 விண்ணப்பதாரர்கள்" },
      { en: "Placement assistance included", ta: "வேலை வாய்ப்பு உதவி சேர்க்கப்பட்டுள்ளது" },
    ],
    icon: "🎯",
    sources: [
      { title: "Naan Mudhalvan Portal", url: "https://www.naanmudhalvan.tn.gov.in/", type: "government" },
      { title: "TN Skill Development Corporation", url: "https://www.tnskill.tn.gov.in/naan-mudhalvan/", type: "government" },
    ],
  },
  {
    id: "free-bicycle",
    name: {
      en: "Free Bicycle Scheme",
      ta: "இலவச சைக்கிள் திட்டம்",
    },
    description: {
      en: "Free bicycles for Class 11 students to improve school accessibility and reduce dropouts.",
      ta: "பள்ளி அணுகலை மேம்படுத்தவும் இடைநிறுத்தத்தை குறைக்கவும் 11ஆம் வகுப்பு மாணவர்களுக்கு இலவச சைக்கிள்.",
    },
    beneficiaries: {
      count: "5.47 lakh (2024-25)",
      description: {
        en: "Class 11, govt & aided schools",
        ta: "11ஆம் வகுப்பு, அரசு பள்ளிகள்",
      },
    },
    budget: {
      amount: "Annual distribution",
      details: "All communities eligible regardless of income",
    },
    coverage: "Govt, govt-aided, partially aided schools",
    highlights: [
      { en: "TN dropout rate: 7.7% (vs 14.1% national average)", ta: "தமிழ்நாடு இடைநிறுத்த விகிதம்: 7.7% (தேசிய சராசரி 14.1%)" },
      { en: "Students with free bus pass also eligible", ta: "இலவச பேருந்து பாஸ் உள்ள மாணவர்களும் தகுதியானவர்கள்" },
      { en: "No income or community restrictions", ta: "வருமானம் அல்லது சமூக கட்டுப்பாடுகள் இல்லை" },
    ],
    icon: "🚲",
    sources: [
      { title: "School Education Dept", url: "https://www.tn.gov.in/scheme/data_view/26799", type: "government" },
    ],
  },
  {
    id: "free-bus-pass",
    name: {
      en: "Free Bus Pass for Students",
      ta: "மாணவர் இலவச பேருந்து பாஸ்",
    },
    description: {
      en: "Smart card-based free bus travel for students from school to college level.",
      ta: "பள்ளி முதல் கல்லூரி வரை மாணவர்களுக்கு ஸ்மார்ட் கார்டு அடிப்படையிலான இலவச பேருந்து பயணம்.",
    },
    launchDate: "1996-97 (Smart cards from 2016)",
    beneficiaries: {
      count: "Lakhs of students",
      description: {
        en: "School & college students",
        ta: "பள்ளி & கல்லூரி மாணவர்கள்",
      },
    },
    budget: {
      amount: "State-funded",
      details: "PVC smart cards with hologram",
    },
    coverage: "TNSTC and MTC ordinary buses",
    highlights: [
      { en: "Valid: June 15 to April 30", ta: "செல்லுபடியாகும்: ஜூன் 15 முதல் ஏப்ரல் 30 வரை" },
      { en: "No poverty line restrictions", ta: "வறுமைக் கோட்டு கட்டுப்பாடுகள் இல்லை" },
      { en: "Covers home to school travel", ta: "வீடு முதல் பள்ளி வரை பயணத்தை உள்ளடக்கியது" },
    ],
    icon: "🚌",
    sources: [
      { title: "TN Government Schemes", url: "https://www.tn.gov.in/scheme", type: "government" },
    ],
  },
  {
    id: "overseas-scholarship",
    name: {
      en: "Overseas Scholarship Schemes",
      ta: "வெளிநாட்டு உதவித்தொகை திட்டங்கள்",
    },
    description: {
      en: "Scholarships for postgraduate and doctoral studies abroad for SC/ST and minority students.",
      ta: "SC/ST மற்றும் சிறுபான்மையினர் மாணவர்களுக்கு வெளிநாட்டில் முதுகலை மற்றும் முனைவர் படிப்புக்கான உதவித்தொகை.",
    },
    beneficiaries: {
      count: "Multiple schemes",
      description: {
        en: "SC/ST & minority students",
        ta: "SC/ST & சிறுபான்மையினர்",
      },
    },
    budget: {
      amount: "Up to ₹36 lakh/year",
      details: "Tuition, living expenses, visa, airfare covered",
    },
    coverage: "Postgraduate and doctoral research abroad",
    highlights: [
      { en: "Income limit: ₹8 lakh for AD/Tribal", ta: "வருமான வரம்பு: AD/பழங்குடியினருக்கு ₹8 லட்சம்" },
      { en: "10 Muslim students/year (new 2025 scheme)", ta: "ஆண்டுக்கு 10 முஸ்லிம் மாணவர்கள் (புதிய 2025 திட்டம்)" },
      { en: "Medical insurance and equipment allowance included", ta: "மருத்துவ காப்பீடு மற்றும் உபகரண படி சேர்க்கப்பட்டுள்ளது" },
    ],
    icon: "✈️",
    sources: [
      { title: "BC/MBC Welfare Dept", url: "https://bcmbcmw.tn.gov.in/welfschemes.htm", type: "government" },
    ],
  },
  {
    id: "schools-of-excellence",
    name: {
      en: "Schools of Excellence & Model Schools",
      ta: "தகைசால் பள்ளிகள் / மாதிரி பள்ளிகள்",
    },
    description: {
      en: "Modern schools with smart classrooms, labs, libraries, and sports facilities.",
      ta: "ஸ்மார்ட் வகுப்பறைகள், ஆய்வகங்கள், நூலகங்கள் மற்றும் விளையாட்டு வசதிகளுடன் நவீன பள்ளிகள்.",
    },
    beneficiaries: {
      count: "62,460+ students",
      description: {
        en: "26 + 15 upgraded schools",
        ta: "26 + 15 மேம்படுத்தப்பட்ட பள்ளிகள்",
      },
    },
    budget: {
      amount: "₹171 crore",
      year: "Phase 1",
      details: "SEP 2025: 38 Model Schools + 313 Vetri Palligal planned",
    },
    coverage: "Municipal Corporation schools upgraded",
    highlights: [
      { en: "Smart classrooms with digital boards", ta: "டிஜிட்டல் போர்டுகளுடன் ஸ்மார்ட் வகுப்பறைகள்" },
      { en: "Modern science laboratories", ta: "நவீன அறிவியல் ஆய்வகங்கள்" },
      { en: "Vetri Palligal for JEE/NEET preparation", ta: "JEE/NEET தயாரிப்புக்கான வெற்றி பள்ளிகள்" },
    ],
    icon: "🏫",
    sources: [
      { title: "School Education Dept", url: "https://www.tn.gov.in/dept_profile.php?dep_id=Mjg%3D", type: "government" },
    ],
  },
  {
    id: "free-textbooks-uniforms",
    name: {
      en: "Free Textbooks, Uniforms, Shoes",
      ta: "இலவச புத்தகங்கள், சீருடைகள், காலணிகள்",
    },
    description: {
      en: "Free educational materials and uniforms for all government school students.",
      ta: "அனைத்து அரசு பள்ளி மாணவர்களுக்கும் இலவச கல்வி பொருட்கள் மற்றும் சீருடைகள்.",
    },
    launchDate: "Textbooks: 2005-06",
    beneficiaries: {
      count: "All govt students",
      description: {
        en: "Classes 1-12",
        ta: "1-12 வகுப்புகள்",
      },
    },
    budget: {
      amount: "Part of school education budget",
    },
    coverage: "Government and government-aided schools",
    highlights: [
      { en: "2 pairs of shoes and socks for Classes 6-10", ta: "6-10 வகுப்புகளுக்கு 2 ஜோடி காலணிகள் மற்றும் காலுறைகள்" },
      { en: "Annual uniform distribution", ta: "வருடாந்திர சீருடை வழங்கல்" },
      { en: "All textbooks provided free", ta: "அனைத்து பாடப்புத்தகங்களும் இலவசமாக வழங்கப்படுகின்றன" },
    ],
    icon: "📖",
    sources: [
      { title: "School Education Dept", url: "https://www.tn.gov.in/scheme", type: "government" },
    ],
  },
  {
    id: "infrastructure",
    name: {
      en: "School Infrastructure Development",
      ta: "பள்ளி உள்கட்டமைப்பு மேம்பாடு",
    },
    description: {
      en: "Massive infrastructure upgrades including classrooms, smart facilities, and mobile science labs.",
      ta: "வகுப்பறைகள், ஸ்மார்ட் வசதிகள் மற்றும் நடமாடும் அறிவியல் ஆய்வகங்கள் உள்ளிட்ட பாரிய உள்கட்டமைப்பு மேம்பாடுகள்.",
    },
    launchDate: "2022-23",
    beneficiaries: {
      count: "All govt schools",
      description: {
        en: "State-wide upgrade",
        ta: "மாநில அளவில் மேம்பாடு",
      },
    },
    budget: {
      amount: "₹2,245 crore (2024-25)",
      details: "₹1,000 cr classrooms + ₹300 cr smart + ₹745 cr upgrades",
    },
    coverage: "15,000 smart classrooms, 8,200+ high-tech labs",
    highlights: [
      { en: "100 Vaanavil Mandrams (mobile science labs) for remote areas", ta: "தொலைதூர பகுதிகளுக்கு 100 வானவில் மன்றங்கள் (நடமாடும் அறிவியல் ஆய்வகங்கள்)" },
      { en: "₹200 crore school maintenance", ta: "₹200 கோடி பள்ளி பராமரிப்பு" },
      { en: "₹200 crore college civil infrastructure", ta: "₹200 கோடி கல்லூரி சிவில் உள்கட்டமைப்பு" },
    ],
    icon: "🔧",
    sources: [
      { title: "TN Budget 2024-25", url: "https://www.tnbudget.tn.gov.in/tnweb_files/budget%20highlights/HIGHLIGHTS%20ENG%202024_25.pdf", type: "government" },
    ],
  },
  {
    id: "education-loans",
    name: {
      en: "Education Loan Facilitation",
      ta: "கல்விக் கடன் வசதி",
    },
    description: {
      en: "State-facilitated education loans through banks for college students.",
      ta: "கல்லூரி மாணவர்களுக்கு வங்கிகள் மூலம் அரசு வசதியுடன் கூடிய கல்விக் கடன்.",
    },
    beneficiaries: {
      count: "1 lakh students",
      description: {
        en: "College students",
        ta: "கல்லூரி மாணவர்கள்",
      },
    },
    budget: {
      amount: "₹2,500 crore (2024-25)",
      details: "Disbursed through banks",
    },
    coverage: "All recognized higher education courses",
    highlights: [
      { en: "Government ensures bank disbursement", ta: "அரசு வங்கி வழங்கலை உறுதி செய்கிறது" },
      { en: "Covers tuition and living expenses", ta: "கல்வி கட்டணம் மற்றும் வாழ்க்கை செலவுகளை உள்ளடக்கியது" },
      { en: "Available for professional courses", ta: "தொழில்முறை படிப்புகளுக்கு கிடைக்கும்" },
    ],
    icon: "💰",
    sources: [
      { title: "TN Budget 2024-25", url: "https://www.tnbudget.tn.gov.in/tnweb_files/BS_2024_25_ENG_FINAL.pdf", type: "government" },
    ],
  },
  {
    id: "state-education-policy",
    name: {
      en: "TN State Education Policy 2025",
      ta: "தமிழ்நாடு மாநில கல்விக் கொள்கை 2025",
    },
    description: {
      en: "Comprehensive education policy with two-language formula, competency-based learning, and AI integration.",
      ta: "இரு மொழி கொள்கை, திறன் அடிப்படையிலான கற்றல் மற்றும் AI ஒருங்கிணைப்புடன் விரிவான கல்விக் கொள்கை.",
    },
    launchDate: "August 9, 2025",
    beneficiaries: {
      count: "All students",
      description: {
        en: "K-12 & higher education",
        ta: "K-12 & உயர்கல்வி",
      },
    },
    budget: {
      amount: "₹55,261 crore (2025-26)",
      details: "Total education department allocation",
    },
    coverage: "All government and aided educational institutions",
    highlights: [
      { en: "Two-language formula: Tamil + English only", ta: "இரு மொழி கொள்கை: தமிழ் + ஆங்கிலம் மட்டுமே" },
      { en: "No Class 11 public exams (stress reduction)", ta: "11ஆம் வகுப்பு பொதுத் தேர்வு இல்லை (மன அழுத்தம் குறைப்பு)" },
      { en: "TN-SPARK: Coding, AI, financial literacy from middle school", ta: "TN-SPARK: நடுநிலைப் பள்ளியிலிருந்து குறியீட்டு, AI, நிதி கல்வி" },
    ],
    icon: "📜",
    sources: [
      { title: "TN Budget 2025-26", url: "https://www.tnbudget.tn.gov.in/tnweb_files/BS_2025_26_ENG_FINAL.pdf", type: "government" },
    ],
  },
];

export const educationStats = {
  totalBudget: "₹55,261 crore",
  schoolBudget: "₹46,767 crore",
  higherEdBudget: "₹8,494 crore",
  illamThediBeneficiaries: "96 lakh",
  pudhmaaiPennBeneficiaries: "2.73 lakh",
  tamilPudhalvanBeneficiaries: "3.28 lakh",
  breakfastBeneficiaries: "20.73 lakh",
  laptopsPlanned: "10 lakh",
};

export function getEducationStats() {
  return {
    totalSchemes: educationSchemes.length,
    totalBudgetCrore: 55261,
    totalBeneficiaries: 9600000, // 96 lakh (Illam Thedi Kalvi alone)
    breakfastStudents: 2073000,
    laptopsPlanned: 1000000,
    schoolsCovered: 31008,
  };
}
