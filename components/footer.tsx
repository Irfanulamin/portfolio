import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16">
      <div className="flex items-center justify-between gap-4 text-sm text-cream/35">
        <p>© {year} Irfanul Amin Maruf</p>

        <a
          href="#top"
          aria-label="Back to top"
          className="grid size-8 shrink-0 place-items-center rounded-full border border-cream/15 transition-colors duration-300 hover:border-primary hover:text-primary"
        >
          <ArrowUpIcon weight="bold" className="size-3" />
        </a>
      </div>
    </footer>
  );
}
