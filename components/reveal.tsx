"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div
      data-revealed={revealed}
      initial={reduce ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      onViewportEnter={() => setRevealed(true)}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
