"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const W = 15;
const H = 11;
const CELL = 36;
const PLAYER_SPEED = 5.2;

type LevelId = "easy" | "medium" | "hard";

interface Level {
  id: LevelId;
  maze: string[];
  ghostSpeed: number;
  /** odds the bug picks the tile that closes distance instead of wandering */
  chaseBias: number;
  playerStart: { x: number; y: number };
  ghostStart: { x: number; y: number };
  pellets: number;
}

const LEVEL_MAZES: Record<LevelId, string[]> = {
  easy: [
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
  ],
  medium: [
    "###############",
    "#......#......#",
    "#.#.##.#.##.#.#",
    "#.#.........#.#",
    "#.#.#.###.#.#.#",
    "#...#..#..#...#",
    "#.#.#.###.#.#.#",
    "#.#.........#.#",
    "#.#.##.#.##.#.#",
    "#......#......#",
    "###############",
  ],
  hard: [
    "###############",
    "#.....#.#.....#",
    "#.###.#.#.###.#",
    "#...#.....#...#",
    "##.#.#.#.#.#.##",
    "#......#......#",
    "##.#.#.#.#.#.##",
    "#...#.....#...#",
    "#.###.#.#.###.#",
    "#.....#.#.....#",
    "###############",
  ],
};

function countPellets(maze: string[]): number {
  let n = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (maze[y]?.[x] === ".") n++;
  return n - 1; // the tile the player starts on is already collected
}

const LEVELS: Level[] = [
  {
    id: "easy",
    maze: LEVEL_MAZES.easy,
    ghostSpeed: 3.8,
    chaseBias: 0.6,
    playerStart: { x: 1, y: 9 },
    ghostStart: { x: 7, y: 3 },
    pellets: countPellets(LEVEL_MAZES.easy),
  },
  {
    id: "medium",
    maze: LEVEL_MAZES.medium,
    ghostSpeed: 4.6,
    chaseBias: 0.74,
    playerStart: { x: 1, y: 9 },
    ghostStart: { x: 7, y: 3 },
    pellets: countPellets(LEVEL_MAZES.medium),
  },
  {
    id: "hard",
    maze: LEVEL_MAZES.hard,
    ghostSpeed: 5.3,
    chaseBias: 0.86,
    playerStart: { x: 1, y: 9 },
    ghostStart: { x: 7, y: 3 },
    pellets: countPellets(LEVEL_MAZES.hard),
  },
];

const LAST = LEVELS.length - 1;

type Dir = { x: number; y: number };
const DIRS4: Dir[] = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
];
const UP: Dir = { x: 0, y: -1 };
const DOWN: Dir = { x: 0, y: 1 };
const LEFT: Dir = { x: -1, y: 0 };
const RIGHT: Dir = { x: 1, y: 0 };

/**
 * Keyed by lowercased `event.code` (physical key) as well as lowercased
 * `event.key` (character). Matching on `code` keeps WASD working under caps
 * lock, with shift held, and on layouts where the physical W key does not
 * produce a "w".
 */
const CONTROLS: Record<string, { dir: Dir; cap: string }> = {
  arrowup: { dir: UP, cap: "W" },
  keyw: { dir: UP, cap: "W" },
  w: { dir: UP, cap: "W" },
  arrowdown: { dir: DOWN, cap: "S" },
  keys: { dir: DOWN, cap: "S" },
  s: { dir: DOWN, cap: "S" },
  arrowleft: { dir: LEFT, cap: "A" },
  keya: { dir: LEFT, cap: "A" },
  a: { dir: LEFT, cap: "A" },
  arrowright: { dir: RIGHT, cap: "D" },
  keyd: { dir: RIGHT, cap: "D" },
  d: { dir: RIGHT, cap: "D" },
};

function controlFor(e: React.KeyboardEvent) {
  return (
    CONTROLS[e.code?.toLowerCase()] ?? CONTROLS[e.key?.toLowerCase()] ?? null
  );
}

function isConfirmKey(e: React.KeyboardEvent) {
  return (
    e.key === "Enter" ||
    e.key === " " ||
    e.code === "Enter" ||
    e.code === "NumpadEnter" ||
    e.code === "Space"
  );
}

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

const spawn = (at: { x: number; y: number }, dir: Dir | null): Ent => ({
  cx: at.x,
  cy: at.y,
  tx: at.x,
  ty: at.y,
  prog: 0,
  dir,
});

type Phase = "idle" | "playing" | "won" | "lost";

/** How long each canvas scene plays before the result screen takes over. */
const WIN_MS = 2200;
const LOSE_MS = 1900;

