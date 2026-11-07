"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import { useMidScreen } from "@/lib/use-mid-screen";

// Rises, fades and un-blurs its content as soon as it scrolls into view.
// Sets data-revealed so CSS-driven children (.stagger lists) cascade in at the same moment.
export function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useMidScreen(ref, 0.9);

  return (
    <motion.div
      ref={ref}
      data-revealed={seen}
      initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(6px)" }}
      animate={seen ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      // A leftover transform or filter would trap the fixed cursor overlay inside this box, so drop both once done.
      onAnimationComplete={() => {
        if (!ref.current) return;
        ref.current.style.transform = "none";
        ref.current.style.filter = "none";
      }}
    >
      {children}
    </motion.div>
  );
}
