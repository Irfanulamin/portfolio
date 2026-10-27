"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowClockwiseIcon,
  ArrowRightIcon,
  PlayIcon,
} from "@phosphor-icons/react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  creditFor,
  decodeBase64,
  hitBlip,
  playDrumHit,
  TRACKS,
  type Chart,
} from "@/lib/tracks";

const LANES = 3;
/** Home row minus the pinky, plus arrows for anyone who finds letters awkward. */
const LANE_KEYS = ["S", "D", "F"];
const LANE_ARROWS = ["←", "↓", "→"];

const CANVAS_W = 420;
const CANVAS_H = 520;
const LANE_W = CANVAS_W / LANES;
const HIT_Y = 430;
const TILE_H = 56;

// relaxed tuning: slow approach and generous windows
const FALL_SEC = 2;
const COUNTDOWN_SEC = 3;
const PERFECT_WINDOW = 0.14;
const GOOD_WINDOW = 0.28;
const TAIL_SEC = 1.5;
/** Track sits well under the hit feedback rather than dominating the page. */
const MUSIC_LEVEL = 0.36;

const LANE_CONTROLS: Record<string, number> = {
  keys: 0,
  s: 0,
  arrowleft: 0,
  keyd: 1,
  d: 1,
  arrowdown: 1,
  keyf: 2,
  f: 2,
  arrowright: 2,
};

