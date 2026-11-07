import { ArrowUpIcon } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24">
      <div aria-hidden className="footer-rule h-px bg-cream/10" />
      <div className="pt-6">
      <div className="flex items-center justify-between gap-4 text-sm text-cream/35">
        <p>© {year} Irfanul Amin Maruf</p>

        <a
          href="#top"
          aria-label="Back to top"
          className="group grid size-8 shrink-0 place-items-center rounded-full border border-cream/15 transition-colors duration-200 hover:border-primary hover:text-primary active:translate-y-px"
        >
          <ArrowUpIcon
            weight="bold"
            className="size-3 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5"
          />
        </a>
      </div>
      </div>
    </footer>
  );
}
