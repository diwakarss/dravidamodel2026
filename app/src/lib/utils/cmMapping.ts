/**
 * Chief Minister mapping for Tamil Nadu (1989-present)
 * Used to display CM photos based on project start/completion years
 *
 * Note: For 2021 transition year, Stalin is used since he took office in May 2021
 * and most project announcements that year were after the election.
 */

export interface ChiefMinister {
  id: string;
  name: {
    en: string;
    ta: string;
  };
  party: string;
  photoUrl: string;
  tenures: Array<{
    startYear: number;
    startMonth: number; // 1-12
    endYear: number | null;
    endMonth: number | null; // null = current
  }>;
}

export const CHIEF_MINISTERS: ChiefMinister[] = [
  {
    id: "karunanidhi",
    name: {
      en: "M. Karunanidhi",
      ta: "மு. கருணாநிதி",
    },
    party: "DMK",
    photoUrl: "/images/cms/karunanidhi.jpg",
    tenures: [
      { startYear: 1989, startMonth: 1, endYear: 1991, endMonth: 6 },
      { startYear: 1996, startMonth: 5, endYear: 2001, endMonth: 5 },
      { startYear: 2006, startMonth: 5, endYear: 2011, endMonth: 5 },
    ],
  },
  {
    id: "jayalalithaa",
    name: {
      en: "J. Jayalalithaa",
      ta: "ஜெ. ஜெயலலிதா",
    },
    party: "AIADMK",
    photoUrl: "/images/cms/jayalalithaa.jpg",
    tenures: [
      { startYear: 1991, startMonth: 6, endYear: 1996, endMonth: 5 },
      { startYear: 2001, startMonth: 5, endYear: 2006, endMonth: 5 },
      { startYear: 2011, startMonth: 5, endYear: 2016, endMonth: 12 },
    ],
  },
  {
    id: "panneerselvam",
    name: {
      en: "O. Panneerselvam",
      ta: "ஓ. பன்னீர்செல்வம்",
    },
    party: "AIADMK",
    photoUrl: "/images/cms/panneerselvam.jpg",
    tenures: [
      { startYear: 2016, startMonth: 12, endYear: 2017, endMonth: 2 },
    ],
  },
  {
    id: "palaniswami",
    name: {
      en: "Edappadi K. Palaniswami",
      ta: "எடப்பாடி கே. பழனிசாமி",
    },
    party: "AIADMK",
    photoUrl: "/images/cms/palaniswami.jpg",
    tenures: [
      { startYear: 2017, startMonth: 2, endYear: 2021, endMonth: 5 },
    ],
  },
  {
    id: "stalin",
    name: {
      en: "M.K. Stalin",
      ta: "மு.க. ஸ்டாலின்",
    },
    party: "DMK",
    photoUrl: "/images/cms/stalin.jpg",
    tenures: [
      { startYear: 2021, startMonth: 5, endYear: null, endMonth: null },
    ],
  },
];

/**
 * Get the Chief Minister for a given year (and optional month)
 * For year-only queries, uses mid-year (June) as default
 */
export function getCMForYear(year: number, month: number = 6): ChiefMinister | null {
  const queryDate = year * 100 + month; // YYYYMM format for easy comparison

  for (const cm of CHIEF_MINISTERS) {
    for (const tenure of cm.tenures) {
      const startDate = tenure.startYear * 100 + tenure.startMonth;
      const endDate = tenure.endYear
        ? tenure.endYear * 100 + (tenure.endMonth ?? 12)
        : new Date().getFullYear() * 100 + (new Date().getMonth() + 1);

      if (queryDate >= startDate && queryDate <= endDate) {
        return cm;
      }
    }
  }
  return null;
}

/**
 * Get CM info for project initiation and completion
 * For 2021, defaults to Stalin (May onwards) unless we have month data
 */
export function getProjectCMs(
  startYear: number,
  completionYear: number | null
): {
  initiation: ChiefMinister | null;
  completion: ChiefMinister | null;
} {
  // For 2021, assume post-May (Stalin era) since most projects announced then
  const startMonth = startYear === 2021 ? 6 : 6;
  const completionMonth = completionYear === 2021 ? 6 : 6;

  return {
    initiation: getCMForYear(startYear, startMonth),
    completion: completionYear ? getCMForYear(completionYear, completionMonth) : null,
  };
}

/**
 * Get CM photo URL for a year, with fallback
 */
export function getCMPhotoForYear(year: number): string | null {
  const cm = getCMForYear(year);
  return cm?.photoUrl ?? null;
}

/**
 * Get localized CM name for a year
 */
export function getCMNameForYear(
  year: number,
  locale: string
): string | null {
  const cm = getCMForYear(year);
  if (!cm) return null;
  return locale === "ta" ? cm.name.ta : cm.name.en;
}
