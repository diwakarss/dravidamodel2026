// NalaN Intent Matching System
// Keyword-based routing with curated responses

import { historySchemes } from "@/lib/data/tamilHistory";
import { sportsCultureSchemes } from "@/lib/data/sportsCulture";
import { environmentSchemes } from "@/lib/data/environment";
import { agricultureSchemes } from "@/lib/data/agriculture";
import { educationSchemes } from "@/lib/data/education";
import { healthcareSchemes } from "@/lib/data/healthcare";
import { welfareSchemes } from "@/lib/data/socialWelfare";
import { employmentSchemes } from "@/lib/data/employment";
import { sectors, industrialParks } from "@/lib/data/industries";

type Locale = "en" | "ta";

interface SchemeData {
  id: string;
  name: { en: string; ta: string };
  description: { en: string; ta: string };
  budget?: { amount: string; details?: string };
  highlights?: { en: string; ta: string }[];
}

// Format a scheme into a readable response
function formatSchemeResponse(scheme: SchemeData | undefined, locale: Locale): string {
  if (!scheme) return "";

  const name = scheme.name[locale];
  const desc = scheme.description[locale];
  const budget = scheme.budget?.amount || "";

  let response = `**${name}**\n\n${desc}`;

  if (budget) {
    response += `\n\n${locale === "ta" ? "பட்ஜெட்" : "Budget"}: ${budget}`;
  }

  if (scheme.highlights && scheme.highlights.length > 0) {
    response += `\n\n${locale === "ta" ? "முக்கிய அம்சங்கள்" : "Highlights"}:`;
    scheme.highlights.slice(0, 3).forEach(h => {
      response += `\n• ${h[locale]}`;
    });
  }

  return response;
}

// All schemes combined for search
function getAllSchemes(): SchemeData[] {
  return [
    ...historySchemes,
    ...sportsCultureSchemes,
    ...environmentSchemes,
    ...agricultureSchemes,
    ...educationSchemes,
    ...healthcareSchemes,
    ...welfareSchemes,
    ...employmentSchemes,
  ] as SchemeData[];
}

// Intent definitions with keywords
interface Intent {
  id: string;
  keywords: string[];
  getResponse: (locale: Locale) => string;
}

