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
    <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 px-4 py-2 font-mono text-sm sm:top-5 sm:gap-x-4">
      {links.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className="group inline-flex text-cream/70 transition-colors duration-300 hover:text-cream"
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
