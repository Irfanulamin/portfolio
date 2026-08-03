import { software } from "@/lib/software";

export function Software() {
  return (
    <section id="stack" className="scroll-mt-24 space-y-6 pt-14">
      <div className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-cream">
          Software
        </h2>
        <p className="text-base text-cream/60">What I use daily.</p>
      </div>

      {/* Opaque off-white fill — light enough that the pure-black marks
          (Next.js, shadcn/ui, Three.js) stay legible, without glaring.
          Free-flowing wrap, not a grid. */}
      <ul className="flex flex-wrap gap-2">
        {software.map(({ name, Icon }) => (
          <li
            key={name}
            className="inline-flex cursor-default items-center gap-2 rounded-full bg-cream-dim px-3 py-1.5 text-sm font-medium text-black transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream"
          >
            <Icon color="default" className="size-4 shrink-0" />
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}
