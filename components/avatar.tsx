"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import HalftoneReveal from "@/components/halftone-reveal";

const SCALE = 2; // mask resolution vs CSS pixels
const BRUSH = 22; // scratch width, CSS px
const AUTO_CLEAR = 0.8; // once this much is scratched, the rest clears itself
const CLEAR_MS = 700;

type Point = { x: number; y: number };

/**
 * A scratchy brush stroke from a to b: several thin, uneven bristle lines
 * across the brush width, plus a few specks flicked off the edges, so the
 * scratched area has rough, streaky edges instead of a clean cut.
 */
function roughStroke(ctx: CanvasRenderingContext2D, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy) || 1;
  // Unit vector across the stroke.
  const nx = -dy / length;
  const ny = dx / length;
  const half = (BRUSH / 2) * SCALE;

  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const offset = (Math.random() * 2 - 1) * half;
    const wobble = () => (Math.random() * 2 - 1) * 1.5 * SCALE;
    ctx.globalAlpha = 0.45 + Math.random() * 0.55;
    ctx.lineWidth = (1 + Math.random() * 3.5) * SCALE;
    ctx.beginPath();
    ctx.moveTo(
      a.x * SCALE + nx * offset + wobble(),
      a.y * SCALE + ny * offset + wobble(),
    );
    ctx.lineTo(
      b.x * SCALE + nx * offset + wobble(),
      b.y * SCALE + ny * offset + wobble(),
    );
    ctx.stroke();
  }

  for (let i = 0; i < 4; i++) {
    const t = Math.random();
    const offset =
      (Math.random() < 0.5 ? -1 : 1) * half * (0.8 + Math.random() * 0.6);
    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
    ctx.beginPath();
    ctx.arc(
      (a.x + dx * t) * SCALE + nx * offset,
      (a.y + dy * t) * SCALE + ny * offset,
      (0.5 + Math.random()) * SCALE,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Profile photo printed as cream and orange halftone dots (React Bits), used
 * like a scratch card. Moving the mouse over it scratches the dots off for
 * good, uncovering the sharp photo underneath, and once about 80% is gone
 * the rest clears outward on its own. On touch screens a tap clears it, spreading out from that point.
 */
export function Avatar() {
  const printRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const done = useRef(false);
  const moves = useRef(0);
  const frame = useRef(0);

  // The mask: opaque where the print shows, transparent where scratched.
  useEffect(() => {
    const print = printRef.current;
    if (!print) return;
    const canvas = document.createElement("canvas");
    canvas.width = print.clientWidth * SCALE;
    canvas.height = print.clientHeight * SCALE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    maskRef.current = canvas;
    print.style.maskSize = "100% 100%";
    apply();
    return () => cancelAnimationFrame(frame.current);
  }, []);

  function apply() {
    const print = printRef.current;
    const canvas = maskRef.current;
    if (!print || !canvas) return;
    print.style.maskImage = `url(${canvas.toDataURL()})`;
  }

  function scheduleApply() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(apply);
  }

  function context() {
    const ctx = maskRef.current?.getContext("2d");
    if (ctx) ctx.globalCompositeOperation = "destination-out";
    return ctx;
  }

  function scratchedShare(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let clear = 0;
    let total = 0;
    // Sample every 4th pixel; only count pixels inside the circle.
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        if (Math.hypot(x - width / 2, y - height / 2) > width / 2) continue;
        total++;
        if (data[(y * width + x) * 4 + 3] < 200) clear++; // mostly scratched counts
      }
    }
    return total ? clear / total : 0;
  }

  function clearFrom(x: number, y: number) {
    if (done.current) return;
    done.current = true;
    const ctx = context();
    if (!ctx) return;
    const { width, height } = ctx.canvas;
    const cx = x * SCALE;
    const cy = y * SCALE;
    const reach = Math.hypot(
      Math.max(cx, width - cx),
      Math.max(cy, height - cy),
    );
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();

    const step = (now: number) => {
      // The first frame's timestamp can be slightly before `start`, so clamp at 0 too (a negative radius throws).
      const t = reduce ? 1 : Math.min(1, Math.max(0, (now - start) / CLEAR_MS));
      const eased = 1 - (1 - t) ** 3;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, reach * eased + 1, 0, Math.PI * 2);
      ctx.fill();
      apply();
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  }

  function locate(event: React.PointerEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function scratch(event: React.PointerEvent<HTMLElement>) {
    if (done.current || event.pointerType !== "mouse") return;
    const ctx = context();
    if (!ctx) return;
    const point = locate(event);
    const from = last.current ?? point;
    roughStroke(ctx, from, point);
    last.current = point;
    scheduleApply();

    moves.current += 1;
    if (moves.current % 8 === 0 && scratchedShare(ctx) > AUTO_CLEAR) {
      clearFrom(point.x, point.y);
    }
  }

  return (
    <div className="orbit relative block size-[76px] shrink-0 rounded-full p-[3px]">
      <div
        role="img"
        aria-label="Irfan"
        className="relative size-full touch-manipulation overflow-hidden rounded-full bg-black"
        onPointerMove={scratch}
        onPointerLeave={() => (last.current = null)}
        onPointerDown={(event) => {
          // Phones can't hover to scratch, so a tap clears it instead.
          if (event.pointerType === "mouse") return;
          const { x, y } = locate(event);
          clearFrom(x, y);
        }}
      >
        {/* The real photo, underneath. A normal image, so it stays sharp. */}
        <Image
          src="/profile.jpg"
          alt=""
          fill
          sizes="152px"
          priority
          className="object-cover"
        />
        {/* Halftone print on top; the mask decides what's been scratched off. */}
        <div ref={printRef} className="pointer-events-none absolute inset-0">
          <HalftoneReveal
            src="/profile-avatar.jpg"
            mode="duotone"
            paperColor="#0c0a09"
            inkColor="#f5f1ea"
            accentColor="#d65a31"
            cellSize={2.75}
            angle={45}
            contrast={0.95}
            revealRadius={0}
            intro={false}
          />
        </div>
      </div>
    </div>
  );
}
