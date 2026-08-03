import { Avatar } from "@/components/avatar";
import { Contributions } from "@/components/contributions";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { PacGame } from "@/components/pac-game";
import { Projects } from "@/components/projects";
import { SocialLinks } from "@/components/social-links";
import { Software } from "@/components/software";

/* The ongoing role's duration is derived from the current date, so the page
   must not stay frozen at build time. Daily is ample for month precision. */
export const revalidate = 86400;

export default function Home() {
  return (
    <>
      <main className="px-6 pt-20 pb-4">
        <div className="mx-auto w-full max-w-2xl space-y-6 text-lg leading-relaxed">
          <Nav />
          <Avatar />
          <p>
            I&apos;m Irfan, a junior software engineer at CreateDevs. I&apos;m
            also finishing my BSc in CSE at Southeast University, so most days
            are split between work and university. Outside of the day job
            I&apos;m usually building something on the side, a project I started
            just to see if I could pull it off, then somehow it turns into a
            whole thing I actually care about finishing. I&apos;d rather learn
            by shipping something small and real than by reading or thinking
            about it.
          </p>
          <p className="text-cream/60">
            When I&apos;m not working I&apos;m playing something competitive, or
            sinking way too many hours into a single player game with a good
            story. Usually with music on.
          </p>
          <SocialLinks />

          <Experience />
          <Projects />
          <Software />
          <PacGame />
          <Contributions />
          <Footer />
        </div>
      </main>
    </>
  );
}
