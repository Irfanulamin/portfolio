export type Project = {
  name: string;
  description: string;
  href: string;
  logo: string;
};

export const projects: Project[] = [
  {
    name: "MidnightUX",
    /* PLACEHOLDER — invented copy. Replace with what you actually did here. */
    description:
      "A design and development studio building brand-led sites and product interfaces. Worked across the front end, from layout and motion through to production deployment.",
    href: "https://www.midnightux.com/",
    logo: "/projects/midnightux-logo.png",
  },
  {
    name: "Chefalio",
    description:
      "A full-stack recipe marketplace for browsing, publishing, and selling recipes and cookbooks. Built and shipped independently, from data model to deployment.",
    href: "https://www.chefalio.xyz/",
    logo: "/projects/chefalio-logo.png",
  },
  {
    name: "MediVerify",
    description:
      "A medicine verification system that checks authenticity and returns a trust score using an AI-powered RAG pipeline. Built solo in three days for a hackathon.",
    href: "https://mediverify-web.vercel.app/",
    logo: "/projects/mediverify-logo.png",
  },
];
