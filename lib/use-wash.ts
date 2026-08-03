"use client";

import { useCallback, useState } from "react";

export function useWash() {
  const [wash, setWash] = useState({ x: 0, y: 0, radius: 0 });
  const [active, setActive] = useState(false);

  const track = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setWash({
      x,
      y,
      radius: Math.hypot(
        Math.max(x, rect.width - x),
        Math.max(y, rect.height - y),
      ),
    });
  }, []);

  return {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      track(event);
      setActive(true);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      track(event);
      setActive(false);
    },
    style: {
      "--wash-x": `${wash.x}px`,
      "--wash-y": `${wash.y}px`,
      "--wash-radius": active ? `${wash.radius}px` : "0px",
    } as React.CSSProperties,
  };
}
