"use client";

import { SchemesGrid } from "@/components/schemes";
import { welfareSchemes, getWelfareStats } from "@/lib/data/socialWelfare";

interface WelfareTabProps {
  locale: string;
}

export function WelfareTab({ locale }: WelfareTabProps) {
  const stats = getWelfareStats();

  return (
    <div className="h-full flex flex-col">
      {/* Mobile Stats Bar */}
      <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-display text-base font-bold truncate">
              {locale === "ta" ? "நலத்திட்டம்" : "Welfare"}
            </h2>
          </div>
          <div className="flex items-center gap-3 text-right flex-shrink-0">
            <div>
              <p className="text-lg font-bold">1.3 Cr</p>
              <p className="text-xs text-purple-200">{locale === "ta" ? "மகளிர்" : "Women"}</p>
            </div>
            <div className="w-px h-8 bg-purple-400" />
            <div>
              <p className="text-lg font-bold">₹13K Cr</p>
              <p className="text-xs text-purple-200">{locale === "ta" ? "பட்ஜெட்" : "Budget"}</p>
            </div>
            <div className="w-px h-8 bg-purple-400" />
            <div>
              <p className="text-lg font-bold">34K</p>
              <p className="text-xs text-purple-200">{locale === "ta" ? "கடைகள்" : "PDS"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Stats Bar */}
      <div className="hidden md:block flex-shrink-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h2 className="font-display text-2xl font-bold">
              {locale === "ta" ? "சமூக நலத் திட்டங்கள்" : "Social Welfare Schemes"}
            </h2>
            <p className="text-purple-100 text-base mt-1">
              {locale === "ta"
                ? "அனைவருக்கும் சமூகப் பாதுகாப்பு"
                : "Social security for all citizens"}
            </p>
          </div>
          <div className="flex gap-10 text-right">
            <div>
              <p className="text-3xl font-bold">1.31 Crore</p>
              <p className="text-base text-purple-100">
                {locale === "ta" ? "மகளிர் பயனாளிகள்" : "Women Beneficiaries"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">₹13,027 Cr</p>
              <p className="text-base text-purple-100">
                {locale === "ta" ? "மகளிர் திட்ட பட்ஜெட்" : "Magalir Budget"}
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.pdsShops.toLocaleString()}</p>
              <p className="text-base text-purple-100">
                {locale === "ta" ? "ரேஷன் கடைகள்" : "PDS Shops"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <SchemesGrid schemes={welfareSchemes} locale={locale} />
      </div>
    </div>
  );
}
