"use client";

import { buttonVariants } from "@/components/ui/button";
import { useWash } from "@/lib/use-wash";
import { cn } from "@/lib/utils";

// Same size and wash animation as the social links in the banner. Chips sit
// filled with the tool's brand colour; hovering fills them with white from
// the pointer, like the banner buttons.
const CHIP = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "wash wash-chip wash-brand h-8 cursor-default gap-1.5 rounded-full border-cream/25 bg-transparent px-3.5",
  "hover:bg-transparent",
  "duration-100 active:scale-[0.97]",
  "[&_svg]:size-4",
);

/** Very dark brand colours (Next.js, Vercel, Django…) don't glare, so they
 * show at full strength with a faint light border to stand off the page. */
function isDark(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) < 60;
}

export function ToolChip({
  name,
  color,
  icon,
  index,
}: {
  name: string;
  color: string;
  icon: React.ReactNode;
  index: number;
}) {
  const { style, ...wash } = useWash();

  return (
    <li
      className={CHIP}
      style={
        {
          ...style,
          "--index": index,
          "--chip-color": color,
          "--chip-mix": isDark(color) ? "100%" : "50%",
          "--chip-border": isDark(color)
            ? "color-mix(in oklab, var(--cream) 22%, transparent)"
            : "color-mix(in oklab, var(--chip-color) 55%, transparent)",
        } as React.CSSProperties
      }
      {...wash}
    >
      {icon}
      <span>{name}</span>
    </li>
  );
}
