"use client";

import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/components/kibo-ui/contribution-graph";
import type { Activity } from "@/lib/github";

/* Levels ramp through the accent instead of GitHub's green, so the graph
   stays inside the page's palette. */
const BLOCK_FILL = [
  'data-[level="0"]:fill-cream/10',
  'data-[level="1"]:fill-primary/30',
  'data-[level="2"]:fill-primary/50',
  'data-[level="3"]:fill-primary/75',
  'data-[level="4"]:fill-primary',
].join(" ");

type Props = {
  activities: Activity[];
  total: number;
};

/**
 * Client boundary. The sub-components take render props, and functions cannot
 * cross from a Server Component into a Client Component — so the callbacks
 * have to be defined on this side.
 */
export function ContributionGraphView({ activities, total }: Props) {
  return (
    <ContributionGraph
      data={activities}
      totalCount={total}
      blockSize={11}
      blockMargin={3}
      fontSize={11}
      className="w-full text-cream/40"
    >
      {/* The SVG carries a viewBox, so overriding its width to 100% scales the
          whole calendar to the container instead of scrolling it. The component
          ships overflow-x-auto by default — overflow-x-visible removes it. */}
      <ContributionGraphCalendar className="overflow-x-visible [&>svg]:h-auto [&>svg]:w-full">
        {(props) => <ContributionGraphBlock {...props} className={BLOCK_FILL} />}
      </ContributionGraphCalendar>

      <ContributionGraphFooter className="mt-2 flex items-center text-xs">
        <ContributionGraphTotalCount>
          {({ totalCount }) => (
            <span className="text-cream/40">
              {totalCount} contributions in the last year
            </span>
          )}
        </ContributionGraphTotalCount>

        <ContributionGraphLegend className="text-cream/40">
          {({ level }) => (
            <svg height={11} width={11}>
              <title>{`Level ${level}`}</title>
              <rect
                className={BLOCK_FILL}
                data-level={level}
                height={11}
                rx={2}
                ry={2}
                width={11}
              />
            </svg>
          )}
        </ContributionGraphLegend>
      </ContributionGraphFooter>
    </ContributionGraph>
  );
}
