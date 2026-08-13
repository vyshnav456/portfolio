import { ArrowUp } from "lucide-react";
import { profile } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-6">
        <p className="text-center font-mono text-[11.5px] text-faint sm:text-left">
          {`© ${new Date().getFullYear()} ${profile.name} · Built with Next.js & Tailwind CSS`}
        </p>
        <a
          href="#top"
          className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-faint transition-colors hover:text-fg"
        >
          Back to top
          <ArrowUp size={12} />
        </a>
      </div>
    </footer>
  );
}
