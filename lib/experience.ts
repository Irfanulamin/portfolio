export type Role = {
  company: string;
  title: string;
  logo: string;
  location: string;
  /* "YYYY-MM" */
  start: string;
  /* "YYYY-MM", or null while ongoing */
  end: string | null;
};

export const roles: Role[] = [
  {
    company: "CreateDevs",
    title: "Junior Software Engineer",
    logo: "/work/createdevs-logo.jpg",
    location: "New York, USA · Remote",
    start: "2025-06",
    end: null,
  },
  {
    company: "Perseverance Enterprise",
    title: "Fullstack Developer",
    logo: "/work/perseverance-logo.jpg",
    location: "Pune, India · Remote",
    start: "2024-12",
    end: "2025-03",
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Absolute month index, so arithmetic never crosses a year boundary wrong. */
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

/** Inclusive of both endpoints: Dec 2024 – Mar 2025 counts as 4 months. */
export function tenureMonths(role: Role): number {
  const end = role.end ? toMonthIndex(role.end) : currentMonthIndex();
  return end - toMonthIndex(role.start) + 1;
}

/** Months from the earliest role's start date to today, inclusive. */
export function careerMonths(): number {
  const earliest = Math.min(...roles.map((r) => toMonthIndex(r.start)));
  return currentMonthIndex() - earliest + 1;
}

/** Whole months strictly between two roles — the unworked stretch. */
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
