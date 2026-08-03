import { Avatar } from "@/components/avatar";
import { TextLink } from "@/components/text-link";

export function Banner() {
  return (
    <>
      <Avatar />
      <p>
        I&apos;m Irfan, a junior software engineer at{" "}
        <TextLink href="https://createdevs.com/">CreateDevs</TextLink>. I&apos;m
        also finishing my BSc in CSE at{" "}
        <TextLink href="https://seu.edu.bd/">Southeast University</TextLink>, so
        most days are split between work and university. Outside of the day job
        I&apos;m usually building something on the side.
      </p>
      <p className="text-cream/60 text-[16px]">
        When I&apos;m not working I&apos;m playing something competitive, or
        sinking way too many hours into a single player game with a good story.
        Usually with music on.
      </p>
    </>
  );
}
