/**
 * Track metadata for the rhythm mini game.
 *
 * The note charts themselves are generated offline by scripts/chart.py and live
 * next to each audio file as <name>.chart.json, so nothing is analysed in the
 * browser at runtime.
 *
 * Music is from NoCopyrightSounds. The NCS licence allows free use but requires
 * visible credit for the track and artist, which is what `artist` feeds — keep
 * it filled in, and keep the credit line rendered.
 */

export interface TrackMeta {
  id: string;
  title: string;
  /** NCS artist, shown in the credit line. Required by the licence. */
  artist: string;
  /** The chart also carries the audio path, so that stays generator-owned. */
  chart: string;
}

export const TRACKS: TrackMeta[] = [
  {
    id: "legacy",
    title: "Legacy",
    artist: "",
    chart: "/songs/legacy.chart.json",
  },
  {
    id: "misery",
    title: "Misery",
    artist: "",
    chart: "/songs/misery.chart.json",
  },
];

export interface ChartNote {
  t: number;
  lane: number;
}

export interface Chart {
  id: string;
  /** the mix minus its drums; plays continuously */
  bed: string;
  /** the isolated drum stem, sliced per hit. null if separation was skipped */
  drums: string | null;
  /** true when hits fire real drum sounds rather than a synthesized blip */
  gated: boolean;
  offset: number;
  duration: number;
  bpm: number;
  lanes: number;
  notes: ChartNote[];
}

/**
 * Clips ship base64 as plain text rather than as an audio file.
 *
 * Download managers intercept media requests, and once one does the fetch never
 * reaches decodeAudioData — playback fails with a bare "Unable to decode audio
 * data". They match on the URL extension, the content-type, and the leading
 * bytes of the body, so a quieter binary extension does not help: an AAC clip
 * still opens with an "ftyp" box, and extensions like .bin are on the default
 * grab list anyway. Text sidesteps all three at once.
 */
export function decodeBase64(text: string): ArrayBuffer {
  const binary = atob(text.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export function creditFor(track: TrackMeta): string {
  return track.artist
    ? `${track.title} — ${track.artist} [NCS Release]`
    : `${track.title} [NCS Release]`;
}

/** How much of the drum stem a single hit plays before it is faded out. */
const DRUM_HOLD = 0.3;
const DRUM_RELEASE = 0.06;

/**
 * Fires one drum hit from the isolated stem.
 *
 * The slice starts at the note's own position in the stem, so you get that
 * exact kick or snare, but it is scheduled to sound *now* — the attack lands on
 * your keypress rather than on the grid. Playing it from the grid position
 * instead would clip the attack whenever a hit landed even slightly late.
 */
export function playDrumHit(
  ctx: AudioContext,
  buffer: AudioBuffer,
  out: AudioNode,
  atNoteTime: number,
) {
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  // hold flat, then a short ramp down so consecutive hits never click
  g.gain.setValueAtTime(1, now);
  g.gain.setValueAtTime(1, now + DRUM_HOLD);
  g.gain.linearRampToValueAtTime(0, now + DRUM_HOLD + DRUM_RELEASE);
  src.connect(g).connect(out);
  const offset = Math.max(0, Math.min(atNoteTime, buffer.duration - 0.01));
  src.start(now, offset, DRUM_HOLD + DRUM_RELEASE);
  src.stop(now + DRUM_HOLD + DRUM_RELEASE + 0.01);
}

/** Fallback tick for charts generated without stem separation. */
export function hitBlip(ctx: AudioContext, out: AudioNode, perfect: boolean) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(perfect ? 1250 : 820, t);
  osc.frequency.exponentialRampToValueAtTime(perfect ? 2000 : 1150, t + 0.05);
  const g = ctx.createGain();
  g.gain.setValueAtTime(perfect ? 0.15 : 0.1, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + 0.1);
}
