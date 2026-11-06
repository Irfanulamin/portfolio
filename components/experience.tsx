import Image from "next/image";

import { CursorArea } from "@/components/cursor-area";
import { Section } from "@/components/section";
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
                  small gap at each end. Draws downward when the section appears. */}
              {i < roles.length - 1 && (
                <span
                  aria-hidden
                  className="timeline-line absolute top-[60px] left-5 h-[calc(100%-56px)] w-px bg-linear-to-b from-cream/40 to-cream/10"
                />
              )}

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
            </li>
          ))}
        </ol>
      </CursorArea>
    </Section>
  );
}
