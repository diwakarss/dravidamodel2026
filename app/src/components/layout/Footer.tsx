import { Container } from "./Container";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-8 mt-12">
      <Container>
        <div className="text-center text-sm text-slate-600">
          <p>
            {locale === "ta"
              ? "தரவு துல்லியத்துடன் வெளிப்படையான ஆதாரங்கள்"
              : "Data accuracy with transparent sourcing"}
          </p>
          <p className="mt-2 text-slate-500">
            {locale === "ta"
              ? "அனைத்து திட்டத் தகவல்களும் அரசு ஆதாரங்கள் மற்றும் நம்பகமான ஊடகங்களிலிருந்து சரிபார்க்கப்பட்டவை"
              : "All project information verified from government sources and credible media"}
          </p>
        </div>
      </Container>
    </footer>
  );
}