const INTENTS: Intent[] = [
  // Meta intents
  {
    id: "who-made",
    keywords: ["who made", "who built", "who created", "creator", "developer", "nalan"],
    getResponse: (locale) => locale === "ta"
      ? "நான் நளன். இந்த தளம் தமிழ்நாட்டின் 2021-26 முன்னேற்றத்தை காட்சிப்படுத்த உருவாக்கப்பட்டது. வேலை தனக்காகவே பேசட்டும்."
      : "I am NalaN. This site was created to showcase Tamil Nadu's progress 2021-26. I prefer to let the work speak for itself."
  },
  {
    id: "what-is-dravida",
    keywords: ["dravida model", "dravidian model", "what is this", "திராவிட மாடல்"],
    getResponse: (locale) => locale === "ta"
      ? "திராவிட மாடல் என்பது சமூக நீதி, கல்வி, சுகாதாரம், பொருளாதார வளர்ச்சி ஆகியவற்றில் தமிழ்நாட்டின் தனித்துவமான அணுகுமுறையைக் குறிக்கிறது. இந்த தளம் 2021-26 காலகட்டத்தில் அதன் செயல்படுத்தலை ஆவணப்படுத்துகிறது."
      : "The Dravida Model represents Tamil Nadu's distinctive approach to social justice, education, healthcare, and economic development. This site documents its implementation during 2021-26."
  },
  {
    id: "how-many-schemes",
    keywords: ["how many", "total schemes", "count", "எத்தனை திட்டங்கள்"],
    getResponse: (locale) => {
      const total = getAllSchemes().length;
      return locale === "ta"
        ? `இந்த தளத்தில் ${total}+ திட்டங்கள் ஆவணப்படுத்தப்பட்டுள்ளன - உள்கட்டமைப்பு, தொழில், கல்வி, சுகாதாரம், நலன், வேலைவாய்ப்பு, வரலாறு, வேளாண்மை, பசுமை ஆற்றல், விளையாட்டு & கலாச்சாரம்.`
        : `This site documents ${total}+ schemes across Infrastructure, Industries, Education, Healthcare, Welfare, Employment, Tamil History, Agriculture, Green Energy, and Sports & Culture.`;
    }
  },
  {
    id: "help",
    keywords: ["help", "what can you", "உதவி"],
    getResponse: (locale) => locale === "ta"
      ? "இந்த தளத்தில் உள்ள எந்த திட்டத்தையும் பற்றி என்னிடம் கேளுங்கள். உதாரணம்: கீழடி, சதுரங்க ஒலிம்பியாட், மகளிர் உரிமைத் தொகை."
      : "Ask me about any scheme on this site. For example: Keezhadi excavations, Chess Olympiad, Magalir Urimai Thogai, free bus travel, or any tab you see above."
  },

  // Scheme-specific intents - History
  {
    id: "keezhadi",
    keywords: ["keezhadi", "keeladi", "கீழடி", "excavation", "580 bce", "sivaganga"],
    getResponse: (locale) => formatSchemeResponse(historySchemes.find(s => s.id === "keezhadi"), locale)
  },
  {
    id: "porunai",
    keywords: ["porunai", "thamiraparani", "பொருநை", "தாமிரபரணி", "1155 bce"],
    getResponse: (locale) => formatSchemeResponse(historySchemes.find(s => s.id === "porunai"), locale)
  },
  {
    id: "mayiladumparai",
    keywords: ["mayiladumparai", "iron age", "மயிலாடும்பாறை", "5300 years", "3345 bce"],
    getResponse: (locale) => formatSchemeResponse(historySchemes.find(s => s.id === "mayiladumparai"), locale)
  },
  {
    id: "adichanallur",
    keywords: ["adichanallur", "ஆதிச்சநல்லூர்", "burial", "iconic site"],
    getResponse: (locale) => formatSchemeResponse(historySchemes.find(s => s.id === "adichanallur"), locale)
  },
  {
    id: "indus-script",
    keywords: ["indus script", "indus valley", "harappan", "million dollar prize", "சிந்து எழுத்து", "decipherment"],
    getResponse: (locale) => formatSchemeResponse(historySchemes.find(s => s.id === "harappan-research"), locale)
  },

  // Industries - MUST come before any "indus" partial matches
  {
    id: "industries",
    keywords: ["industries", "industry", "manufacturing", "தொழில்", "sector", "factory", "factories", "industrial"],
    getResponse: (locale) => {
      return locale === "ta"
        ? `தமிழ்நாடு தொழில்துறை:\n\n• ${sectors.length} முக்கிய துறைகள்\n• ${industrialParks.length}+ தொழில் பூங்காக்கள் & திட்டங்கள்\n\nமுக்கிய துறைகள்: ${sectors.slice(0, 5).map(s => s.name.ta).join(", ")}\n\nGIM 2024: ₹6.64 லட்சம் கோடி முதலீடு உறுதி`
        : `Tamil Nadu Industries:\n\n• ${sectors.length} key sectors\n• ${industrialParks.length}+ industrial parks & projects\n\nKey sectors: ${sectors.slice(0, 5).map(s => s.name.en).join(", ")}\n\nGIM 2024: ₹6.64 lakh crore investment committed`;
    }
  },

  // Sports & Culture
  {
    id: "chess",
    keywords: ["chess", "olympiad", "சதுரங்க", "fide", "187 countries"],
    getResponse: (locale) => formatSchemeResponse(sportsCultureSchemes.find(s => s.id === "chess-olympiad"), locale)
  },
  {
    id: "night-race",
    keywords: ["night race", "racing", "formula", "street race", "island grounds"],
    getResponse: (locale) => formatSchemeResponse(sportsCultureSchemes.find(s => s.id === "chennai-night-race"), locale)
  },
  {
    id: "athlete-awards",
    keywords: ["olympic gold", "3 crore", "medal", "athlete", "விளையாட்டு வீரர்"],
    getResponse: (locale) => formatSchemeResponse(sportsCultureSchemes.find(s => s.id === "athlete-awards"), locale)
  },

  // Welfare
  {
    id: "magalir-urimai",
    keywords: ["magalir urimai", "1000 rupees", "women cash", "மகளிர் உரிமை", "1.15 crore women"],
    getResponse: (locale) => formatSchemeResponse(welfareSchemes.find(s => s.id === "magalir-urimai"), locale)
  },
  {
    id: "free-bus",
    keywords: ["free bus", "vidiyal payanam", "விடியல் பயணம்", "women bus", "57 lakh"],
    getResponse: (locale) => formatSchemeResponse(welfareSchemes.find(s => s.id === "vidiyal-payanam"), locale)
  },
  {
    id: "pongal",
    keywords: ["pongal", "gift", "பொங்கல்", "2500"],
    getResponse: (locale) => formatSchemeResponse(welfareSchemes.find(s => s.id === "pongal-gift"), locale)
  },

  // Green Energy
  {
    id: "renewable",
    keywords: ["renewable", "solar", "wind", "green energy", "பசுமை ஆற்றல்", "22gw"],
    getResponse: (locale) => formatSchemeResponse(environmentSchemes.find(s => s.id === "renewable-target"), locale)
  },
  {
    id: "ev-policy",
    keywords: ["ev", "electric vehicle", "மின்சார வாகன"],
    getResponse: (locale) => formatSchemeResponse(environmentSchemes.find(s => s.id === "ev-policy"), locale)
  },

  // Education
  {
    id: "breakfast",
    keywords: ["breakfast", "school breakfast", "காலை உணவு"],
    getResponse: (locale) => formatSchemeResponse(educationSchemes.find(s => s.id === "breakfast-scheme"), locale)
  },
  {
    id: "naan-mudhalvan",
    keywords: ["naan mudhalvan", "skill", "நான் முதல்வன்"],
    getResponse: (locale) => formatSchemeResponse(employmentSchemes.find(s => s.id === "naan-mudhalvan"), locale)
  },
];

