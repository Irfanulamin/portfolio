import { Banner } from "@/components/banner";
import { Contributions } from "@/components/contributions";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Projects } from "@/components/projects";
import { Reveal } from "@/components/reveal";
import { SocialLinks } from "@/components/social-links";
import { Software } from "@/components/software";

export const revalidate = 86400;

export default function Home() {
  return (
    <>
      <main id="top" className="px-6 pt-16 pb-4">
        <div className="mx-auto w-full max-w-2xl space-y-6 text-lg leading-relaxed">
          <Nav />
          <Banner />
          <SocialLinks />
          <Reveal>
            <Experience />
          </Reveal>
          <Reveal>
            <Projects />
          </Reveal>
          <Reveal>
            <Software />
          </Reveal>
          <Reveal>
            <Contributions />
          </Reveal>
          <Footer />
        </div>
      </main>
    </>
  );
}
