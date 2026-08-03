import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

import { projects } from "@/lib/projects";

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-24 space-y-6 pt-14">
      <div className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-cream">
          Projects
        </h2>
        <p className="text-base text-cream/60">What I&apos;ve built.</p>
      </div>

      <ol className="space-y-1">
        {projects.map((project) => (
          <li key={project.name}>
            {/* The whole row is the target — a small "visit" link would be a
                needlessly precise thing to hit. */}
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group -mx-3 flex items-start gap-4 rounded-xl px-3 py-3 transition-colors duration-300 hover:bg-cream/5"
            >
              <Image
                src={project.logo}
                alt=""
                aria-hidden
                width={40}
                height={40}
                /* contain, not cover: these logos run 1.73 / 1.00 / 0.69 in
                   aspect, so filling a square box crops the wide and tall ones. */
                className="size-10 shrink-0 object-contain"
              />

              <div className="min-w-0 space-y-1">
                <p className="flex items-center gap-1.5 font-medium text-cream">
                  {project.name}
                  <ArrowUpRight
                    weight="bold"
                    className="size-3.5 -translate-x-1 text-primary opacity-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </p>
                <p className="text-sm leading-relaxed text-cream/60">
                  {project.description}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
