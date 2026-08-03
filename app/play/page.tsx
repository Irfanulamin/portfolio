import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

import { Nav } from "@/components/nav";
import { PacGame } from "@/components/pac-game";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Sidequest - Irfanul Amin Maruf",
  description:
    "A maze game I built on my own in three days, because I wanted to know what it would take.",
};

export default function Play() {
  return (
    <main className="px-6 pt-20 pb-16">
      <div className="mx-auto w-full max-w-2xl space-y-6 text-lg leading-relaxed">
        <Nav />

        <Reveal>
          <div className="space-y-4">
            <h1 className="text-[18px] font-medium text-cream">dot-run</h1>
            <p>
              I built this one on my own over three days. There was no reason
              beyond wanting to. I got curious about what a mini game actually
              takes to make, so I sat down and made one.
            </p>
            <p className="text-cream/60 text-[16px]">
              Clear every token before the bug catches you. Arrow keys or WASD
              on a keyboard, the pad below on a phone.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <PacGame />
        </Reveal>

        <Reveal delay={0.12}>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-mono text-sm text-cream/50 transition-colors duration-300 hover:text-cream"
          >
            <ArrowLeftIcon
              weight="bold"
              className="size-3.5 text-primary/60 transition-colors duration-300 group-hover:text-primary"
            />
            back to the rest of it
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
