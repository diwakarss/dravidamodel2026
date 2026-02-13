import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "HomePage" });

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-navy-900 to-navy-800 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">
            {t("badge")}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            {t("title")}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl">{t("subtitle")}</p>
        </div>
      </header>

      {/* Content placeholder */}
      <section className="max-w-5xl mx-auto py-12 px-6">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <p className="text-slate-600">
            Phase 1.5 scaffolding complete. Components coming in 01.5-03.
          </p>
        </div>
      </section>
    </main>
  );
}
