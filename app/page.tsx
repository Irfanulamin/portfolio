import { Banner } from "@/components/banner";
import { Contributions } from "@/components/contributions";
import { Experience } from "@/components/experience";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { Projects } from "@/components/projects";
import { Reveal } from "@/components/reveal";
import { SocialLinks } from "@/components/social-links";
import { Software } from "@/components/software";

export default function Home() {
  return (
    <main id="top" className="px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Nav />

        <div className="mt-12">
          <Banner />
          <SocialLinks />
        </div>

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
  );
}
