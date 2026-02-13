import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";
import { MapWrapper } from "@/components/map/MapWrapper";
import { getStats } from "@/lib/data/projects";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const stats = getStats();

  return (
    <main id="main-content" className="min-h-screen bg-slate-50">
      <Header locale={locale} />

      <Container className="py-8">
        <div className="mb-6">
          <p className="text-slate-600">
            {locale === "ta"
              ? `${stats.districtsCount} மாவட்டங்களில் ${stats.total} உள்கட்டமைப்பு திட்டங்களை ஆராயுங்கள்`
              : `Explore ${stats.total} infrastructure projects across ${stats.districtsCount} districts`}
          </p>
        </div>

        {/* Map container */}
        <div className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden border border-slate-200 bg-white">
          <MapWrapper className="h-full w-full" locale={locale} />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
          <span>{locale === "ta" ? "திட்ட அடர்த்தி:" : "Project density:"}</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#e0ecf6" }} />
            <span>{locale === "ta" ? "குறைவு" : "Low"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#6b9bc4" }} />
            <span>{locale === "ta" ? "நடுத்தரம்" : "Medium"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: "#264d73" }} />
            <span>{locale === "ta" ? "அதிகம்" : "High"}</span>
          </div>
        </div>
      </Container>
    </main>
  );
}
