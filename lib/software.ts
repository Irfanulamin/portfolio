import {
  SiDjango,
  SiDjangoHex,
  SiDocker,
  SiDockerHex,
  SiFastapi,
  SiFastapiHex,
  SiFramer,
  SiFramerHex,
  SiGit,
  SiGitHex,
  SiGreensock,
  SiGreensockHex,
  SiMongodb,
  SiMongodbHex,
  SiNextdotjs,
  SiNextdotjsHex,
  SiNodedotjs,
  SiNodedotjsHex,
  SiPostgresql,
  SiPostgresqlHex,
  SiPython,
  SiPythonHex,
  SiReact,
  SiReactHex,
  SiShadcnui,
  SiShadcnuiHex,
  SiTailwindcss,
  SiTailwindcssHex,
  SiThreedotjs,
  SiThreedotjsHex,
  SiTypescript,
  SiTypescriptHex,
  SiVercel,
  SiVercelHex,
} from "@icons-pack/react-simple-icons";

export type Tool = {
  name: string;
  Icon: React.ComponentType<{ className?: string; color?: string }>;
  /** Brand colour, used for the hover fill. */
  color: string;
};

/** Near-black brand colours (Next.js, Vercel…) vanish on the dark page, so use cream. */
function visible(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const luma = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return luma < 30 ? "#f5f1ea" : hex;
}

const tools: Tool[] = [
  { name: "TypeScript", Icon: SiTypescript, color: SiTypescriptHex },
  { name: "Python", Icon: SiPython, color: SiPythonHex },

  { name: "Node.js", Icon: SiNodedotjs, color: SiNodedotjsHex },
  { name: "FastAPI", Icon: SiFastapi, color: SiFastapiHex },
  { name: "Django", Icon: SiDjango, color: SiDjangoHex },

  { name: "React", Icon: SiReact, color: SiReactHex },
  { name: "Next.js", Icon: SiNextdotjs, color: SiNextdotjsHex },
  { name: "Tailwind", Icon: SiTailwindcss, color: SiTailwindcssHex },
  { name: "shadcn/ui", Icon: SiShadcnui, color: SiShadcnuiHex },
  { name: "GSAP", Icon: SiGreensock, color: SiGreensockHex },
  { name: "Motion", Icon: SiFramer, color: SiFramerHex },
  { name: "Three.js", Icon: SiThreedotjs, color: SiThreedotjsHex },

  { name: "MongoDB", Icon: SiMongodb, color: SiMongodbHex },
  { name: "PostgreSQL", Icon: SiPostgresql, color: SiPostgresqlHex },

  { name: "Docker", Icon: SiDocker, color: SiDockerHex },
  { name: "Git", Icon: SiGit, color: SiGitHex },
  { name: "Vercel", Icon: SiVercel, color: SiVercelHex },
];

export const software = tools.map((tool) => ({
  ...tool,
  color: visible(tool.color),
}));
