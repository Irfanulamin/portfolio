"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;
// The dot glides after the pointer; the tooltip trails a touch more, so the
// two move like they're held together by a magnet.
const DOT_SPRING = { stiffness: 900, damping: 50, mass: 0.4 };
const TIP_SPRING = { stiffness: 500, damping: 40, mass: 0.5 };
// Grace period when the pointer crosses the gap between two rows, so the
// cursor doesn't close and reopen.
const HIDE_DELAY_MS = 120;
// Underline draw: starts just after the tooltip fades in.
const DRAW = { duration: 0.55, delay: 0.1, ease: EASE };

/**
 * Text in [brackets] is bold with an orange underline. Each time the label
 * appears, the underline draws from left to right.
 */
function Label({ text }: { text: string }) {
  // One inline span, so spaces are kept and every part shares a baseline.
  return (
    <span>
      {text.split(/\[([^\]]+)\]/).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="relative inline-block font-bold">
            {part}
            <motion.span
              className="absolute right-0 bottom-[-3px] left-0 h-[1.5px] origin-left bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={DRAW}
            />
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}

/**
 * Anywhere inside it, gaps included, the mouse pointer is an orange dot with a
 * soft radar ring. Over anything with `data-cursor="..."`, a tooltip also opens
 * below-right of the dot with that text. Touch and pen input are unaffected.
 */
const noop = () => () => {};

export function CursorArea({ children }: { children: React.ReactNode }) {
  // False during server render and hydration, true after, so the portal
  // (which only exists in the browser) doesn't cause a hydration mismatch.
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const reduce = useReducedMotion() ?? false;
  const [inside, setInside] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dotX = useSpring(x, DOT_SPRING);
  const dotY = useSpring(y, DOT_SPRING);
  const tipX = useSpring(x, TIP_SPRING);
  const tipY = useSpring(y, TIP_SPRING);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  function show(next: string) {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    if (next === label) return;
    // Tooltip appearing fresh: start at the pointer instead of gliding in.
    if (label === null) {
      tipX.jump(x.get());
      tipY.jump(y.get());
    }
    setLabel(next);
  }

  function hideSoon() {
    if (hideTimer.current || label === null) return;
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setLabel(null);
    }, HIDE_DELAY_MS);
  }

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    x.set(e.clientX);
    y.set(e.clientY);
    if (!inside) {
      dotX.jump(e.clientX);
      dotY.jump(e.clientY);
      setInside(true);
    }

    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
    const next =
      el && e.currentTarget.contains(el) ? (el.dataset.cursor ?? null) : null;

    if (next) show(next);
    else hideSoon();
  }

  return (
    <div
      onPointerMove={handleMove}
      onPointerLeave={() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = null;
        setInside(false);
        setLabel(null);
      }}
      className="pointer-fine:cursor-none pointer-fine:**:cursor-none"
    >
      {children}

      {mounted &&
        createPortal(
          <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
            {/* Dot with a radar ring. */}
            <motion.div
              className="absolute top-0 left-0"
              style={{ x: reduce ? x : dotX, y: reduce ? y : dotY }}
            >
              <AnimatePresence>
                {inside && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: EASE }}
                  >
                    <span className="radar-ping" />
                    <span className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_rgba(214,90,49,0.6)]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Tooltip, below-right of the dot. Fades in and out. */}
            <motion.div
              className="absolute top-0 left-0"
              style={{ x: reduce ? x : tipX, y: reduce ? y : tipY }}
            >
              <AnimatePresence>
                {label && (
                  <motion.div
                    className="absolute top-[18px] left-[21px] flex h-8 items-center rounded-full border border-primary/25 bg-[#fbf8f1] px-3.5 text-sm font-medium whitespace-nowrap text-[#1c1410] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    style={{ transformOrigin: "0 0" }}
                  >
                    <Label key={label} text={label} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>,
          document.body,
        )}
    </div>
  );
}
