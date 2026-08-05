import { Avatar } from "@/components/avatar";
import { TextLink } from "@/components/text-link";

export function Banner() {
  return (
    <header className="space-y-6">
      <Avatar />

      <div className="space-y-1.5">
        <h1 className="text-xl font-medium tracking-tight text-cream">
          Irfanul Amin Maruf
        </h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
          Junior Software Engineer
        </p>
      </div>

      <div className="space-y-4 text-[17px] leading-relaxed text-cream/85">
        <p>
          I&apos;m Irfan, a junior software engineer at{" "}
          <TextLink href="https://createdevs.com/">CreateDevs</TextLink>.
          I&apos;m also finishing my BSc in CSE at{" "}
          <TextLink href="https://seu.edu.bd/">Southeast University</TextLink>,
          so most days are split between work and university. Outside of the day
          job I&apos;m usually building something on the side.
        </p>
        <p className="text-base text-cream/55">
          When I&apos;m not working I&apos;m playing something competitive, or
          sinking way too many hours into a single player game with a good
          story. Usually with music on.
        </p>
      </div>
    </header>
  );
}
