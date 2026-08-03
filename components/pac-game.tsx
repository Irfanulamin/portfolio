"use client";

import { useEffect, useRef, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* 15x11 — 68 open cells, so 67 pellets once the spawn cell is eaten.
   Verified: fully connected, zero dead ends.

   Shape matters as much as the count. Two mirrored chambers open off the
   centre column, wide plazas run left and right, and the spine pinches to a
   single lane at row 5 — so routes vary in width and there are commit points,
   rather than one uniform lattice where every junction looks like the last. */
const MAZE = [
  "###############",
  "#......#......#",
  "#.####...####.#",
  "#.####...####.#",
  "#.....###.....#",
  "#.###.###.###.#",
  "#.....###.....#",
  "#.####...####.#",
  "#.####...####.#",
  "#......#......#",
  "###############",
];
const W = 15;
const H = 11;
const CELL = 36;
const PLAYER_START = { x: 1, y: 9 };
const GHOST_START = { x: 7, y: 3 };
const PLAYER_SPEED = 5.2; // cells per second
const GHOST_SPEED = 4.0;

type Dir = { x: number; y: number };
const DIRS4: Dir[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];
const KEY_DIRS: Record<string, Dir> = {
  ArrowUp: { x: 0, y: -1 },
  w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  d: { x: 1, y: 0 },
};
const KEY_TO_CAP: Record<string, string> = {
  ArrowUp: "W",
  w: "W",
  ArrowLeft: "A",
  a: "A",
  ArrowDown: "S",
  s: "S",
  ArrowRight: "D",
  d: "D",
};

const open = (x: number, y: number) => MAZE[y]?.[x] === ".";

/* 8x8 sprites. '#' is body, 'o' is punched through to the background. Drawn as
   discrete squares so the characters stay chunky and aliased on purpose. */
const SPRITE_UNIT = CELL / 10;

const PLAYER_OPEN = [
  "..####..",
  ".######.",
  "#####...",
  "####....",
  "####....",
  "#####...",
  ".######.",
  "..####..",
];

const PLAYER_SHUT = [
  "..####..",
  ".######.",
  "########",
  "########",
  "########",
  "########",
  ".######.",
  "..####..",
];

const GHOST = [
  "..####..",
  ".######.",
  "########",
  "#oo##oo#",
  "#oo##oo#",
  "########",
  "########",
  "##.##.##",
];

function drawSprite(
  ctx: CanvasRenderingContext2D,
  rows: string[],
  cx: number,
  cy: number,
  body: string,
  hole: string,
  angle = 0,
  unit = SPRITE_UNIT,
) {
  const span = rows.length * unit;
  ctx.save();
  ctx.translate(cx, cy);
  if (angle) ctx.rotate(angle);
  ctx.translate(-span / 2, -span / 2);

  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === ".") continue;
      ctx.fillStyle = ch === "o" ? hole : body;
      ctx.fillRect(
        Math.round(x * unit),
        Math.round(y * unit),
        Math.ceil(unit),
        Math.ceil(unit),
      );
    }
  }
  ctx.restore();
}

interface Ent {
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  prog: number;
  dir: Dir | null;
}

const px = (e: Ent) => (e.cx + (e.tx - e.cx) * e.prog + 0.5) * CELL;
const py = (e: Ent) => (e.cy + (e.ty - e.cy) * e.prog + 0.5) * CELL;

function totalPellets(): number {
  let n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (open(x, y)) n++;
  return n - 1; // player start cell is eaten on spawn
}
const TOTAL = totalPellets();

type Phase = "idle" | "playing" | "won" | "lost";

/* How long the victory chomp takes to cross the board. */
const VICTORY_MS = 2200;

/* Palette hexes, read once from the stylesheet so the canvas tracks the tokens
   in globals.css rather than duplicating them. */
