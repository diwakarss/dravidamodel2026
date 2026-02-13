import { Container } from "./Container";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const skipToContentLabel =
    locale === "ta" ? "உள்ளடக்கத்திற்கு செல்" : "Skip to content";

  return (
    <>
      <a href="#main-content" className="skip-link">
        {skipToContentLabel}
      </a>
      <header className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
      <Container className="py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">
              2021-2026
            </p>
            <h1 className="font-display text-xl md:text-2xl font-bold">
              {locale === "ta"
                ? "தமிழ்நாடு உள்கட்டமைப்பு காட்சியகம்"
                : "Tamil Nadu Infrastructure Showcase"}
            </h1>
          </div>
          <LanguageSwitcher locale={locale} />
        </div>
      </Container>
    </header>
    </>
  );
}
