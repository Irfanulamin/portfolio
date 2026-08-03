import Image from "next/image";

import {
  formatDuration,
  formatRange,
  roles,
  tenureMonths,
} from "@/lib/experience";

export function Experience() {
  return (
    <section id="work" className="scroll-mt-24 space-y-6 pt-14">
      <div className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-cream">
          Experience
        </h2>
        <p className="text-base text-cream/60">Companies I&apos;ve worked with.</p>
      </div>

      <ol className="dim-siblings space-y-3">
        {roles.map((role, i) => (
          <li key={role.company}>
            <div className="-mx-3 flex items-start gap-4 rounded-xl px-3 py-2 transition-colors duration-300 hover:bg-cream/[0.04]">
              <Image
                src={role.logo}
                alt=""
                aria-hidden
                width={40}
                height={40}
                className="size-10 shrink-0 rounded-lg object-contain"
              />

              <div className="flex min-w-0 flex-1 flex-col gap-1 text-base leading-normal sm:flex-row sm:items-start sm:justify-between sm:gap-6">
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
                className="ml-5 h-6 w-px border-l border-dashed border-cream/25"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
