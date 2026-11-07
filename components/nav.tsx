import Link from "next/link";

const links = [
  { label: "work", href: "/#work" },
  { label: "projects", href: "/#projects" },
  { label: "stack", href: "/#stack" },
  { label: "contri", href: "/#contri" },
  { label: "sidequest", href: "/play" },
];

export function Nav() {
  return (
    <div className="sticky top-4 z-40 flex justify-end">
      <nav
        aria-label="Sections"
        className="glass dim-siblings flex max-w-full items-center gap-x-2.5 overflow-x-auto whitespace-nowrap rounded-full border border-cream/10 bg-black/55 px-3 py-0.5 font-mono text-[11px] backdrop-blur-xl backdrop-saturate-150 [scrollbar-width:none] sm:gap-x-4 sm:px-4 sm:text-sm [&::-webkit-scrollbar]:hidden"
      >
        {links.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="group inline-flex shrink-0 py-2 text-cream/60 transition-colors duration-200 hover:text-cream"
          >
            <span className="text-primary/50 transition-colors duration-200 group-hover:text-primary">
              ~
            </span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
