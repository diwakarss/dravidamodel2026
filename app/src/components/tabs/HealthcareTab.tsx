"use client";

import { SchemesGrid } from "@/components/schemes";
import { healthcareSchemes, getHealthcareStats } from "@/lib/data/healthcare";

interface HealthcareTabProps {
  locale: string;
}

export function HealthcareTab({ locale }: HealthcareTabProps) {
  const stats = getHealthcareStats();

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Stats Bar */}
      <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold truncate">
              {locale === "ta" ? "சுகாதாரம்" : "Healthcare"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold">1.5 Cr</p>
              <p className="text-xs text-emerald-200">{locale === "ta" ? "குடும்பங்கள்" : "Families"}</p>
            </div>
            <div className="w-px h-8 bg-emerald-400" />
            <div>
              <p className="text-lg font-bold">{stats.ambulanceFleet}</p>
              <p className="text-xs text-emerald-200">{locale === "ta" ? "ஆம்புலன்ஸ்" : "Ambulances"}</p>
            </div>
            <div className="w-px h-8 bg-emerald-400" />
            <div>
              <p className="text-lg font-bold">{stats.newMedicalColleges}</p>
              <p className="text-xs text-emerald-200">{locale === "ta" ? "கல்லூரிகள்" : "Colleges"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden md:block flex-shrink-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {locale === "ta" ? "சுகாதாரத் திட்டங்கள்" : "Healthcare Schemes"}
            </h2>
            <p className="text-emerald-100 text-base mt-1">
              {locale === "ta"
                ? "மக்கள் நலத்திற்கான சுகாதார முன்னெடுப்புகள்"
                : "Public health initiatives for the people"}
            </p>
          </div>
          <div className="flex gap-10 text-right">
            <div>
              <p className="text-3xl font-bold">1.5 Crore</p>
              <p className="text-base text-emerald-100">
                {locale === "ta" ? "காப்பீடு குடும்பங்கள்" : "Insured Families"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.ambulanceFleet}</p>
              <p className="text-base text-emerald-100">
                {locale === "ta" ? "ஆம்புலன்ஸ்கள்" : "Ambulances"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.newMedicalColleges}</p>
              <p className="text-base text-emerald-100">
                {locale === "ta" ? "புதிய மருத்துவக் கல்லூரிகள்" : "New Medical Colleges"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <SchemesGrid schemes={healthcareSchemes} locale={locale} />
      </div>
    </div>
  );
}
