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
        className="glass dim-siblings flex flex-wrap items-center justify-end gap-x-3 gap-y-0 rounded-full border border-cream/10 bg-black/55 px-4 py-0.5 font-mono text-xs backdrop-blur-xl backdrop-saturate-150 sm:gap-x-4 sm:text-sm"
      >
        {links.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="group inline-flex py-2 text-cream/60 transition-colors duration-200 hover:text-cream"
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
