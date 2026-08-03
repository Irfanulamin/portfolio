export type Activity = {
  date: string;
  count: number;
  level: number;
};

export type Contributions = {
  activities: Activity[];
  total: number;
};

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
    return { activities: [], total: 0 };
  }
}