type Cutscene = "win" | "lose";

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
      onPointerDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className={cn(
        "grid size-12 select-none place-items-center rounded-[7px] font-mono text-sm",
        "sm:size-10 sm:text-xs",
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

const ACTION_CLASS = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "h-9 gap-1.5 rounded-full border-cream/25 bg-transparent px-5 font-mono text-xs text-cream",
  "duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]",
  "hover:border-cream hover:bg-cream hover:text-black",
);

const ACTION_PRIMARY_CLASS = cn(
  buttonVariants({ size: "sm" }),
  "h-9 gap-1.5 rounded-full bg-primary px-5 font-mono text-xs text-cream",
  "duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]",
  "hover:bg-primary/85",
);

export function PacGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [pressedCap, setPressedCap] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [cutscene, setCutscene] = useState<Cutscene | null>(null);
  const [printed, setPrinted] = useState(0);
  const reduce = useReducedMotion();

  /** Overlay panel arrives as a material — scale and blur resolve together. */
  const materialize = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 },
      }
    : {
        initial: { opacity: 0, y: 10, scale: 0.96, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
        exit: { opacity: 0, y: 10, scale: 0.96, filter: "blur(6px)" },
        transition: { type: "spring" as const, bounce: 0.2, duration: 0.5 },
      };

  const lv = LEVELS[level];
  const maze = lv.maze;
  const total = lv.pellets;
  const isOpen = (x: number, y: number) => maze[y]?.[x] === ".";

  const player = useRef<Ent>(spawn(LEVELS[0].playerStart, null));
  const ghost = useRef<Ent>(spawn(LEVELS[0].ghostStart, { x: 1, y: 0 }));
  const queued = useRef<Dir | null>(null);
  const eaten = useRef<Set<string>>(new Set());
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
      wall: withAlpha(cream, 0.06),
      pellet: creamDim,
      player: primary,
      ghost: withAlpha(cream, 0.55),
    };
  }, []);

  function draw(now: number) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const c = palette.current;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, W * CELL, H * CELL);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!isOpen(x, y)) {
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

    const g = ghost.current;
    drawSprite(ctx, GHOST, px(g), py(g), c.ghost, c.bg);
  }

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
    const progress = Math.min(elapsedMs / WIN_MS, 1);
    const cx = -span + (w + span * 2) * progress;

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

  /**
   * Loss counterpart to the victory sweep, in three beats on one clock:
   *
   *   0    -> CAUGHT   you run right to left, the bug starts further back and
   *                    closes the gap at a constant rate, landing just behind
   *                    you exactly on CAUGHT
   *   CAUGHT -> DIED   you spin out and shrink away, the bug holds position
   *   DIED -> 1        the bug sits there bobbing, so the scene never cuts to
   *                    an empty canvas before the result screen
   *
   * Every position is a linear function of t, so the chase stays in sync at
   * any frame rate, and both sprites are on screen for nearly the whole run.
   */
  function drawDefeat(elapsedMs: number) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const c = palette.current;
    const w = W * CELL;
    const h = H * CELL;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, w, h);

    const unit = SPRITE_UNIT * 2.2;
    const midY = h / 2;
    const t = Math.min(elapsedMs / LOSE_MS, 1);

    const CAUGHT = 0.55;
    const DIED = 0.78;

    // both start just off the right edge so the chase is on screen immediately
    const meetX = w * 0.3;
    const gap = unit * 0.95; // where the bug settles, right on your tail
    const chase = Math.min(t / CAUGHT, 1);
    const playerX = w * 1.06 + (meetX - w * 1.06) * chase;
    const bugX = w * 1.42 + (meetX + gap - w * 1.42) * chase;

    if (t < CAUGHT) {
      const chomping = Math.sin(elapsedMs / 70) > 0;
      drawSprite(
        ctx,
        chomping ? PLAYER_OPEN : PLAYER_SHUT,
        playerX,
        midY,
        c.player,
        c.bg,
        Math.PI, // facing left, running for the edge
        unit,
      );
    } else if (t < DIED) {
      // arcade style spin out: three turns while shrinking to nothing
      const k = (t - CAUGHT) / (DIED - CAUGHT);
      ctx.globalAlpha = 1 - k * 0.9;
      drawSprite(
        ctx,
        PLAYER_SHUT,
        meetX,
        midY,
        c.player,
        c.bg,
        Math.PI + k * Math.PI * 3,
        unit * (1 - k),
      );
      ctx.globalAlpha = 1;
    }

    // after the catch the bug idles in place rather than leaving an empty frame
    const bob = t > CAUGHT ? Math.sin((t - CAUGHT) * 26) * unit * 0.14 : 0;
    drawSprite(ctx, GHOST, bugX, midY + bob, c.ghost, c.bg, 0, unit);
  }

  useEffect(() => {
    if (phase !== "playing" && !cutscene) draw(performance.now());
  }, [phase, level, cutscene]);

  useEffect(() => {
    if (!cutscene) return;

    let rafId = 0;
    const startedAtMs = performance.now();
    const win = cutscene === "win";
    const render = win ? drawVictory : drawDefeat;

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      render(now - startedAtMs);
    };

    rafId = requestAnimationFrame(loop);
    const done = setTimeout(
      () => setCutscene(null),
      (win ? WIN_MS : LOSE_MS) + 250,
    );

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(done);
    };
  }, [cutscene]);

  useEffect(() => {
    if (phase !== "won" && phase !== "lost") return;
    const timers = [1, 2, 3].map((n) =>
      setTimeout(() => setPrinted(n), n * 260),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let rafId = 0;
    let last = 0;
    let startAt = 0;
    let frameNow = 0;
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
      setElapsed((frameNow - startAt) / 1000);
      setPrinted(0);
      if (!reduced) setCutscene(result === "won" ? "win" : "lose");
      setPhase(result);
    };

    const playerArrive = () => {
      const p = player.current;
      const k = `${p.cx},${p.cy}`;
      if (!eaten.current.has(k)) {
        eaten.current.add(k);
        setScore(eaten.current.size - 1);
        if (eaten.current.size - 1 >= total) {
          finish("won");
          stopped = true;
          return;
        }
      }
      const q = queued.current;
      if (q && isOpen(p.cx + q.x, p.cy + q.y)) p.dir = q;
      if (p.dir && isOpen(p.cx + p.dir.x, p.cy + p.dir.y)) {
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
      const options = DIRS4.filter((d) => isOpen(g.cx + d.x, g.cy + d.y)).filter(
        (d) => !(g.dir && d.x === -g.dir.x && d.y === -g.dir.y),
      );
      const pool = options.length
        ? options
        : g.dir
          ? [{ x: -g.dir.x, y: -g.dir.y }]
          : [];
      if (!pool.length) return;
      let pick: Dir;
      if (Math.random() < lv.chaseBias) {
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
      // the rAF timestamp is the clock for the whole run, so the first frame
      // seeds it rather than measuring against an earlier render
      if (!startAt) {
        startAt = now;
        last = now;
      }
      frameNow = now;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const p = player.current;
      if (!p.dir && queued.current) {
        const q = queued.current;
        if (isOpen(p.cx + q.x, p.cy + q.y)) {
          p.dir = q;
          p.tx = p.cx + q.x;
          p.ty = p.cy + q.y;
        }
      }
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
      advance(ghost.current, dt * lv.ghostSpeed, ghostArrive);

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
  }, [phase, level]);

  const startLevel = (index: number) => {
    const next = LEVELS[index];
    player.current = spawn(next.playerStart, null);
    ghost.current = spawn(next.ghostStart, { x: 1, y: 0 });
    queued.current = null;
    eaten.current = new Set([
      `${next.playerStart.x},${next.playerStart.y}`,
    ]);
    setLevel(index);
    setScore(0);
    setElapsed(0);
    setPrinted(0);
    setCutscene(null);
    setPhase("playing");
    frameRef.current?.focus({ preventScroll: true });
  };

  const won = phase === "won";
  const lost = phase === "lost";
  const over = won || lost;
  const allCleared = won && level === LAST;

  const primaryAction = () => {
    if (cutscene) return;
    if (allCleared) return startLevel(0);
    if (won) return startLevel(level + 1);
    return startLevel(level);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const control = controlFor(e);
    if (control) {
      e.preventDefault();
      queue(control.dir);
      setPressedCap(control.cap);
      return;
    }
    // Buttons inside this panel (level pills, overlay actions) handle their own
    // activation, so let their Enter/Space through instead of double-firing.
    const fromButton = (e.target as HTMLElement | null)?.closest("button");
    if (isConfirmKey(e) && !fromButton && phase !== "playing") {
      e.preventDefault();
      primaryAction();
    }
  };

  // kept short so a line never wraps and pushes the log box taller
  const resultLines = allCleared
    ? [
        `all 3 levels cleared`,
        `time ${elapsed.toFixed(2)}s`,
        "exit code 0",
      ]
    : won
      ? [
          `${lv.id} cleared, ${total}/${total} dots`,
          `time ${elapsed.toFixed(2)}s`,
          `next up: ${LEVELS[level + 1].id}`,
        ]
      : [
          `bug got you, ${score}/${total} dots`,
          `time ${elapsed.toFixed(2)}s`,
          "exit code 1",
        ];

  const headline = allCleared
    ? "You completed all the levels"
    : won
      ? `${lv.id} cleared`
      : lost
        ? "Bug got you"
        : null;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-cream/15 bg-cream/[0.02] font-mono text-xs">
      <div className="flex items-center gap-2 border-b border-cream/10 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-primary/70" />
          <span className="size-2.5 rounded-full bg-cream/20" />
          <span className="size-2.5 rounded-full bg-cream/20" />
        </span>
        <span className="ml-1 text-cream/40">dot-run - zsh</span>
      </div>

      <div
        className="space-y-3 p-4"
        onKeyDown={onKeyDown}
        onKeyUp={() => setPressedCap(null)}
      >
        <p className="text-cream/40">
          <span className="text-primary">➜</span> ~/portfolio{" "}
          <span className="text-cream/70">./dot-run --level {lv.id}</span>
        </p>

        <div
          role="group"
          aria-label="Choose a level"
          className="flex items-center gap-1"
        >
          {LEVELS.map((l, i) => (
            <button
              key={l.id}
              type="button"
              onClick={() => startLevel(i)}
              aria-current={i === level ? "true" : undefined}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px]",
                "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96]",
                "outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                i === level
                  ? "bg-primary/15 text-primary"
                  : "text-cream/55 hover:bg-cream/10 hover:text-cream",
              )}
            >
              {l.id}
            </button>
          ))}
        </div>

        <div
          ref={frameRef}
          tabIndex={0}
          aria-label="Maze mini game. Move the cursor with arrow keys or WASD, collect every token, and avoid the bug."
          className={cn(
            // padded shell so the border never sits on the canvas clip edge,
            // which is what made the corners read thin
            "rounded-[12px] border bg-black p-1.5 outline-none transition-colors duration-500",
            won
              ? "border-primary"
              : lost
                ? "border-cream/40"
                : "border-cream/20 focus-visible:border-primary",
          )}
        >
          <div className="relative overflow-hidden rounded-[6px]">
          <canvas
            ref={canvasRef}
            width={W * CELL}
            height={H * CELL}
            className="block h-auto w-full"
          />

          <AnimatePresence>
          {phase !== "playing" && !cutscene && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="glass absolute inset-0 grid place-items-center bg-black/70 px-4 backdrop-blur-[3px]"
            >
              <motion.div
                {...materialize}
                className="flex flex-col items-center gap-3 text-center"
              >
                {headline && (
                  <p
                    className={cn(
                      "font-mono text-sm tracking-[0.2em] uppercase",
                      won ? "text-primary" : "text-cream/70",
                    )}
                  >
                    {headline}
                  </p>
                )}

                {allCleared && (
                  <p className="max-w-[26ch] text-[11px] leading-relaxed text-cream/45">
                    Easy, medium and hard are all done. Start over whenever you
                    want another run.
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {phase === "idle" && (
                    <button
                      type="button"
                      onClick={() => startLevel(0)}
                      className={ACTION_PRIMARY_CLASS}
                    >
                      <span>➜</span>
                      run
                    </button>
                  )}

                  {lost && (
                    <button
                      type="button"
                      onClick={() => startLevel(level)}
                      className={ACTION_PRIMARY_CLASS}
                    >
                      <ArrowCounterClockwiseIcon weight="bold" />
                      try again
                    </button>
                  )}

                  {won && !allCleared && (
                    <>
                      <button
                        type="button"
                        onClick={() => startLevel(level)}
                        className={ACTION_CLASS}
                      >
                        <ArrowCounterClockwiseIcon weight="bold" />
                        try again
                      </button>
                      <button
                        type="button"
                        onClick={() => startLevel(level + 1)}
                        className={ACTION_PRIMARY_CLASS}
                      >
                        next level
                        <ArrowRightIcon weight="bold" />
                      </button>
                    </>
                  )}

                  {allCleared && (
                    <button
                      type="button"
                      onClick={() => startLevel(0)}
                      className={ACTION_PRIMARY_CLASS}
                    >
                      <ArrowClockwiseIcon weight="bold" />
                      start over
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
          </div>
        </div>

        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          aria-live="polite"
        >
          <div className="space-y-1">
            <p className="text-cream/40">
              dots{" "}
              <span className="text-cream/70">
                {score}/{total}
              </span>
              <span className="ml-3 text-cream/25">
                {phase === "playing" ? "running…" : over ? "done" : "idle"}
              </span>
            </p>

            {/* fixed height, bottom anchored: new lines push older ones up and
                out of view instead of resizing the panel */}
            <div className="mt-1 flex h-14 flex-col justify-end gap-0.5 overflow-hidden">
              {over &&
                resultLines.slice(0, printed).map((line, i) => (
                  <motion.p
                    key={line}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "shrink-0 truncate",
                      i === 0
                        ? won
                          ? "text-primary"
                          : "text-cream/60"
                        : "text-cream/35",
                    )}
                  >
                    {line}
                  </motion.p>
                ))}
            </div>
          </div>

          <div className="mx-auto grid w-[156px] shrink-0 grid-cols-3 gap-1.5 select-none sm:mx-0 sm:w-[132px]">
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
  );
}
