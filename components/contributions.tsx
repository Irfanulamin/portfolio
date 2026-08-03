import { ContributionGraphView } from "@/components/contribution-graph-view";
import { getContributions } from "@/lib/github";

export async function Contributions() {
  const { activities, total } = await getContributions("Irfanulamin");

  if (activities.length === 0) return null;

  return (
    <section id="contri" className="scroll-mt-24 space-y-6 pt-14">
      <div className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-cream">
          Contributions
        </h2>
        <p className="text-base text-cream/60">What I&apos;ve been shipping.</p>
      </div>

      <ContributionGraphView activities={activities} total={total} />
    </section>
  );
}
