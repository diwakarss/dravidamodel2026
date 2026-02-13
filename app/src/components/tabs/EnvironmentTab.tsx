"use client";

import { SchemesGrid } from "@/components/schemes";
import { environmentSchemes, getEnvironmentStats } from "@/lib/data/environment";

interface EnvironmentTabProps {
  locale: string;
}

export function EnvironmentTab({ locale }: EnvironmentTabProps) {
  const stats = getEnvironmentStats();

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Stats Bar */}
      <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold truncate">
              {locale === "ta" ? "பசுமை ஆற்றல்" : "Green Energy"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold">{stats.renewableGW}GW</p>
              <p className="text-xs text-teal-200">{locale === "ta" ? "நிறுவியது" : "Installed"}</p>
            </div>
            <div className="w-px h-8 bg-teal-400" />
            <div>
              <p className="text-lg font-bold">+{stats.targetGW}GW</p>
              <p className="text-xs text-teal-200">{locale === "ta" ? "இலக்கு" : "Target"}</p>
            </div>
            <div className="w-px h-8 bg-teal-400" />
            <div>
              <p className="text-lg font-bold">#1</p>
              <p className="text-xs text-teal-200">{locale === "ta" ? "காற்றாலை" : "Wind"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden md:block flex-shrink-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {locale === "ta" ? "பசுமை ஆற்றல் & சுற்றுச்சூழல்" : "Green Energy & Environment"}
            </h2>
            <p className="text-teal-100 text-base mt-1">
              {locale === "ta"
                ? "நிலையான எதிர்காலத்தை நோக்கி"
                : "Towards a sustainable future"}
            </p>
          </div>
          <div className="flex gap-10 text-right">
            <div>
              <p className="text-3xl font-bold">{stats.renewableGW}GW+</p>
              <p className="text-base text-teal-100">
                {locale === "ta" ? "புதுப்பிக்கத்தக்க திறன்" : "Renewable Capacity"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">+{stats.targetGW}GW</p>
              <p className="text-base text-teal-100">
                {locale === "ta" ? "2030 இலக்கு" : "2030 Target"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">#1</p>
              <p className="text-base text-teal-100">
                {locale === "ta" ? "காற்றாலை மாநிலம்" : "Wind Energy State"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <SchemesGrid schemes={environmentSchemes} locale={locale} />
      </div>
    </div>
  );
}
