import { Section } from "@/components/section";
import { software } from "@/lib/software";

export function Software() {
  return (
    <Section id="stack" label="Software" description="What I use daily.">
      <ul className="stagger dim-siblings flex flex-wrap gap-2">
        {software.map(({ name, Icon }, i) => (
          <li
            key={name}
            style={{ "--index": i } as React.CSSProperties}
            className="inline-flex h-8 cursor-default items-center gap-2 rounded-full bg-cream/80 px-3.5 text-sm font-medium tracking-[0.005em] text-black transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream"
          >
            <Icon color="default" className="size-4 shrink-0" />
            {name}
          </li>
        ))}
      </ul>
    </Section>
  );
}
