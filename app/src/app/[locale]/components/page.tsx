import { setRequestLocale } from "next-intl/server";
import { Container, Header, Footer } from "@/components/layout";
import { ProjectCard, StatusBadge, TypeBadge } from "@/components/project";
import { StatsGrid, StatCard } from "@/components/stats";
import { FilterChip } from "@/components/filters";
import { SourceLink } from "@/components/sources";
import { Badge, Card } from "@/components/ui";
import { projects, getStats } from "@/lib/data/projects";

export default async function ComponentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sampleProject = projects[0];
  const stats = getStats();

  return (
    <>
      <Header locale={locale} />
      <main className="py-8 bg-slate-50 min-h-screen">
        <Container>
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-8">
            Component Library
          </h1>

          {/* Stats Grid */}
          <section className="mb-12">
            <h2 className="font-semibold text-lg text-navy-800 mb-4">
              Stats Grid
            </h2>
            <StatsGrid locale={locale} />
          </section>

          {/* Individual Stat Cards */}
          <section className="mb-12">
            <h2 className="font-semibold text-lg text-navy-800 mb-4">
              Stat Card Variants
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard value="150" label="Default variant" />
              <StatCard
                value="₹3.8L Cr"
                label="Accent variant"
                variant="accent"
              />
            </div>
          </section>

          {/* Status Badges */}
          <section className="mb-12">
            <h2 className="font-semibold text-lg text-navy-800 mb-4">
              Status Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="Completed" locale={locale} />
              <StatusBadge status="Ongoing" locale={locale} />
              <StatusBadge status="Planned" locale={locale} />
            </div>
          </section>

          {/* Type Badges */}
          <section className="mb-12">
            <h2 className="font-semibold text-lg text-navy-800 mb-4">
              Type Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              <TypeBadge type="Public Transport" />
              <TypeBadge type="Roads/Highways" />
              <TypeBadge type="Water/Sanitation" />
              <TypeBadge type="Education/Health" />
              <TypeBadge type="Power/Utilities" />
              <TypeBadge type="Other" />
            </div>
          </section>

          {/* Filter Chips */}
          <section className="mb-12">
            <h2 className="font-semibold text-lg text-navy-800 mb-4">
              Filter Chips
            </h2>
            <div className="flex flex-wrap gap-2">
              <FilterChip label="All" count={stats.total} active />
              <FilterChip label="Completed" count={stats.byStatus.Completed} />
              <FilterChip label="Ongoing" count={stats.byStatus.Ongoing} />
              <FilterChip label="Planned" count={stats.byStatus.Planned} />
            </div>
          </section>

          {/* Base UI */}
          <section className="mb-12">
            <h2 className="font-semibold text-lg text-navy-800 mb-4">
              Base UI Components
            </h2>
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge>Default Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
            </div>
            <div className="max-w-sm">
              <Card>
                <p className="text-slate-600">Basic Card component</p>
              </Card>
            </div>
          </section>

          {/* Project Card */}
          <section className="mb-12">
            <h2 className="font-semibold text-lg text-navy-800 mb-4">
              Project Card
            </h2>
            <div className="max-w-md">
              <ProjectCard project={sampleProject} locale={locale} />
            </div>
          </section>

          {/* Source Links */}
          <section className="mb-12">
            <h2 className="font-semibold text-lg text-navy-800 mb-4">
              Source Links
            </h2>
            <div className="max-w-lg space-y-2">
              {sampleProject.sources.map((source, i) => (
                <SourceLink key={i} title={source.title} url={source.url} />
              ))}
            </div>
          </section>
        </Container>
      </main>
      <Footer locale={locale} />
    </>
  );
}
