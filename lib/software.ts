import {
  SiDjango,
  SiDocker,
  SiFastapi,
  SiFramer,
  SiGit,
  SiGreensock,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiShadcnui,
  SiTailwindcss,
  SiThreedotjs,
  SiTypescript,
  SiVercel,
} from "@icons-pack/react-simple-icons";

export type Tool = {
  name: string;
  Icon: React.ComponentType<{ className?: string; color?: string }>;
};

/* Grouped loosely by layer — languages, runtime/backend, frontend, data,
   tooling — so the list stays scannable as it grows. */
export const software: Tool[] = [
  { name: "TypeScript", Icon: SiTypescript },
  { name: "Python", Icon: SiPython },

  { name: "Node.js", Icon: SiNodedotjs },
  { name: "FastAPI", Icon: SiFastapi },
  { name: "Django", Icon: SiDjango },

  { name: "React", Icon: SiReact },
  { name: "Next.js", Icon: SiNextdotjs },
  { name: "Tailwind", Icon: SiTailwindcss },
  { name: "shadcn/ui", Icon: SiShadcnui },
  { name: "GSAP", Icon: SiGreensock },
  { name: "Motion", Icon: SiFramer },
  { name: "Three.js", Icon: SiThreedotjs },

  { name: "MongoDB", Icon: SiMongodb },
  { name: "PostgreSQL", Icon: SiPostgresql },

  { name: "Docker", Icon: SiDocker },
  { name: "Git", Icon: SiGit },
  { name: "Vercel", Icon: SiVercel },
];
