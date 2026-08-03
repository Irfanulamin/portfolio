"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

const SIZE = 70;
/* easeOutQuint — spreads quickly, then settles over a long tail like water
   losing momentum. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 1400;

export function Avatar() {
  const [origin, setOrigin] = useState({ x: SIZE / 2, y: SIZE / 2 });
  const [active, setActive] = useState(false);

  /* Track the pointer on both enter and leave, so the wash spreads from where it
     landed and later drains back toward wherever the cursor actually left. */
  const trackPointer = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  return (
    <div
      className="relative size-[70px] shrink-0"
      onMouseEnter={(event) => {
        setOrigin(trackPointer(event));
        setActive(true);
      }}
      onMouseLeave={(event) => {
        setOrigin(trackPointer(event));
        setActive(false);
      }}
    >
      <div className="relative size-full overflow-hidden rounded-full ring-3 ring-primary">
        <Image
          src="/profile.jpg"
          alt="Irfan"
          fill
          sizes="200px"
          priority
          className="object-cover"
        />
        {/* Same file as the layer beneath — the browser reuses the decoded image,
            so the grayscale copy costs no extra request. */}
        <Image
          src="/profile.jpg"
          alt=""
          aria-hidden
          fill
          sizes="200px"
          className="object-cover grayscale transition-[clip-path] motion-reduce:transition-none"
          style={{
            transitionDuration: `${DURATION}ms`,
            transitionTimingFunction: EASE,
            clipPath: `circle(${active ? 115 : 0}% at ${origin.x}px ${origin.y}px)`,
          }}
        />
      </div>
    </div>
  );
}
