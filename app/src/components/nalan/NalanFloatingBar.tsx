"use client";

import { useState } from "react";
import { NalanModal } from "./NalanModal";

interface NalanFloatingBarProps {
  locale: string;
}

export function NalanFloatingBar({ locale }: NalanFloatingBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Bar */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full shadow-lg hover:bg-slate-800 transition-all hover:scale-105 group"
        style={{ zIndex: 9999, cursor: 'pointer', pointerEvents: 'auto' }}
      >
        {locale === "ta" ? (
          <>
            <span className="text-red-400 group-hover:scale-110 transition-transform">❤️</span>
            <span className="text-sm font-medium">உடன் உருவாக்கியது நளன்</span>
          </>
        ) : (
          <>
            <span className="text-sm font-medium">Made with</span>
            <span className="text-red-400 group-hover:scale-110 transition-transform">❤️</span>
            <span className="text-sm font-medium">by NalaN</span>
          </>
        )}
        <span className="ml-1 text-slate-400 group-hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </span>
      </button>

      {/* Modal */}
      <NalanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        locale={locale}
      />
    </>
  );
}
