"use client";

import { buttonVariants } from "@/components/ui/button";
import { useWash } from "@/lib/use-wash";
import { cn } from "@/lib/utils";

// Same size and wash animation as the social links in the banner; the fill
// is the tool's brand colour instead of cream.
const CHIP = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "wash wash-chip wash-brand h-8 cursor-default gap-1.5 rounded-full border-cream/25 bg-transparent px-3.5",
  "hover:bg-transparent",
  "duration-100 active:scale-[0.97]",
  "[&_svg]:size-4",
);

/** Dark text on light brand colours, light text on dark ones. */
function inkFor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const luma = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return luma > 150 ? "#1c1410" : "#fbf8f1";
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
          "--wash-color": color,
          "--wash-ink": inkFor(color),
        } as React.CSSProperties
      }
      {...wash}
    >
      {icon}
      <span>{name}</span>
    </li>
  );
}
