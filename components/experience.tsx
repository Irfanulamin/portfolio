import Image from "next/image";

import { CursorArea } from "@/components/cursor-area";
import { Section } from "@/components/section";
import { TimelineLine } from "@/components/timeline-line";
import {
  formatDuration,
  formatRange,
  roles,
  tenureMonths,
} from "@/lib/experience";

export function Experience() {
  return (
    <Section
      id="work"
      label="Experience"
      description="Companies I've worked with."
    >
      <CursorArea>
        <ol className="stagger dim-siblings">
          {roles.map((role, i) => (
            <li
              key={role.company}
              className="relative not-last:pb-6"
              style={{ "--index": i } as React.CSSProperties}
            >
              {/* Timeline: a grey line, lighter at the top and darker at the bottom, from this logo down to the next, with a
                  small gap at each end. Draws downward once it reaches the middle of the screen. */}
              {i < roles.length - 1 && <TimelineLine />}

              <div
                data-cursor={role.cursor}
                className="-mx-3 flex items-start gap-4 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-cream/4"
              >
                <Image
                  src={role.logo}
                  alt=""
                  aria-hidden
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-lg object-contain"
                />

                <div className="flex min-w-0 flex-1 flex-col gap-1 text-base leading-normal sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-medium text-cream">{role.company}</p>
                    <p className="text-cream/60">{role.title}</p>
                    <p className="text-sm text-cream/40">{role.location}</p>
                  </div>

                  <div className="shrink-0 space-y-0.5 text-sm sm:text-right">
                    <p className="text-cream/60">{formatRange(role)}</p>
                    <p className="text-cream/40">
                      {formatDuration(tenureMonths(role))}
                    </p>
                  </div>
                </div>
              </div>

              {/* What you did there, lined up past the logo (40px logo + 16px gap). */}
              {role.points && role.points.length > 0 && (
                <ul className="mt-1 space-y-1.5 pl-14 text-sm leading-relaxed text-cream/60">
                  {role.points.map((point) => (
                    <li key={point} className="relative pl-3.5">
                      <span
                        aria-hidden
                        className="absolute top-[0.6em] left-0 size-1 rounded-full bg-cream/30"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </CursorArea>
    </Section>
  );
}
