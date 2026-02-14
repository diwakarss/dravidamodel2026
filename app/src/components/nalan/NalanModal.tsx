"use client";

import { useState, useRef, useEffect } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { getResponseWithVariation } from "@/lib/nalan/intents";

// hCaptcha site key - use test key in dev, real key in prod
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001";

interface NalanModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

type Tab = "chat" | "feedback";

interface Message {
  id: string;
  role: "user" | "nalan";
  content: string;
  timestamp: Date;
}

// Rate limiting with localStorage persistence
const RATE_LIMIT = {
  maxMessages: 20,
  windowMs: 60000, // 1 minute
  storageKey: 'nalan_chat_rate_limit',
};

interface RateLimitData {
  count: number;
  resetAt: number;
}

function getRateLimitData(): RateLimitData {
  if (typeof window === 'undefined') return { count: 0, resetAt: Date.now() + RATE_LIMIT.windowMs };
  try {
    const stored = localStorage.getItem(RATE_LIMIT.storageKey);
    if (stored) {
      const data = JSON.parse(stored) as RateLimitData;
      if (Date.now() < data.resetAt) {
        return data;
      }
    }
  } catch {
    // Ignore localStorage errors
  }
  return { count: 0, resetAt: Date.now() + RATE_LIMIT.windowMs };
}

function setRateLimitData(data: RateLimitData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RATE_LIMIT.storageKey, JSON.stringify(data));
  } catch {
    // Ignore localStorage errors
  }
}

export function NalanModal({ isOpen, onClose, locale }: NalanModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<HCaptcha>(null);

  // Load rate limit from localStorage on mount
  useEffect(() => {
    const data = getRateLimitData();
    setMessageCount(data.count);
    setRateLimited(data.count >= RATE_LIMIT.maxMessages);
  }, []);

  // Check and reset rate limit periodically
  useEffect(() => {
    const checkRateLimit = () => {
      const data = getRateLimitData();
      if (Date.now() >= data.resetAt) {
        setMessageCount(0);
        setRateLimited(false);
        setRateLimitData({ count: 0, resetAt: Date.now() + RATE_LIMIT.windowMs });
      }
    };

    const interval = setInterval(checkRateLimit, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        role: "nalan",
        content: locale === "ta"
          ? "வணக்கம். நான் நளன். இந்த தளத்தில் உள்ள திட்டங்களைப் பற்றி என்னிடம் கேளுங்கள்."
          : "Hello. I am NalaN. Ask me about the schemes on this site.",
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, locale]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;

    // Rate limiting
    if (messageCount >= RATE_LIMIT.maxMessages) {
      setRateLimited(true);
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Update rate limit count with localStorage persistence
    const newCount = messageCount + 1;
    setMessageCount(newCount);
    const currentData = getRateLimitData();
    setRateLimitData({ count: newCount, resetAt: currentData.resetAt });

    // Simulate typing delay (1-2.5 seconds)
    setIsTyping(true);
    const typingDelay = 1000 + Math.random() * 1500;

    await new Promise(resolve => setTimeout(resolve, typingDelay));

    // Get response
    const response = getResponseWithVariation(trimmed, locale as "en" | "ta");

    const nalanMessage: Message = {
      id: `nalan-${Date.now()}`,
      role: "nalan",
      content: response,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, nalanMessage]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim() || !captchaToken || isSubmitting) return;

    setIsSubmitting(true);
    setFeedbackError(null);

    const apiUrl = process.env.NEXT_PUBLIC_FEEDBACK_API;

    // If no API configured, simulate success (dev mode)
    if (!apiUrl) {
      setFeedbackSent(true);
      setFeedbackMessage("");
      setFeedbackEmail("");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: feedbackMessage,
          email: feedbackEmail || undefined,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setFeedbackSent(true);
      setFeedbackMessage("");
      setFeedbackEmail("");
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
    } catch (error) {
      setFeedbackError(
        error instanceof Error ? error.message : 'Failed to submit. Please try again.'
      );
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 10000 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" style={{ zIndex: 10001 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm">
              N
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">NalaN</h2>
              <p className="text-xs text-slate-600">
                {locale === "ta" ? "திராவிட மாடல் உதவியாளர்" : "Dravida Model Assistant"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "chat"
                ? "text-slate-900 border-b-2 border-slate-900 bg-slate-100/50"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale === "ta" ? "கேள்வி கேளுங்கள்" : "Ask a Question"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("feedback")}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "feedback"
                ? "text-slate-900 border-b-2 border-slate-900 bg-slate-100/50"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {locale === "ta" ? "கருத்து தெரிவிக்க" : "Submit Feedback"}
          </button>
        </div>

        {/* Content */}
        {activeTab === "chat" ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-slate-800 text-white rounded-br-md"
                        : "bg-slate-100 text-slate-800 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Rate limit warning */}
            {rateLimited && (
              <div className="px-4 py-2 bg-amber-50 border-t border-amber-200">
                <p className="text-xs text-amber-700">
                  {locale === "ta"
                    ? "தயவுசெய்து சிறிது நேரம் காத்திருங்கள்..."
                    : "Please wait a moment before sending more messages..."}
                </p>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={locale === "ta" ? "உங்கள் கேள்வியை தட்டச்சு செய்க..." : "Type your question..."}
                  disabled={isTyping || rateLimited}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:opacity-50"
                  maxLength={500}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || rateLimited}
                  className="px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500 text-center">
                {locale === "ta"
                  ? "இந்த தளத்தில் உள்ள திட்டங்களைப் பற்றி மட்டுமே நளன் பதிலளிக்கும்"
                  : "NalaN only responds about schemes on this site"}
              </p>
            </div>
          </>
        ) : (
          /* Feedback Form */
          <div className="p-6 overflow-y-auto flex-1">
            {feedbackSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {locale === "ta" ? "நன்றி!" : "Thank you!"}
                </h3>
                <p className="text-slate-600">
                  {locale === "ta"
                    ? "உங்கள் கருத்து பதிவு செய்யப்பட்டது."
                    : "Your feedback has been recorded."}
                </p>
                <button
                  type="button"
                  onClick={() => setFeedbackSent(false)}
                  className="mt-4 text-sm text-slate-600 hover:text-slate-800"
                >
                  {locale === "ta" ? "மீண்டும் அனுப்ப" : "Send another"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-medium text-slate-700 mb-1.5">
                    {locale === "ta" ? "உங்கள் கருத்து" : "Your feedback"} *
                  </label>
                  <textarea
                    id="feedback-message"
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder={locale === "ta" ? "உங்கள் கருத்தை இங்கே எழுதுங்கள்..." : "Share your thoughts..."}
                    required
                    rows={4}
                    maxLength={2000}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
                  />
                </div>
                <div>
                  <label htmlFor="feedback-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    {locale === "ta" ? "மின்னஞ்சல் (விரும்பினால்)" : "Email (optional)"}
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    placeholder={locale === "ta" ? "பதில் வேண்டும் என்றால்..." : "If you'd like a response..."}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div className="flex justify-center">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={HCAPTCHA_SITE_KEY}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    languageOverride={locale === "ta" ? "ta" : "en"}
                  />
                </div>
                {feedbackError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700">{feedbackError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!feedbackMessage.trim() || !captchaToken || isSubmitting}
                  className="w-full py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {locale === "ta" ? "அனுப்புகிறது..." : "Submitting..."}
                    </>
                  ) : (
                    locale === "ta" ? "அனுப்பு" : "Submit Feedback"
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
