"use client";

import { useState, useEffect } from "react";
import { Header, type TabId } from "@/components/layout/Header";
import { DashboardLayout } from "@/components/dashboard";
import {
  IndustriesTab,
  EducationTab,
  HealthcareTab,
  WelfareTab,
  EmploymentTab,
  HistoryTab,
  AgricultureTab,
  EnvironmentTab,
  SportsTab,
} from "@/components/tabs";
import { NalanFloatingBar } from "@/components/nalan";

const VALID_TABS: TabId[] = ["infrastructure", "industries", "education", "healthcare", "welfare", "employment", "history", "agriculture", "environment", "sports"];

function getTabFromHash(): TabId {
  if (typeof window === "undefined") return "infrastructure";
  const hash = window.location.hash.replace("#", "");
  return VALID_TABS.includes(hash as TabId) ? (hash as TabId) : "infrastructure";
}

interface HomePageClientProps {
  locale: string;
}

export function HomePageClient({ locale }: HomePageClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("infrastructure");

  // Initialize from hash on mount
  useEffect(() => {
    setActiveTab(getTabFromHash());

    // Listen for hash changes (e.g., browser back/forward)
    const handleHashChange = () => setActiveTab(getTabFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update hash when tab changes
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <>
      <div id="main-content" className="min-h-screen bg-slate-50 flex flex-col">
        <Header locale={locale} activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="flex-1 overflow-hidden">
          {activeTab === "infrastructure" && <DashboardLayout locale={locale} />}
          {activeTab === "industries" && <IndustriesTab locale={locale} />}
          {activeTab === "education" && <EducationTab locale={locale} />}
          {activeTab === "healthcare" && <HealthcareTab locale={locale} />}
          {activeTab === "welfare" && <WelfareTab locale={locale} />}
          {activeTab === "employment" && <EmploymentTab locale={locale} />}
          {activeTab === "history" && <HistoryTab locale={locale} />}
          {activeTab === "agriculture" && <AgricultureTab locale={locale} />}
          {activeTab === "environment" && <EnvironmentTab locale={locale} />}
          {activeTab === "sports" && <SportsTab locale={locale} />}
        </div>
      </div>

      {/* NalaN Floating Bar - outside main container to avoid overflow clipping */}
      <NalanFloatingBar locale={locale} />
    </>
  );
}
