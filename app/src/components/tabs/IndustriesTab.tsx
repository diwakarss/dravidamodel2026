"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  industrialParks,
  sectors,
  companyInvestments,
  getIndustriesStats,
  industriesSummary,
  type IndustrialPark,
} from "@/lib/data/industries";
import { MobileIndustriesStats } from "@/components/industries/MobileIndustriesStats";
import { cn } from "@/lib/utils/cn";

// Dynamic import for the map (no SSR)
const IndustriesMap = dynamic(
  () => import("@/components/map/IndustriesMap").then((mod) => mod.IndustriesMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-slate-100 animate-pulse flex items-center justify-center">
        <span className="text-slate-500">Loading map...</span>
      </div>
    ),
  }
);

// Sector icons (same as IndustriesMap)
const SECTOR_ICONS: Record<string, string> = {
  electronics: "M9 3v1H4v2h1v11H4v2h16v-2h-1V6h1V4h-5V3H9zm10 4v10H5V7h14zM9 9v2h6V9H9zm0 4v2h6v-2H9z",
  automobile: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
  textiles: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z",
  footwear: "M21.5 9.5c-.28 0-.55.04-.8.13l-6.52 1.49c-.63.17-1.38.38-2.18.38-.8 0-1.55-.21-2.18-.38L3.3 9.63c-.25-.09-.52-.13-.8-.13C1.12 9.5 0 10.62 0 12c0 .78.26 1.47.7 2H.5c-.28 0-.5.22-.5.5v3c0 .28.22.5.5.5h23c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5h-.2c.44-.53.7-1.22.7-2 0-1.38-1.12-2.5-2.5-2.5z",
  renewable: "M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z",
  pharma: "M6 3h12v2H6V3zm11 4H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm-1 9h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z",
  it: "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10z",
  semiconductor: "M9 3v1H4v2h1v11H4v2h16v-2h-1V6h1V4h-5V3H9zm10 4v10H5V7h14zM9 9v2h6V9H9zm0 4v2h6v-2H9z",
};

interface IndustriesTabProps {
  locale: string;
}

