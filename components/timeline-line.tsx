"use client";

import { useRef } from "react";

import { useMidScreen } from "@/lib/use-mid-screen";

// The grey line between two companies. It waits until it reaches the middle of the screen, then draws downward.
export function TimelineLine() {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useMidScreen(ref);

  return (
    <span
      ref={ref}
      aria-hidden
      data-drawn={seen}
      className="timeline-line absolute top-[60px] left-5 h-[calc(100%-56px)] w-px bg-linear-to-b from-cream/40 to-cream/10"
    />
  );
}
