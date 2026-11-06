import { Section } from "@/components/section";
import { ToolChip } from "@/components/tool-chip";
import { software } from "@/lib/software";

export function Software() {
  return (
    <Section id="stack" label="Software" description="What I use daily.">
      <ul className="stagger dim-siblings flex flex-wrap gap-2">
        {software.map(({ name, Icon, color }, i) => (
          <ToolChip
            key={name}
            name={name}
            color={color}
            index={i}
            icon={<Icon className="shrink-0" />}
          />
        ))}
      </ul>
    </Section>
  );
}
