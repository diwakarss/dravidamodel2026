import { setRequestLocale } from "next-intl/server";
import { Header, Container, Footer } from "@/components/layout";
import { SourceCard } from "@/components/sources";
import sourcesData from "@/data/sources.json";
import { SourcesDataSchema } from "@/lib/schemas/source";
import type { SourceEntry, SourceCategory } from "@/lib/schemas/source";

// Runtime validation of static JSON data
const validatedData = SourcesDataSchema.parse(sourcesData);

export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sources = validatedData.sources;

  // Group by category
  const categorized = sources.reduce(
    (acc, source) => {
      if (!acc[source.category]) {
        acc[source.category] = [];
      }
      acc[source.category].push(source);
      return acc;
    },
    {} as Record<SourceCategory, SourceEntry[]>
  );

  const categoryLabels: Record<SourceCategory, { en: string; ta: string }> = {
    government: { en: "Government Sources", ta: "அரசு ஆதாரங்கள்" },
    media: { en: "Media Sources", ta: "ஊடக ஆதாரங்கள்" },
    reports: { en: "Reports & Documents", ta: "அறிக்கைகள் & ஆவணங்கள்" },
    other: { en: "Other Sources", ta: "பிற ஆதாரங்கள்" },
  };

  const pageTitle = locale === "ta" ? "ஆதாரங்கள்" : "Sources";
  const pageSubtitle =
    locale === "ta"
      ? "இந்த தளத்தில் உள்ள தரவுகளைச் சேகரிக்கப் பயன்படுத்தப்பட்ட அனைத்து ஆதாரங்களும்."
      : "All sources used to collect the data presented on this platform.";

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen bg-slate-50 py-8">
        <Container>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">
              {pageTitle}
            </h1>
            <p className="text-slate-600">{pageSubtitle}</p>
          </div>

          <div className="space-y-8">
            {(["government", "media", "reports", "other"] as SourceCategory[]).map(
              (category) => {
                const categoryData = categorized[category];
                if (!categoryData || categoryData.length === 0) return null;

                return (
                  <section key={category}>
                    <h2 className="text-lg font-semibold text-navy-800 mb-4">
                      {locale === "ta"
                        ? categoryLabels[category].ta
                        : categoryLabels[category].en}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {categoryData.map((source) => (
                        <SourceCard
                          key={source.id}
                          source={source}
                          locale={locale}
                        />
                      ))}
                    </div>
                  </section>
                );
              }
            )}
          </div>

          {/* Methodology note */}
          <div className="mt-12 p-6 bg-white rounded-lg border border-slate-200">
            <h2 className="font-semibold text-navy-900 mb-2">
              {locale === "ta" ? "தரவு சேகரிப்பு" : "Data Collection Methodology"}
            </h2>
            <p className="text-sm text-slate-600">
              {locale === "ta"
                ? "அனைத்து திட்ட தரவுகளும் அதிகாரப்பூர்வ அரசு இணையதளங்கள், செய்தி ஆதாரங்கள் மற்றும் பொது ஆவணங்களிலிருந்து சேகரிக்கப்பட்டுள்ளன. ஒவ்வொரு திட்டமும் குறைந்தது ஒரு சரிபார்க்கக்கூடிய ஆதாரத்துடன் இணைக்கப்பட்டுள்ளது."
                : "All project data has been collected from official government websites, news sources, and public documents. Each project is linked to at least one verifiable source."}
            </p>
          </div>
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}
