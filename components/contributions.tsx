import { ContributionGraphView } from "@/components/contribution-graph-view";
import { Section } from "@/components/section";
import { getContributions } from "@/lib/github";

export async function Contributions() {
  const { activities, total } = await getContributions("Irfanulamin");

  if (activities.length === 0) return null;

  return (
    <Section
      id="contri"
      label="Contributions"
      description="What I've been shipping."
    >
      <ContributionGraphView activities={activities} total={total} />
    </Section>
  );
}
