import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProjectsPageContent } from "./ProjectsPageContent";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Header locale={locale} showTabs={false} />
      <ProjectsPageContent locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
