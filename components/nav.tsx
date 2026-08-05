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
    <nav
      aria-label="Sections"
      className="dim-siblings -my-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-0 font-mono text-xs sm:gap-x-4 sm:text-sm"
    >
      {links.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className="group inline-flex py-2 text-cream/60 transition-colors duration-300 hover:text-cream"
        >
          <span className="text-primary/50 transition-colors duration-300 group-hover:text-primary">
            ~
          </span>
          {label}
        </Link>
      ))}
    </nav>
  );
}
