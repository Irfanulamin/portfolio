import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";

import { Section } from "@/components/section";
import { projects } from "@/lib/projects";

export function Projects() {
  return (
    <Section id="projects" label="Projects" description="What I've built.">
      <ol className="stagger dim-siblings space-y-2">
        {projects.map((project, i) => (
          <li key={project.name} style={{ "--index": i } as React.CSSProperties}>
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group -mx-3 flex items-start gap-4 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-cream/4"
            >
              <Image
                src={project.logo}
                alt=""
                aria-hidden
                width={40}
                height={40}
                className="size-10 shrink-0 object-contain"
              />

              <div className="min-w-0 space-y-1 text-base leading-normal">
                <p className="flex items-center gap-1.5 font-medium text-cream">
                  {project.name}
                  <ArrowUpRightIcon
                    weight="bold"
                    className="size-3.5 text-primary opacity-0 transition-opacity duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
                  />
                </p>
                <p className="text-sm leading-relaxed text-cream/55">
                  {project.description}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ol>
    </Section>
  );
}