function laneFor(e: React.KeyboardEvent): number | null {
  const byCode = LANE_CONTROLS[e.code?.toLowerCase()];
  const byKey = LANE_CONTROLS[e.key?.toLowerCase()];
  return byCode ?? byKey ?? null;
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

const FALLBACK = {
  black: "#0c0a09",
  cream: "#f5f1ea",
  primary: "#d65a31",
};

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)}, ${parseInt(h.slice(2, 4), 16)}, ${parseInt(h.slice(4, 6), 16)}, ${alpha})`;
}

interface Tile {
  time: number;
  lane: number;
  state: "pending" | "hit" | "missed";
}

function gradeFor(accuracy: number): string {
  if (accuracy >= 95) return "S";
  if (accuracy >= 85) return "A";
  if (accuracy >= 70) return "B";
  if (accuracy >= 50) return "C";
  return "D";
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

type Phase = "idle" | "loading" | "running" | "done";

export function PianoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [stats, setStats] = useState({ hits: 0, miss: 0, combo: 0, best: 0 });
  const [totalNotes, setTotalNotes] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [printed, setPrinted] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const track = TRACKS[trackIndex];

  const tiles = useRef<Tile[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);
  const musicGain = useRef<GainNode | null>(null);
  const sfxGain = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTime = useRef(0);
  const bufferCache = useRef<
    Map<string, { bed: AudioBuffer; drums: AudioBuffer | null }>
  >(new Map());
  /** drum stem for the current track; null when the chart is not gated */
  const drumsRef = useRef<AudioBuffer | null>(null);
  const chartCache = useRef<Map<string, Chart>>(new Map());
  const scoreRef = useRef({ hits: 0, miss: 0, combo: 0, best: 0 });
  const hitQueue = useRef<{ lane: number; at: number }[]>([]);
  const feedback = useRef<{ text: string; lane: number; until: number } | null>(
    null,
  );
  const laneFlash = useRef<number[]>(Array(LANES).fill(0));
  /** any press, hit or not — the receptor should answer every input */
  const pressFlash = useRef<number[]>(Array(LANES).fill(0));
  const palette = useRef({
    bg: FALLBACK.black,
    line: withAlpha(FALLBACK.cream, 0.07),
    tile: withAlpha(FALLBACK.cream, 0.45),
    missed: withAlpha(FALLBACK.cream, 0.12),
    primary: FALLBACK.primary,
  });

  useEffect(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (name: string, fb: string) =>
      s.getPropertyValue(name).trim() || fb;
    const cream = v("--cream", FALLBACK.cream);
    palette.current = {
      bg: v("--black", FALLBACK.black),
      line: withAlpha(cream, 0.07),
      tile: withAlpha(cream, 0.45),
      missed: withAlpha(cream, 0.12),
      primary: v("--primary", FALLBACK.primary),
    };
  }, []);

  const draw = useCallback((elapsed: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const c = palette.current;

    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    for (let lane = 0; lane < LANES; lane++) {
      if (laneFlash.current[lane] > elapsed) {
        const k = (laneFlash.current[lane] - elapsed) / 0.18;
        ctx.fillStyle = withAlpha(FALLBACK.primary, 0.16 * k);
        ctx.fillRect(lane * LANE_W, 0, LANE_W, CANVAS_H);
      }
    }

    ctx.strokeStyle = c.line;
    ctx.lineWidth = 1;
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_W, 0);
      ctx.lineTo(i * LANE_W, CANVAS_H);
      ctx.stroke();
    }

    // Receptors carry the key label. In a rhythm game your eyes never leave the
    // hit line, so the mapping has to live here rather than on controls parked
    // below the panel where you would have to look away to read them.
    for (let lane = 0; lane < LANES; lane++) {
      const lit = pressFlash.current[lane] > elapsed;
      const x = lane * LANE_W + 8;
      const w = LANE_W - 16;

      if (lit) {
        ctx.fillStyle = withAlpha(FALLBACK.primary, 0.28);
        ctx.fillRect(x, HIT_Y, w, TILE_H);
      }

      ctx.strokeStyle = lit
        ? c.primary
        : withAlpha(FALLBACK.cream, 0.22);
      ctx.lineWidth = lit ? 2 : 1.5;
      ctx.strokeRect(x, HIT_Y, w, TILE_H);

      ctx.textAlign = "center";
      ctx.fillStyle = lit ? c.primary : withAlpha(FALLBACK.cream, 0.5);
      ctx.font = "600 15px ui-monospace, monospace";
      ctx.fillText(LANE_KEYS[lane], x + w / 2, HIT_Y + 24);
      ctx.fillStyle = lit
        ? withAlpha(FALLBACK.primary, 0.8)
        : withAlpha(FALLBACK.cream, 0.3);
      ctx.font = "500 12px ui-monospace, monospace";
      ctx.fillText(LANE_ARROWS[lane], x + w / 2, HIT_Y + 42);
    }

    ctx.fillStyle = c.primary;
    ctx.fillRect(0, HIT_Y - 2, CANVAS_W, 3);

    for (const t of tiles.current) {
      if (t.state === "hit") continue;
      const y = HIT_Y - ((t.time - elapsed) / FALL_SEC) * HIT_Y;
      if (y < -TILE_H || y > CANVAS_H) continue;
      ctx.fillStyle = t.state === "missed" ? c.missed : c.tile;
      ctx.fillRect(t.lane * LANE_W + 8, y, LANE_W - 16, TILE_H);
      if (t.state === "pending") {
        ctx.fillStyle = withAlpha(FALLBACK.cream, 0.75);
        ctx.fillRect(t.lane * LANE_W + 8, y, LANE_W - 16, 2);
      }
    }

    const fb = feedback.current;
    if (fb && fb.until > elapsed) {
      ctx.globalAlpha = Math.max((fb.until - elapsed) / 0.45, 0);
      ctx.fillStyle = fb.text === "miss" ? c.missed : c.primary;
      ctx.font = "600 13px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(fb.text, fb.lane * LANE_W + LANE_W / 2, HIT_Y - 20);
      ctx.globalAlpha = 1;
    }

    if (elapsed < 0) {
      const n = Math.ceil(-elapsed);
      const frac = 1 - (-elapsed - Math.floor(-elapsed));
      ctx.globalAlpha = 0.3 + frac * 0.6;
      ctx.fillStyle = c.primary;
      ctx.font = "700 100px ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(n), CANVAS_W / 2, CANVAS_H / 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = withAlpha(FALLBACK.cream, 0.5);
      ctx.font = "500 13px ui-monospace, monospace";
      ctx.fillText("get ready", CANVAS_W / 2, CANVAS_H / 2 + 78);
      ctx.textBaseline = "alphabetic";
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // already ended
      }
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
  }, []);

  useEffect(() => stopAudio, [stopAudio]);

  useEffect(() => {
    if (phase === "idle" || phase === "done") draw(-COUNTDOWN_SEC);
  }, [phase, trackIndex, draw]);

  useEffect(() => {
    if (phase !== "running") return;
    const ctx = audioCtx.current;
    if (!ctx) return;

    let rafId = 0;
    let stopped = false;
    const duration = chartCache.current.get(track.id)?.duration ?? 30;

    const loop = () => {
      if (stopped) return;
      rafId = requestAnimationFrame(loop);
      const elapsed = ctx.currentTime - startTime.current;

      const nextCount = elapsed < 0 ? Math.ceil(-elapsed) : 0;
      setCountdown((prev) => (prev === nextCount ? prev : nextCount));

      let changed = false;

      if (hitQueue.current.length) {
        const queued = hitQueue.current;
        hitQueue.current = [];
        for (const { lane, at } of queued) {
          let best: Tile | null = null;
          let bestDiff = Infinity;
          for (const t of tiles.current) {
            if (t.state !== "pending" || t.lane !== lane) continue;
            const diff = Math.abs(t.time - at);
            if (diff < GOOD_WINDOW && diff < bestDiff) {
              best = t;
              bestDiff = diff;
            }
          }
          if (!best) continue;
          best.state = "hit";
          const perfect = bestDiff <= PERFECT_WINDOW;
          scoreRef.current.hits += 1;
          scoreRef.current.combo += 1;
          scoreRef.current.best = Math.max(
            scoreRef.current.best,
            scoreRef.current.combo,
          );
          changed = true;
          feedback.current = {
            text: perfect ? "perfect" : "good",
            lane,
            until: elapsed + 0.45,
          };
          laneFlash.current[lane] = elapsed + 0.18;
          // The whole point of the game: your hit fires the track's own drum
          // sound from this moment. Nothing plays it if you miss, so the beat
          // is genuinely yours to keep or drop.
          if (sfxGain.current) {
            if (drumsRef.current) {
              playDrumHit(ctx, drumsRef.current, sfxGain.current, best.time);
            } else {
              hitBlip(ctx, sfxGain.current, perfect);
            }
          }
        }
      }

      for (const t of tiles.current) {
        if (t.state === "pending" && elapsed - t.time > GOOD_WINDOW) {
          t.state = "missed";
          scoreRef.current.miss += 1;
          scoreRef.current.combo = 0;
          changed = true;
          feedback.current = { text: "miss", lane: t.lane, until: elapsed + 0.45 };
        }
      }

      if (changed) setStats({ ...scoreRef.current });

      if (elapsed > duration + TAIL_SEC) {
        stopped = true;
        stopAudio();
        setPrinted(0);
        setPhase("done");
        return;
      }

      draw(elapsed);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  }, [phase, track.id, draw, stopAudio]);

  useEffect(() => {
    if (phase !== "done") return;
    const timers = [1, 2, 3].map((i) =>
      setTimeout(() => setPrinted(i), i * 260),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  const startTrack = async (index: number) => {
    const next = TRACKS[index];
    stopAudio();
    setError(null);
    setTrackIndex(index);
    setPhase("loading");

    if (!audioCtx.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioCtx.current = new Ctor();
      // Separate buses: the hit blip is feedback, so it has to stay audible
      // over the track rather than scaling down with the music level.
      musicGain.current = audioCtx.current.createGain();
      musicGain.current.gain.value = MUSIC_LEVEL;
      musicGain.current.connect(audioCtx.current.destination);
      sfxGain.current = audioCtx.current.createGain();
      sfxGain.current.gain.value = 0.9;
      sfxGain.current.connect(audioCtx.current.destination);
    }
    const ctx = audioCtx.current;
    if (ctx.state === "suspended") await ctx.resume();

    try {
      let chart = chartCache.current.get(next.id);
      if (!chart) {
        const res = await fetch(next.chart);
        if (!res.ok) throw new Error(`chart ${res.status}`);
        chart = (await res.json()) as Chart;
        chartCache.current.set(next.id, chart);
      }

      const loadStem = async (url: string): Promise<AudioBuffer> => {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`audio ${res.status}`);
        const bytes = decodeBase64(await res.text());
        // An interrupted or intercepted fetch leaves too little to decode, and
        // decodeAudioData's own error says only "Unable to decode audio data".
        if (bytes.byteLength < 1024) {
          throw new Error("audio did not load - try a hard refresh");
        }
        return ctx.decodeAudioData(bytes);
      };

      let stems = bufferCache.current.get(next.id);
      if (!stems) {
        const [bed, drums] = await Promise.all([
          loadStem(chart.bed),
          chart.drums ? loadStem(chart.drums) : Promise.resolve(null),
        ]);
        stems = { bed, drums };
        bufferCache.current.set(next.id, stems);
      }
      drumsRef.current = stems.drums;

      tiles.current = chart.notes.map((n) => ({
        time: n.t,
        lane: Math.min(LANES - 1, n.lane),
        state: "pending",
      }));
      setTotalNotes(tiles.current.length);
      scoreRef.current = { hits: 0, miss: 0, combo: 0, best: 0 };
      setStats({ hits: 0, miss: 0, combo: 0, best: 0 });
      hitQueue.current = [];
      feedback.current = null;
      laneFlash.current = Array(LANES).fill(0);
      pressFlash.current = Array(LANES).fill(0);
      setPrinted(0);

      const source = ctx.createBufferSource();
      source.buffer = stems.bed;
      source.connect(musicGain.current!);
      const at = ctx.currentTime + COUNTDOWN_SEC;
      source.start(at, chart.offset, chart.duration);
      sourceRef.current = source;
      startTime.current = at;

      setCountdown(COUNTDOWN_SEC);
      setPhase("running");
      frameRef.current?.focus({ preventScroll: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "could not load track");
      setPhase("idle");
    }
  };

  const hitLane = (lane: number) => {
    const ctx = audioCtx.current;
    if (phase !== "running" || !ctx) return;
    const elapsed = ctx.currentTime - startTime.current;
    pressFlash.current[lane] = elapsed + 0.12;
    if (elapsed < 0) return;
    hitQueue.current = [...hitQueue.current, { lane, at: elapsed }];
  };

  const accuracy = totalNotes ? (stats.hits / totalNotes) * 100 : 0;
  const isLast = trackIndex === TRACKS.length - 1;

  const primaryAction = () => {
    if (phase === "done" && !isLast) return void startTrack(trackIndex + 1);
    if (phase === "idle" || phase === "done") return void startTrack(trackIndex);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.repeat) return;
    const lane = laneFor(e);
    if (lane !== null) {
      e.preventDefault();
      hitLane(lane);
      return;
    }
    const fromButton = (e.target as HTMLElement | null)?.closest("button");
    if (isConfirmKey(e) && !fromButton && phase !== "running") {
      e.preventDefault();
      primaryAction();
    }
  };

  const resultLines =
    phase === "done"
      ? [
          `${track.title}: ${stats.hits}/${totalNotes} notes`,
          `accuracy ${accuracy.toFixed(0)}% - best combo ${stats.best}`,
          `grade ${gradeFor(accuracy)}`,
        ]
      : [];

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-cream/15 bg-cream/[0.02] font-mono text-xs">
      <div className="flex items-center gap-2 border-b border-cream/10 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-primary/70" />
          <span className="size-2.5 rounded-full bg-cream/20" />
          <span className="size-2.5 rounded-full bg-cream/20" />
        </span>
        <span className="ml-1 text-cream/40">key-hits - zsh</span>
      </div>

      <div
        className="space-y-3 p-4"
        onKeyDown={onKeyDown}
      >
        <p className="text-cream/40">
          <span className="text-primary">➜</span> ~/portfolio{" "}
          <span className="text-cream/70">./key-hits --track {track.id}</span>
        </p>

        <div
          role="group"
          aria-label="Choose a track"
          className="flex flex-wrap items-center gap-1"
        >
          {TRACKS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => void startTrack(i)}
              aria-current={i === trackIndex ? "true" : undefined}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[11px]",
                "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96]",
                "outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                i === trackIndex
                  ? "bg-primary/15 text-primary"
                  : "text-cream/55 hover:bg-cream/10 hover:text-cream",
              )}
            >
              {t.title}
            </button>
          ))}
        </div>

        <div
          ref={frameRef}
          tabIndex={0}
          aria-label="Rhythm mini game. The track plays on its own; press S, D or F, use the arrow keys, or click a lane as each tile reaches the line."
          className={cn(
            "rounded-[12px] border bg-black p-1.5 outline-none transition-colors duration-500",
            phase === "done"
              ? "border-primary"
              : "border-cream/20 focus-visible:border-primary",
          )}
        >
          <div className="relative overflow-hidden rounded-[6px]">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="block h-auto w-full"
            />

            {/* full-height click targets so it is playable with a mouse alone */}
            <div className="absolute inset-0 grid grid-cols-3">
              {LANE_KEYS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  aria-label={`Hit lane ${label}`}
                  tabIndex={-1}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    hitLane(i);
                  }}
                  className={cn(
                    "h-full w-full cursor-pointer border-0 bg-transparent outline-none",
                    phase !== "running" && "pointer-events-none",
                  )}
                />
              ))}
            </div>

            <AnimatePresence>
              {phase !== "running" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="glass absolute inset-0 grid place-items-center bg-black/75 px-5 backdrop-blur-[3px]"
                >
                  <motion.div
                    initial={
                      reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }
                    }
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    {phase === "loading" && (
                      <p className="font-mono text-[11px] tracking-[0.2em] text-cream/60 uppercase">
                        loading track…
                      </p>
                    )}

                    {phase === "done" && (
                      <p className="font-mono text-sm tracking-[0.2em] text-primary uppercase">
                        {track.title} done
                      </p>
                    )}

                    {phase === "idle" && (
                      <div className="space-y-2.5">
                        <p className="font-mono text-sm tracking-[0.2em] text-cream/80 uppercase">
                          how to play
                        </p>
                        <ul className="space-y-1.5 text-[11px] leading-relaxed text-cream/55">
                          <li>
                            <span className="text-cream/85">
                              you are the drums
                            </span>{" "}
                            — the song plays without them
                          </li>
                          <li>
                            <span className="text-cream/85">S D F</span> or{" "}
                            <span className="text-cream/85">← ↓ →</span>, or
                            click a lane
                          </li>
                          <li>hit as the tile touches the orange line</li>
                          <li>miss one and the beat drops out</li>
                        </ul>
                        {error && (
                          <p className="text-[11px] text-primary">{error}</p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {phase === "idle" && (
                        <button
                          type="button"
                          onClick={() => void startTrack(trackIndex)}
                          className={ACTION_PRIMARY_CLASS}
                        >
                          <PlayIcon weight="bold" />
                          start
                        </button>
                      )}

                      {phase === "done" && (
                        <>
                          <button
                            type="button"
                            onClick={() => void startTrack(trackIndex)}
                            className={ACTION_CLASS}
                          >
                            <ArrowClockwiseIcon weight="bold" />
                            again
                          </button>
                          {!isLast && (
                            <button
                              type="button"
                              onClick={() => void startTrack(trackIndex + 1)}
                              className={ACTION_PRIMARY_CLASS}
                            >
                              next track
                              <ArrowRightIcon weight="bold" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-1" aria-live="polite">
          <p className="text-cream/40">
            notes{" "}
            <span className="text-cream/70">
              {stats.hits}/{totalNotes}
            </span>
            {stats.combo > 1 && (
              <span className="ml-3 text-primary">x{stats.combo}</span>
            )}
            <span className="ml-3 text-cream/25">
              {phase === "running"
                ? countdown > 0
                  ? `starting in ${countdown}`
                  : "playing…"
                : phase}
            </span>
          </p>

          <div className="mt-1 flex h-14 flex-col justify-end gap-0.5 overflow-hidden">
            {phase === "done" &&
              resultLines.slice(0, printed).map((line, i) => (
                <motion.p
                  key={line}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "shrink-0 truncate",
                    i === 0 ? "text-primary" : "text-cream/35",
                  )}
                >
                  {line}
                </motion.p>
              ))}
          </div>
        </div>

        {/* NCS licence requires visible credit for the track and artist */}
        <p className="border-t border-cream/10 pt-3 text-[10px] leading-relaxed text-cream/30">
          Music: {creditFor(track)} · free to use via{" "}
          <a
            href="https://ncs.io"
            target="_blank"
            rel="noreferrer noopener"
            className="text-cream/45 underline underline-offset-2 hover:text-cream/70"
          >
            NoCopyrightSounds
          </a>
        </p>
      </div>
    </div>
  );
}
