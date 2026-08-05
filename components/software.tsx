import { Section } from "@/components/section";
import { software } from "@/lib/software";

export function Software() {
  return (
    <Section id="stack" label="Software" description="What I use daily.">
      <ul className="dim-siblings flex flex-wrap gap-2">
        {software.map(({ name, Icon }) => (
          <li
            key={name}
            className="inline-flex h-8 cursor-default items-center gap-2 rounded-full bg-cream/80 px-3.5 text-sm font-medium text-black transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-cream"
          >
            <Icon color="default" className="size-4 shrink-0" />
            {name}
          </li>
        ))}
      </ul>
    </Section>
  );
}
