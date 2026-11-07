export type Role = {
  company: string;
  title: string;
  logo: string;
  location: string;
  start: string;
  end: string | null;
  /** Shown in the cursor pill when hovering the role. [Text] is underlined. */
  cursor: string;
  /** What you did there, one short line each. Hidden when empty. */
  points?: string[];
};

export const roles: Role[] = [
  {
    company: "CreateDevs",
    title: "Junior Software Engineer",
    logo: "/work/createdevs-logo.jpg",
    location: "New York, USA · Remote",
    start: "2025-06",
    end: null,
    cursor: "Jun 2025–Present @ [CreateDevs]",
    points: [
      "Work with designers and senior engineers to turn client requests into features, from deciding how a workflow should behave to shipping it.",
      "Build shared components and API integrations so related features behave consistently across client applications.",
      "Follow up after release, tracing issues across the interface and backend and using client feedback to refine the next update.",
    ],
  },
  {
    company: "Perseverance Enterprise",
    title: "Full Stack Developer",
    logo: "/work/perseverance-logo.jpg",
    location: "Pune, India · Remote",
    start: "2024-12",
    end: "2025-03",
    cursor: "Dec 2024–Mar 2025 @ [Perseverance]",
    points: [
      "Built React interfaces and the microservice endpoints behind them, handling how application data was stored and retrieved in Supabase.",
      "Maintained the deployment setup for backend services, packaging them with Docker and routing requests through Nginx.",
    ],
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function toMonthIndex(ym: string): number {
  const [year, month] = ym.split("-").map(Number);
  return year * 12 + month;
}

function currentMonthIndex(): number {
  const now = new Date();
  return now.getFullYear() * 12 + (now.getMonth() + 1);
}

function label(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

export function tenureMonths(role: Role): number {
  const end = role.end ? toMonthIndex(role.end) : currentMonthIndex();
  return end - toMonthIndex(role.start) + 1;
}

export function careerMonths(): number {
  const earliest = Math.min(...roles.map((r) => toMonthIndex(r.start)));
  return currentMonthIndex() - earliest + 1;
}

export function gapMonths(earlierEnd: string, laterStart: string): number {
  return toMonthIndex(laterStart) - toMonthIndex(earlierEnd) - 1;
}

export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest > 0) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ") || "0 mos";
}

export function formatRange(role: Role): string {
  return `${label(role.start)} — ${role.end ? label(role.end) : "Present"}`;
}
