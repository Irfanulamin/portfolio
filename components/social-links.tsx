"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Check,
  EnvelopeSimple,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";
import { useWash } from "@/lib/use-wash";
import { buttonVariants } from "@/components/ui/button";

const EMAIL = "irfanulamin10@gmail.com";

type Social = {
  label: string;
  icon: React.ComponentType<{
    className?: string;
    weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  }>;
  href?: string;
  copy?: string;
};

const socials: Social[] = [
  { label: "Gmail", icon: EnvelopeSimple, copy: EMAIL },
  {
    label: "LinkedIn",
    icon: LinkedinLogo,
    href: "https://www.linkedin.com/in/irfanul-amin/",
  },
  {
    label: "GitHub",
    icon: GithubLogo,
    href: "https://github.com/Irfanulamin",
  },
  {
    label: "Instagram",
    icon: InstagramLogo,
    href: "https://www.instagram.com/notirf4n/",
  },
];

const CHIP = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "wash wash-chip h-8 gap-1.5 rounded-full border-cream/25 bg-transparent px-3.5",
  "hover:bg-transparent hover:text-cream",
  "duration-100 active:scale-[0.97]",
  "[&_svg]:size-4",
);

function Chip({ social, onCopy }: { social: Social; onCopy: () => void }) {
  const { label, href, copy, icon: Icon } = social;
  const wash = useWash();

  const content = (
    <>
      <Icon weight="fill" />
      <span>{label}</span>
    </>
  );

  return copy ? (
    <button
      type="button"
      onClick={onCopy}
      aria-label={`Copy email address ${copy}`}
      className={CHIP}
      {...wash}
    >
      {content}
    </button>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={CHIP}
      {...wash}
    >
      {content}
    </a>
  );
}

export function SocialLinks() {
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <nav
        aria-label="Elsewhere"
        className="mt-6 flex flex-wrap gap-2"
      >
        {socials.map((social) => (
          <Chip key={social.label} social={social} onCopy={copyEmail} />
        ))}
      </nav>

      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6"
      >
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16, scale: 0.94, filter: "blur(8px)" }
              }
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16, scale: 0.94, filter: "blur(8px)" }
              }
              transition={
                reduce
                  ? { duration: 0.2 }
                  : { type: "spring", bounce: 0.2, duration: 0.45 }
              }
              className="glass flex items-center gap-2.5 rounded-full border border-cream/15 bg-black/90 py-2.5 pr-5 pl-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary">
                <Check weight="bold" className="size-3 text-black" />
              </span>
              <p className="flex items-center gap-2 text-sm text-cream">
                Copied
                <span className="font-mono text-cream/50">{EMAIL}</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
