import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { SiNestjs, SiSocketdotio, SiStripe } from "@icons-pack/react-simple-icons";

import { CursorArea } from "@/components/cursor-area";
import { Section } from "@/components/section";
import { projects } from "@/lib/projects";
import { software } from "@/lib/software";

// Icons for project tools that aren't in the Software list.
const EXTRA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  nestjs: SiNestjs,
  stripe: SiStripe,
  "socket.io": SiSocketdotio,
};

function iconFor(name: string) {
  const key = name.toLowerCase();
  return software.find((tool) => tool.name.toLowerCase() === key)?.Icon ?? EXTRA_ICONS[key];
}

export function Projects() {
  return (
    <Section id="projects" label="Projects" description="What I've built.">
      <CursorArea>
        <ol className="stagger dim-siblings space-y-8">
          {projects.map((project, i) => (
            <li key={project.name} style={{ "--index": i } as React.CSSProperties}>
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                data-cursor={project.cursor}
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

              {/* Stack on the left, source link on the right, both lined up past the logo (40px logo + 16px gap). */}
              <div className="mt-3 flex items-end justify-between gap-6 pl-14">
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((name) => {
                    const Icon = iconFor(name);
                    return (
                      <span
                        key={name}
                        className="inline-flex h-6 items-center gap-1.5 rounded-full border border-cream/12 px-2.5 text-xs text-cream/55"
                      >
                        {Icon && <Icon className="size-3 shrink-0" />}
                        {name}
                      </span>
                    );
                  })}
                </div>

                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.name} source on GitHub`}
                    data-cursor={`View source on [GitHub]`}
                    className="shrink-0 text-sm text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary"
                  >
                    Source
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CursorArea>
    </Section>
  );
}
