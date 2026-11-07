"use client";

import { useEffect, useState } from "react";

// Fires once when the element's top edge passes a line on the screen, given as a fraction of its height
// from the top (0.55 = just below the middle, 0.9 = as soon as it scrolls in).
// Also fires if the element is already above that line (reload mid-page) or the page bottom is reached,
// so short sections at the end never stay hidden.
export function useMidScreen<T extends Element>(
  ref: React.RefObject<T | null>,
  trigger = 0.55,
) {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    let frame = 0;
    const check = () => {
      frame = 0;
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const atBottom =
        window.scrollY + vh >= document.documentElement.scrollHeight - 4;
      if (top <= vh * trigger || atBottom) setSeen(true);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, seen, trigger]);

  return seen;
}
