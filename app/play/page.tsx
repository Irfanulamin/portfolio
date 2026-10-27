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
    <main className="px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Nav />

        <div className="mt-12">
          <Reveal>
            <header className="space-y-6">
              <div className="space-y-1.5">
                <h1 className="text-2xl leading-[1.15] font-medium tracking-[-0.02em] text-cream">
                  dot-run
                </h1>
                <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-primary">
                  Sidequest
                </p>
              </div>

              <div className="space-y-4 text-[17px] leading-[1.65] text-cream/85">
                <p>
                  I built this one on my own over three days. There was no
                  reason beyond wanting to. I got curious about what a mini game
                  actually takes to make, so I sat down and made one.
                </p>
                <p className="text-base text-cream/55">
                  Clear every token before the bug catches you. Three levels,
                  each with a new map and a faster bug. Arrow keys or WASD on a
                  keyboard, the pad below on a phone.
                </p>
              </div>
            </header>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-12">
              <PacGame />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <Link
              href="/"
              className="group mt-12 inline-flex items-center gap-2 font-mono text-sm text-cream/50 transition-colors duration-200 hover:text-cream"
            >
              <ArrowLeftIcon
                weight="bold"
                className="size-3.5 text-primary/60 transition-[transform,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-x-0.5 group-hover:text-primary"
              />
              back to the rest of it
            </Link>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