const FALLBACK = {
  black: "#0c0a09",
  cream: "#f5f1ea",
  creamDim: "#e6e1d6",
  primary: "#d65a31",
};

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function Keycap({
  label,
  onPress,
  aria,
  pressed,
}: {
  label: string;
  onPress: () => void;
  aria: string;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={aria}
      /* pointerdown beats click on touch, and preventDefault keeps focus on the
         board so the keyboard keeps working alongside the pad */
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      /* Mechanical keycap built from three stacked cues:
         1. a 5px solid skirt  — the key's side wall
         2. an ambient drop    — the shadow it casts on the board
         3. a top-edge inset   — the catch-light on the moulded lip
         The face is a vertical gradient so it reads as a dished surface rather
         than a flat rectangle. Travel equals skirt height exactly, so pressing
         seats the cap on the board instead of sinking through it. */
      className={cn(
        "grid size-10 select-none place-items-center rounded-[7px] font-mono text-xs",
        "transition-[transform,box-shadow,background-color,color] duration-90 ease-out",
        "active:translate-y-[5px]",
        "active:shadow-[0_0_0_0_#9a9488,0_1px_2px_0_rgba(0,0,0,0.5)]",
        pressed
          ? [
              "translate-y-[5px] bg-primary text-cream",
              "shadow-[0_0_0_0_#a0421f,0_1px_2px_0_rgba(0,0,0,0.5)]",
            ]
          : [
              "bg-gradient-to-b from-cream to-cream-dim text-black",
              "shadow-[0_5px_0_0_#9a9488,0_7px_10px_-2px_rgba(0,0,0,0.55),inset_0_1px_0_0_rgba(255,255,255,0.75)]",
              "hover:from-white hover:to-cream",
            ],
      )}
    >
      {label}
    </button>
  );
}

