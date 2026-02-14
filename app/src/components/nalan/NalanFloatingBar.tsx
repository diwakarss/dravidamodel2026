"use client";

import { useState, useEffect } from "react";
import { NalanModal } from "./NalanModal";

interface NalanFloatingBarProps {
  locale: string;
}

const COLLAPSED_KEY = "nalan_bar_collapsed";

export function NalanFloatingBar({ locale }: NalanFloatingBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(COLLAPSED_KEY);
      if (stored === "true") {
        setIsCollapsed(true);
        setHasAutoCollapsed(true);
      }
    }
  }, []);

  // Auto-collapse after 5 seconds on first visit
  useEffect(() => {
    if (!hasAutoCollapsed && !isCollapsed) {
      const timer = setTimeout(() => {
        setIsCollapsed(true);
        setHasAutoCollapsed(true);
        localStorage.setItem(COLLAPSED_KEY, "true");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasAutoCollapsed, isCollapsed]);

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCollapsed(true);
    localStorage.setItem(COLLAPSED_KEY, "true");
  };

  const handleExpand = () => {
    if (isCollapsed) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      {/* Collapsed State - Small circle icon in bottom-left */}
      {isCollapsed && (
        <button
          type="button"
          onClick={handleExpand}
          className="fixed bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center border border-slate-700"
          style={{ zIndex: 9999 }}
          aria-label={locale === "ta" ? "நளன் உதவியாளர்" : "NalaN Assistant"}
        >
          <span className="text-lg font-bold">N</span>
        </button>
      )}

      {/* Expanded State - Full bar */}
      {!isCollapsed && (
        <div
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 pl-4 pr-1 py-1.5 bg-slate-900 text-white rounded-full shadow-lg"
          style={{ zIndex: 9999 }}
        >
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {locale === "ta" ? (
              <>
                <span className="text-red-400">❤️</span>
                <span className="text-sm font-medium">உடன் உருவாக்கியது நளன்</span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">Made with</span>
                <span className="text-red-400">❤️</span>
                <span className="text-sm font-medium">by NalaN</span>
              </>
            )}
            <span className="ml-1 text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
          </button>

          {/* Close/Collapse button */}
          <button
            type="button"
            onClick={handleCollapse}
            className="ml-2 p-1.5 rounded-full hover:bg-slate-700 transition-colors"
            aria-label={locale === "ta" ? "மூடு" : "Close"}
          >
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Modal */}
      <NalanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locale={locale}
      />
    </>
  );
}
