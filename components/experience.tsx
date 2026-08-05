import Image from "next/image";

import { Section } from "@/components/section";
import {
  formatDuration,
  formatRange,
  roles,
  tenureMonths,
} from "@/lib/experience";

export function Experience() {
  return (
    <Section id="work" label="Experience" description="Companies I've worked with.">
      <ol className="dim-siblings">
        {roles.map((role, i) => (
          <li key={role.company}>
            <div className="-mx-3 flex items-start gap-4 rounded-xl px-3 py-3 transition-colors duration-300 hover:bg-cream/4">
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

            {i < roles.length - 1 && (
              <div
                aria-hidden
                className="my-1 ml-5 h-4 w-px border-l border-dashed border-cream/25"
              />
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
