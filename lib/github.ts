export type Activity = {
  date: string;
  count: number;
  level: number;
};

export type Contributions = {
  activities: Activity[];
  total: number;
};

/**
 * GitHub's contribution calendar is not exposed by the public REST API — the
 * official route is the GraphQL API, which requires a personal access token.
 * This proxy serves the same data unauthenticated, already shaped as
 * { date, count, level }.
 */
export async function getContributions(user: string): Promise<Contributions> {
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${user}?y=last`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) return { activities: [], total: 0 };

    const data = await response.json();
    return {
      activities: data.contributions ?? [],
      total: data.total?.lastYear ?? 0,
    };
  } catch {
    /* A third-party outage should drop the section, never break the page. */
    return { activities: [], total: 0 };
  }
}