export function PacGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [pressedCap, setPressedCap] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  /* True while the victory animation plays, before the result panel appears. */
  const [celebrating, setCelebrating] = useState(false);
  /* How many result lines have "typed" out — drives the console printout. */
  const [printed, setPrinted] = useState(0);

  /* Seeded from the same constants the maze is validated against — hardcoding
     these separately let them drift onto a wall when the maze changed. */
  const player = useRef<Ent>({
    cx: PLAYER_START.x,
    cy: PLAYER_START.y,
    tx: PLAYER_START.x,
    ty: PLAYER_START.y,
    prog: 0,
    dir: null,
  });
  const ghost = useRef<Ent>({
    cx: GHOST_START.x,
    cy: GHOST_START.y,
    tx: GHOST_START.x,
    ty: GHOST_START.y,
    prog: 0,
    dir: { x: 1, y: 0 },
  });
  const queued = useRef<Dir | null>(null);
  const eaten = useRef<Set<string>>(new Set());
  const startedAt = useRef<number>(0);
  const palette = useRef({
    bg: FALLBACK.black,
    wall: withAlpha(FALLBACK.cream, 0.06),
    pellet: FALLBACK.creamDim,
    player: FALLBACK.primary,
    ghost: withAlpha(FALLBACK.cream, 0.55),
  });

  const queue = (d: Dir) => {
    queued.current = d;
  };

  useEffect(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (name: string, fallback: string) =>
      s.getPropertyValue(name).trim() || fallback;

    const black = v("--black", FALLBACK.black);
    const cream = v("--cream", FALLBACK.cream);
    const creamDim = v("--cream-dim", FALLBACK.creamDim);
    const primary = v("--primary", FALLBACK.primary);

    palette.current = {
      bg: black,
      /* Flat blackish-grey blocks. The maze is scenery — the sprites and dots
         carry the detail, so any texture here just competes with them. */
      wall: withAlpha(cream, 0.06),
      /* Solid off-white, not a faint tint — the dots are the thing you're
         hunting, so they should read first. */
      pellet: creamDim,
      player: primary,
      ghost: withAlpha(cream, 0.55),
    };
  }, []);

  // Draw the idle board once on mount and whenever phase leaves 'playing'.
  // 'won' is excluded — the victory loop owns the canvas while it runs.
  useEffect(() => {
    if (phase !== "playing" && phase !== "won") draw(performance.now());
  }, [phase]);

  /* Victory lap: a big sprite chomps a row of dots clean across the board. */
  useEffect(() => {
    if (phase !== "won") return;

    let rafId = 0;
    const startedAtMs = performance.now();

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      drawVictory(now - startedAtMs);
    };

    rafId = requestAnimationFrame(loop);
    const done = setTimeout(() => setCelebrating(false), VICTORY_MS + 250);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(done);
    };
  }, [phase]);

  function drawVictory(elapsedMs: number) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const c = palette.current;
    const w = W * CELL;
    const h = H * CELL;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    const unit = SPRITE_UNIT * 2.2;
    const span = 8 * unit;
    const midY = h / 2;
    const progress = Math.min(elapsedMs / VICTORY_MS, 1);
    const cx = -span + (w + span * 2) * progress;

    // dots still ahead of the sprite
    ctx.fillStyle = c.pellet;
    for (let x = CELL; x < w; x += CELL) {
      if (x < cx) continue;
      ctx.beginPath();
      ctx.arc(x, midY, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    const chomping = Math.sin(elapsedMs / 70) > 0;
    drawSprite(
      ctx,
      chomping ? PLAYER_OPEN : PLAYER_SHUT,
      cx,
      midY,
      c.player,
      c.bg,
      0,
      unit,
    );
  }

  /* Print the result lines one at a time, like output streaming to a terminal.
     The counter is reset by whoever changes phase, not here — resetting state
     synchronously inside an effect triggers a cascading render. */
  useEffect(() => {
    if (phase !== "won" && phase !== "lost") return;
    const timers = [1, 2, 3].map((n) =>
      setTimeout(() => setPrinted(n), n * 260),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  function draw(now: number) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const c = palette.current;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W * CELL, H * CELL);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!open(x, y)) {
          ctx.fillStyle = c.wall;
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        } else if (!eaten.current.has(`${x},${y}`)) {
          ctx.fillStyle = c.pellet;
          ctx.beginPath();
          ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // player: pixel sprite, chomping and rotated to face its direction
    const p = player.current;
    const ang = p.dir ? Math.atan2(p.dir.y, p.dir.x) : 0;
    const chomping = Math.sin(now / 90) > 0;
    drawSprite(
      ctx,
      chomping ? PLAYER_OPEN : PLAYER_SHUT,
      px(p),
      py(p),
      c.player,
      c.bg,
      ang,
    );

    // ghost: pixel sprite, never rotated — its eyes should stay upright
    const g = ghost.current;
    drawSprite(ctx, GHOST, px(g), py(g), c.ghost, c.bg);
  }

  useEffect(() => {
    if (phase !== "playing") return;

    let rafId = 0;
    let last = performance.now();
    let stopped = false;

    const advance = (e: Ent, dist: number, onArrive: () => void) => {
      while (dist > 0 && e.dir) {
        const remain = 1 - e.prog;
        const step = Math.min(dist, remain);
        e.prog += step;
        dist -= step;
        if (e.prog >= 1 - 1e-6) {
          e.cx = e.tx;
          e.cy = e.ty;
          e.prog = 0;
          onArrive();
        }
      }
    };

    const finish = (result: Phase) => {
      setElapsed((performance.now() - startedAt.current) / 1000);
      setPrinted(0);
      if (result === "won") setCelebrating(true);
      setPhase(result);
    };

    const playerArrive = () => {
      const p = player.current;
      const k = `${p.cx},${p.cy}`;
      if (!eaten.current.has(k)) {
        eaten.current.add(k);
        setScore(eaten.current.size - 1); // start cell does not count
        if (eaten.current.size - 1 >= TOTAL) {
          finish("won");
          stopped = true;
          return;
        }
      }
      const q = queued.current;
      if (q && open(p.cx + q.x, p.cy + q.y)) p.dir = q;
      if (p.dir && open(p.cx + p.dir.x, p.cy + p.dir.y)) {
        p.tx = p.cx + p.dir.x;
        p.ty = p.cy + p.dir.y;
      } else {
        p.dir = null;
        p.tx = p.cx;
        p.ty = p.cy;
      }
    };

    const ghostArrive = () => {
      const g = ghost.current;
      const p = player.current;
      const options = DIRS4.filter((d) => open(g.cx + d.x, g.cy + d.y)).filter(
        (d) => !(g.dir && d.x === -g.dir.x && d.y === -g.dir.y),
      );
      const pool = options.length
        ? options
        : g.dir
          ? [{ x: -g.dir.x, y: -g.dir.y }]
          : [];
      if (!pool.length) return;
      let pick: Dir;
      /* Chases most junctions, wanders the rest — enough unpredictability that
         you cannot just hold one loop, without it being relentless. */
      if (Math.random() < 0.68) {
        pick = pool.reduce((best, d) => {
          const dist = (dd: Dir) =>
            Math.abs(g.cx + dd.x - p.cx) + Math.abs(g.cy + dd.y - p.cy);
          return dist(d) < dist(best) ? d : best;
        });
      } else {
        pick = pool[Math.floor(Math.random() * pool.length)]!;
      }
      g.dir = pick;
      g.tx = g.cx + pick.x;
      g.ty = g.cy + pick.y;
    };

    const loop = (now: number) => {
      if (stopped) return;
      rafId = requestAnimationFrame(loop);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const p = player.current;
      // start moving from rest when a queued direction opens up
      if (!p.dir && queued.current) {
        const q = queued.current;
        if (open(p.cx + q.x, p.cy + q.y)) {
          p.dir = q;
          p.tx = p.cx + q.x;
          p.ty = p.cy + q.y;
        }
      }
      // instant reverse feels right in pac-likes
      if (
        p.dir &&
        queued.current &&
        queued.current.x === -p.dir.x &&
        queued.current.y === -p.dir.y
      ) {
        const { cx, cy, tx, ty } = p;
        p.cx = tx;
        p.cy = ty;
        p.tx = cx;
        p.ty = cy;
        p.prog = 1 - p.prog;
        p.dir = queued.current;
      }

      advance(p, dt * PLAYER_SPEED, playerArrive);
      if (stopped) return;
      advance(ghost.current, dt * GHOST_SPEED, ghostArrive);

      const g = ghost.current;
      if (Math.hypot(px(p) - px(g), py(p) - py(g)) < CELL * 0.62) {
        finish("lost");
        stopped = true;
        return;
      }

      draw(now);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  }, [phase]);

  const start = () => {
    player.current = {
      cx: PLAYER_START.x,
      cy: PLAYER_START.y,
      tx: PLAYER_START.x,
      ty: PLAYER_START.y,
      prog: 0,
      dir: null,
    };
    ghost.current = {
      cx: GHOST_START.x,
      cy: GHOST_START.y,
      tx: GHOST_START.x,
      ty: GHOST_START.y,
      prog: 0,
      dir: { x: 1, y: 0 },
    };
    queued.current = null;
    eaten.current = new Set([`${PLAYER_START.x},${PLAYER_START.y}`]);
    startedAt.current = performance.now();
    setScore(0);
    setElapsed(0);
    setPrinted(0);
    setCelebrating(false);
    setPhase("playing");
    frameRef.current?.focus({ preventScroll: true });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const d = KEY_DIRS[e.key];
    if (d) {
      e.preventDefault();
      queue(d);
      setPressedCap(KEY_TO_CAP[e.key] ?? null);
    }
    if ((e.key === "Enter" || e.key === " ") && phase !== "playing") {
      e.preventDefault();
      start();
    }
  };

  const won = phase === "won";
  const over = won || phase === "lost";

  const resultLines = won
    ? [
        `You cleared the board — ${TOTAL}/${TOTAL} dots`,
        `time ${elapsed.toFixed(2)}s`,
        "exit code 0",
      ]
    : [
        `You got killed by a bug — ${score}/${TOTAL} dots`,
        `time ${elapsed.toFixed(2)}s`,
        "exit code 1",
      ];

  return (
    <section id="play" className="scroll-mt-24 space-y-6 pt-14">
      <div className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-cream">
          Playground
        </h2>
        <p className="text-base text-cream/60">
          A tiny arcade break. Clear every token, outrun the bug.
        </p>
      </div>

      {/* Terminal chrome — the whole thing reads as a program you ran. */}
      {/* The whole window scales down and centres, so the chrome, board and
          controls stay in proportion. Full width on phones, where 70% of an
          already narrow column would be unplayable. */}
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-cream/15 bg-cream/[0.02] font-mono text-xs">
        <div className="flex items-center gap-2 border-b border-cream/10 px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-primary/70" />
            <span className="size-2.5 rounded-full bg-cream/20" />
            <span className="size-2.5 rounded-full bg-cream/20" />
          </span>
          <span className="ml-1 text-cream/40">dot-run — zsh</span>
        </div>

        <div
          className="space-y-3 p-4"
          onKeyDown={onKeyDown}
          onKeyUp={() => setPressedCap(null)}
        >
          <p className="text-cream/40">
            <span className="text-primary">➜</span> ~/portfolio{" "}
            <span className="text-cream/70">./dot-run --maze {W}x{H}</span>
          </p>

          <div
            ref={frameRef}
            tabIndex={0}
            aria-label="Maze mini game. Move the cursor with arrow keys or WASD, collect every token, and avoid the bug."
            /* Fills the window again — the window itself is what's smaller now,
               so the board no longer floats inside an oversized frame. */
            className={`relative overflow-hidden rounded-lg border outline-none transition-colors duration-500 ${
              won ? "border-primary" : "border-cream/10 focus-visible:border-primary"
            }`}
          >
            <canvas
              ref={canvasRef}
              width={W * CELL}
              height={H * CELL}
              className="block h-auto w-full"
            />

            {/* Held back while the victory chomp plays, so the animation isn't
                covered by its own result panel. */}
            {phase !== "playing" && !celebrating && (
              <div className="absolute inset-0 grid place-items-center gap-3 bg-black/70 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-3">
                  {won && (
                    <p className="font-mono text-sm tracking-[0.2em] text-primary uppercase">
                      You won{" <3"}
                    </p>
                  )}
                  {phase === "lost" && (
                    <p className="font-mono text-sm tracking-[0.2em] text-cream/70 uppercase">
                      Bug got you{" </3"}
                    </p>
                  )}

                  {/* Same outline-pill language as the social links, so the page
                      has one button, not two competing ones. */}
                  <button
                    type="button"
                    onClick={start}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "h-9 gap-1.5 rounded-full border-cream/25 bg-transparent px-5 font-mono text-xs",
                      "transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      "hover:border-cream hover:bg-cream hover:text-black",
                    )}
                  >
                    <span className="text-primary">➜</span>
                    {phase === "idle" ? "run" : "run again"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
            aria-live="polite"
          >
            <div className="space-y-1">
              <p className="text-cream/40">
                dots{" "}
                <span className="text-cream/70">
                  {score}/{TOTAL}
                </span>
                <span className="ml-3 text-cream/25">
                  {phase === "playing" ? "running…" : over ? "done" : "idle"}
                </span>
              </p>

              {/* Result streams in line by line, like stdout. */}
              {over && (
                <div className="space-y-0.5 pt-1">
                  {resultLines.slice(0, printed).map((line, i) => (
                    <p
                      key={line}
                      className={
                        i === 0
                          ? won
                            ? "text-primary"
                            : "text-cream/60"
                          : "text-cream/35"
                      }
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="grid w-[132px] grid-cols-3 gap-1.5 select-none">
              <span />
              <Keycap
                label="W"
                aria="Move up"
                pressed={pressedCap === "W"}
                onPress={() => queue({ x: 0, y: -1 })}
              />
              <span />
              <Keycap
                label="A"
                aria="Move left"
                pressed={pressedCap === "A"}
                onPress={() => queue({ x: -1, y: 0 })}
              />
              <Keycap
                label="S"
                aria="Move down"
                pressed={pressedCap === "S"}
                onPress={() => queue({ x: 0, y: 1 })}
              />
              <Keycap
                label="D"
                aria="Move right"
                pressed={pressedCap === "D"}
                onPress={() => queue({ x: 1, y: 0 })}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