export function IndustriesTab({ locale }: IndustriesTabProps) {
  const stats = getIndustriesStats();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedPark, setSelectedPark] = useState<IndustrialPark | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Filter industrial parks by sector
  const filteredParks = selectedSector
    ? industrialParks.filter((park) =>
        park.sector.some((s) => s.toLowerCase().includes(selectedSector.toLowerCase()))
      )
    : industrialParks;

  const handleParkSelect = useCallback((park: IndustrialPark, clickPos: { x: number; y: number }) => {
    setSelectedPark(park);
    setPopupPosition(clickPos);
  }, []);

  // Calculate adjusted popup position
  const popupStyle = useCallback(() => {
    if (!popupPosition || !mapContainerRef.current) {
      return { display: "none" };
    }

    const container = mapContainerRef.current.getBoundingClientRect();
    const popupWidth = 340;
    const popupHeight = 320;

    let x = popupPosition.x + 24;
    let y = popupPosition.y - 20;

    // Adjust if overflow right
    if (x + popupWidth > container.width - 16) {
      x = popupPosition.x - popupWidth - 24;
    }
    // Adjust if overflow left
    if (x < 16) {
      x = 16;
    }
    // Adjust if overflow bottom
    if (y + popupHeight > container.height - 16) {
      y = container.height - popupHeight - 16;
    }
    // Adjust if overflow top
    if (y < 16) {
      y = 16;
    }

    return {
      top: y,
      left: x,
      display: "block",
    };
  }, [popupPosition]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-72px)] overflow-hidden">
      {/* Mobile: Stats bar at top */}
      <div className="lg:hidden">
        <MobileIndustriesStats locale={locale} />
      </div>

      {/* Mobile: Collapsible sector filters */}
      <div className="lg:hidden border-b border-slate-200">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 text-sm font-semibold text-slate-800"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {locale === "ta" ? "துறைகள்" : "Sectors"}
            {selectedSector && (
              <span className="bg-teal-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                1
              </span>
            )}
          </span>
          <svg
            className={cn("w-4 h-4 transition-transform", filtersOpen && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {filtersOpen && (
          <div className="px-4 py-3 bg-white border-t border-slate-100 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">
                {locale === "ta" ? "துறை மூலம் வடிகட்டு" : "Filter by sector"}
              </span>
              {selectedSector && (
                <button
                  type="button"
                  onClick={() => setSelectedSector(null)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-semibold"
                >
                  {locale === "ta" ? "அழி" : "Clear"}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() =>
                    setSelectedSector(selectedSector === sector.id ? null : sector.id)
                  }
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                    selectedSector === sector.id
                      ? "border-teal-500 bg-teal-50 text-teal-800"
                      : "border-slate-200 bg-white text-slate-700"
                  )}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ backgroundColor: sector.color }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d={SECTOR_ICONS[sector.id] || SECTOR_ICONS.electronics} />
                    </svg>
                  </div>
                  {locale === "ta" ? sector.name.ta : sector.name.en}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Left sidebar - Sector filters */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
        {/* Sector Filters */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900">
              {locale === "ta" ? "துறைகள்" : "Sectors"}
            </h3>
            {selectedSector && (
              <button
                type="button"
                onClick={() => setSelectedSector(null)}
                className="text-sm text-teal-700 hover:text-teal-800 font-bold"
              >
                {locale === "ta" ? "அழி" : "Clear"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                type="button"
                onClick={() =>
                  setSelectedSector(selectedSector === sector.id ? null : sector.id)
                }
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg border transition-colors",
                  selectedSector === sector.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: sector.color }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d={SECTOR_ICONS[sector.id] || SECTOR_ICONS.electronics} />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      {locale === "ta" ? sector.name.ta : sector.name.en}
                    </span>
                    <p className="text-sm text-slate-700">{sector.status}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Center: Map */}
      <main ref={mapContainerRef} className="flex-1 relative min-h-0">
        <IndustriesMap
          parks={filteredParks}
          locale={locale}
          onParkSelect={handleParkSelect}
          className="h-full w-full"
        />

        {/* Parks count indicator - top right to avoid zoom controls */}
        <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-slate-200">
          <p className="text-base text-slate-800 font-semibold">
            {filteredParks.length} {locale === "ta" ? "திட்டங்கள்" : "projects"}
          </p>
        </div>

        {/* Selected Park Popup */}
        {selectedPark && popupPosition && (
          <div
            ref={popupRef}
            className="absolute z-[1001] bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-[340px]"
            style={popupStyle()}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedPark(null);
                setPopupPosition(null);
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {selectedPark.company && (
              <p className="text-xs text-teal-700 font-semibold mb-1">{selectedPark.company}</p>
            )}
            <h3 className="font-semibold text-navy-900 pr-8 text-base">{selectedPark.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{selectedPark.location}, {selectedPark.district}</p>

            {selectedPark.notes && (
              <p className="text-sm text-slate-700 mt-2 leading-relaxed line-clamp-3">{selectedPark.notes}</p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-3">
              {selectedPark.sector.slice(0, 3).map((s) => (
                <span key={s} className="text-sm bg-slate-100 text-slate-800 px-2 py-1 rounded font-medium">
                  {s}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              {selectedPark.investmentCrore && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-sm text-amber-800 font-medium">Investment</p>
                  <p className="text-lg font-bold text-amber-900">₹{selectedPark.investmentCrore.toLocaleString()} Cr</p>
                </div>
              )}
              {selectedPark.jobsCreated && (
                <div className="bg-teal-50 rounded-lg p-3">
                  <p className="text-sm text-teal-800 font-medium">Jobs Created</p>
                  <p className="text-lg font-bold text-teal-900">{selectedPark.jobsCreated.toLocaleString()}</p>
                </div>
              )}
            </div>

            {selectedPark.area && (
              <p className="text-sm text-slate-700 mt-3">
                Area: <span className="font-semibold text-slate-900">{selectedPark.area}</span>
              </p>
            )}

            <div className="flex items-center justify-between mt-4">
              <span
                className={cn(
                  "text-sm px-3 py-1.5 rounded-full font-semibold",
                  selectedPark.status === "operational"
                    ? "bg-green-100 text-green-800"
                    : selectedPark.status === "announced"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-amber-100 text-amber-800"
                )}
              >
                {selectedPark.status === "operational"
                  ? "Operational"
                  : selectedPark.status === "announced"
                    ? "Announced"
                    : "Under Construction"}
              </span>
              {selectedPark.year && (
                <span className="text-sm text-slate-700 font-medium">Year: {selectedPark.year}</span>
              )}
            </div>

            {selectedPark.source && (
              <a
                href={selectedPark.source}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-800 font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Source
              </a>
            )}
          </div>
        )}
      </main>

      {/* Right: Stats Panel (Desktop only) */}
      <aside className="hidden lg:block w-72 flex-shrink-0 bg-white border-l border-slate-200 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
          <h2 className="font-display text-xl font-bold">
            {locale === "ta" ? "முதலீட்டு சுருக்கம்" : "Investment Summary"}
          </h2>
          <p className="text-slate-200 text-sm mt-1">
            {locale === "ta" ? "புதுப்பிப்பு: பிப்ரவரி 2026" : "Updated: Feb 2026"}
          </p>
        </div>

        {/* Key Stats */}
        <div className="p-4 space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-base text-amber-700 font-semibold">GIM 2024</p>
            <p className="text-2xl font-bold text-slate-900">₹6.64 Lakh Cr</p>
            <p className="text-base text-slate-700">{industriesSummary.gim2024MoUs} MoUs signed</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-base text-purple-700 font-semibold">2025 TN Rising</p>
            <p className="text-2xl font-bold text-slate-900">₹1.53 Lakh Cr</p>
            <p className="text-base text-slate-700">{industriesSummary.investment2025MoUs} MoUs (4 conclaves)</p>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-base text-teal-700 font-semibold">Total Committed</p>
            <p className="text-2xl font-bold text-slate-900">₹8.17 Lakh Cr</p>
            <p className="text-base text-slate-700">{industriesSummary.totalMoUs} MoUs • {industriesSummary.mouConversionRate}% conversion</p>
          </div>

          <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
            <p className="text-base text-sky-700 font-semibold">Jobs Promised</p>
            <p className="text-2xl font-bold text-slate-900">28.9 Lakh</p>
            <p className="text-base text-slate-700">Direct + Indirect employment</p>
          </div>
        </div>

        {/* Project Stats / Legend */}
        <div className="p-4 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-3">
            {locale === "ta" ? "திட்ட நிலை" : "Project Status"}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-600" />
                <span className="text-sm font-medium text-slate-800">Operational</span>
              </div>
              <span className="text-lg font-bold text-green-700">{stats.operationalParks}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-amber-600" />
                <span className="text-sm font-medium text-slate-800">Under Construction</span>
              </div>
              <span className="text-lg font-bold text-amber-700">{stats.underConstructionParks}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-blue-600" />
                <span className="text-sm font-medium text-slate-800">Announced</span>
              </div>
              <span className="text-lg font-bold text-blue-700">{stats.announcedParks}</span>
            </div>
          </div>
        </div>

        {/* Investment on Map */}
        <div className="p-4 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-3">
            {locale === "ta" ? "வரைபடத்தில்" : "On This Map"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-100 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-slate-900">₹{(stats.totalInvestment / 100000).toFixed(2)} L Cr</p>
              <p className="text-base text-slate-700">Investment</p>
            </div>
            <div className="bg-slate-100 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-slate-900">{(stats.totalJobs / 100000).toFixed(1)} Lakh</p>
              <p className="text-base text-slate-700">Jobs</p>
            </div>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="p-4 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-3">
            {locale === "ta" ? "முக்கிய குறிப்புகள்" : "Key Highlights"}
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">▸</span>
              <span className="text-slate-700">Electronics exports: <span className="font-bold text-slate-900">${industriesSummary.electronicsExports2025}B</span> (2025)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">▸</span>
              <span className="text-slate-700">EV production share: <span className="font-bold text-slate-900">{industriesSummary.evProductionShare}%</span> of India</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">▸</span>
              <span className="text-slate-700">SIPCOT land bank: <span className="font-bold text-slate-900">{industriesSummary.sipcotLandBank}</span></span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-teal-600 font-bold">▸</span>
              <span className="text-slate-700">Vision: <span className="font-bold text-slate-900">{industriesSummary.policyTarget}</span></span>
            </div>
          </div>
        </div>

        {/* Top Investments */}
        <div className="p-4 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-3">
            {locale === "ta" ? "முக்கிய முதலீடுகள்" : "Top Investments"}
          </h3>
          <div className="space-y-2">
            {companyInvestments
              .filter((inv) => inv.investmentCrore)
              .sort((a, b) => (b.investmentCrore || 0) - (a.investmentCrore || 0))
              .slice(0, 5)
              .map((inv) => (
                <div
                  key={inv.id}
                  className="bg-slate-50 rounded-lg p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => {
                    if (inv.coordinates) {
                      setSelectedPark(inv);
                      setPopupPosition({ x: 200, y: 200 });
                    }
                  }}
                >
                  <p className="font-semibold text-slate-900 truncate">{inv.company}</p>
                  <div className="flex justify-between text-sm text-slate-700 mt-1">
                    <span className="truncate">{inv.district}</span>
                    <span className="font-bold text-amber-700 whitespace-nowrap ml-2">
                      ₹{(inv.investmentCrore! / 1000).toFixed(1)}K Cr
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