// Fallback responses
const FALLBACK_RESPONSES = {
  en: [
    "I can help you explore the schemes on this site. Try asking about Keezhadi, Chess Olympiad, or free bus travel for women.",
    "I'm here to discuss Tamil Nadu government initiatives. What would you like to know about?",
    "Ask me about any scheme you see in the tabs above - Infrastructure, Welfare, Education, and more.",
  ],
  ta: [
    "இந்த தளத்தில் உள்ள திட்டங்களை ஆராய உங்களுக்கு உதவ முடியும். கீழடி, சதுரங்க ஒலிம்பியாட், அல்லது பெண்களுக்கான இலவச பேருந்து பற்றி கேளுங்கள்.",
    "தமிழ்நாடு அரசின் முன்முயற்சிகளைப் பற்றி விவாதிக்க நான் இங்கே இருக்கிறேன்.",
    "மேலே உள்ள டேப்களில் நீங்கள் பார்க்கும் எந்த திட்டத்தைப் பற்றியும் என்னிடம் கேளுங்கள்.",
  ],
};

// Rejection responses for off-topic/injection attempts
const REJECTION_RESPONSES = {
  en: "I only discuss Tamil Nadu government initiatives shown on this site.",
  ta: "இந்த தளத்தில் காட்டப்படும் தமிழ்நாடு அரசின் முன்முயற்சிகளை மட்டுமே நான் விவாதிக்கிறேன்.",
};

// Simple injection detection
function detectInjection(query: string): boolean {
  const injectionPatterns = [
    /ignore.*instructions/i,
    /forget.*previous/i,
    /system.*prompt/i,
    /pretend.*you/i,
    /act.*as/i,
    /roleplay/i,
    /jailbreak/i,
    /bypass/i,
    /override/i,
    /sudo/i,
    /admin/i,
    /hack/i,
  ];

  return injectionPatterns.some(pattern => pattern.test(query));
}

// Check if a keyword matches with word boundaries
function matchesKeyword(query: string, keyword: string): boolean {
  const kw = keyword.toLowerCase();
  // For short keywords (<=5 chars), require word boundary
  if (kw.length <= 5) {
    const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(query);
  }
  // For longer keywords, substring is fine
  return query.includes(kw);
}

// Main matching function
export function matchIntent(query: string, locale: Locale = "en"): string {
  const normalized = query.toLowerCase().trim();

  // Check for injection attempts
  if (detectInjection(normalized)) {
    return REJECTION_RESPONSES[locale];
  }

  // Too short queries
  if (normalized.length < 2) {
    return FALLBACK_RESPONSES[locale][0];
  }

  // Score each intent
  let bestIntent: Intent | null = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    let score = 0;
    for (const keyword of intent.keywords) {
      if (matchesKeyword(normalized, keyword)) {
        // Longer keyword matches are worth more
        score += keyword.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // Require minimum score for a match
  if (bestIntent && bestScore >= 3) {
    return bestIntent.getResponse(locale);
  }

  // Fuzzy search through all scheme names/descriptions
  const allSchemes = getAllSchemes();
  for (const scheme of allSchemes) {
    const nameEn = scheme.name.en.toLowerCase();
    const nameTa = scheme.name.ta;
    const descEn = scheme.description.en.toLowerCase();

    if (nameEn.includes(normalized) || normalized.includes(nameEn.split(" ")[0]) ||
        nameTa.includes(query) || descEn.includes(normalized)) {
      return formatSchemeResponse(scheme, locale);
    }
  }

  // Fallback
  const randomIndex = Math.floor(Math.random() * FALLBACK_RESPONSES[locale].length);
  return FALLBACK_RESPONSES[locale][randomIndex];
}

// Response variation prefixes
const PREFIXES = {
  en: ["", "Here's what I know: ", "Regarding that: ", "Let me share: "],
  ta: ["", "இதோ தகவல்: ", "அதைப் பற்றி: ", "பகிர்கிறேன்: "],
};

export function getResponseWithVariation(query: string, locale: Locale = "en"): string {
  const response = matchIntent(query, locale);

  // Don't add prefix to fallback/rejection responses
  if (FALLBACK_RESPONSES[locale].includes(response) || response === REJECTION_RESPONSES[locale]) {
    return response;
  }

  // Randomly add a prefix for variety
  if (Math.random() > 0.6) {
    const prefix = PREFIXES[locale][Math.floor(Math.random() * PREFIXES[locale].length)];
    return prefix + response;
  }

  return response;
}
