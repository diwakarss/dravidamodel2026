import { cn } from "@/lib/utils/cn";

interface SourceLinkProps {
  title: string;
  url: string;
  className?: string;
}

export function SourceLink({ title, url, className }: SourceLinkProps) {
  const displayUrl = url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .slice(0, 50);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 p-3 bg-slate-50 rounded-md transition-colors hover:bg-slate-100",
        className
      )}
    >
      <div className="w-8 h-8 bg-navy-100 rounded flex items-center justify-center flex-shrink-0">
        <svg
          className="w-4 h-4 text-navy-700"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-navy-800 truncate">{title}</p>
        <p className="text-xs text-slate-500 truncate">{displayUrl}...</p>
      </div>
      <svg
        className="w-4 h-4 text-slate-400 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
      </svg>
    </a>
  );
}
