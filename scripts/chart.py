"""
Builds the rhythm game's audio and note charts from the files in public/songs.

The game is played against the track's own percussion: the drums are separated
out, the rest of the mix plays as a continuous bed, and each note you hit fires
the real drum sound from that moment in the song. Miss, and that hit simply is
not there — the beat drops out.

That shape drives the whole pipeline:

  1. pick the most energetic 30s window of the source track (the drop, usually)
  2. cut it and run Demucs to split drums from everything else
  3. detect onsets on the DRUMS stem, so every note is an actual drum hit, and
     lanes fall out as kick / snare / hat rather than arbitrary bands
  4. ship both stems base64-encoded as text

Everything here runs offline. Run it once and commit the output.

    python scripts/chart.py                # chart every mp3 in public/songs
    python scripts/chart.py --clip 30      # excerpt length, seconds
    python scripts/chart.py --lanes 3      # lanes to spread drum hits over
    python scripts/chart.py --no-stems     # skip Demucs, chart the full mix

Output lands next to each track as <name>.chart.json plus the stem clips.
"""

from __future__ import annotations

import argparse
import base64
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import librosa
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SONGS = ROOT / "public" / "songs"

# analysis rate; plenty for onset detection and much faster than 44.1k
SR = 22050

# Download managers (IDM and friends) intercept browser requests for media, and
# once one grabs the request the fetch never reaches decodeAudioData — playback
# dies with a bare "Unable to decode audio data". They match on the URL
# extension, the content-type, and the leading bytes of the body, so picking a
# quieter binary extension loses this game: an AAC clip still opens with an
# "ftyp" box, and half the plausible extensions (.bin included) are on the
# default grab list anyway.
#
# Shipping base64 as plain text sidesteps all three at once. Costs about a
# third more bytes and ends the problem outright.
BED_SUFFIX = ".bed.txt"
DRUMS_SUFFIX = ".drums.txt"


def ffmpeg_exe() -> str:
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()


def run(cmd: list[str], what: str) -> bool:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        tail = (result.stderr or result.stdout).strip()[-400:]
        print(f"  ! {what} failed: {tail}", file=sys.stderr)
        return False
    return True


def cut_wav(src: Path, dest: Path, offset: float, duration: float) -> bool:
    """Cut a lossless working copy of the chosen window."""
    return run(
        [
            ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(src),
            # after -i so ffmpeg decodes and discards, which is sample accurate;
            # the chart is aligned to this cut so a coarse seek would drift
            "-ss", f"{offset:.4f}",
            "-t", f"{duration:.4f}",
            "-vn", "-c:a", "pcm_s16le", "-ar", "44100",
            str(dest),
        ],
        "ffmpeg cut",
    )


def encode_clip(src: Path, dest: Path, bitrate: str) -> bool:
    """AAC-encode a stem and write it out base64 as text."""
    tmp = src.with_suffix(".enc.m4a")
    ok = run(
        [
            ffmpeg_exe(), "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(src),
            "-vn", "-c:a", "aac", "-b:a", bitrate,
            "-movflags", "+faststart", "-f", "mp4",
            str(tmp),
        ],
        "ffmpeg encode",
    )
    if not ok:
        tmp.unlink(missing_ok=True)
        return False
    try:
        dest.write_text(base64.b64encode(tmp.read_bytes()).decode("ascii"))
    finally:
        tmp.unlink(missing_ok=True)
    return True


def separate(clip: Path, workdir: Path) -> tuple[Path, Path] | None:
    """Split a clip into (drums, everything else) with Demucs."""
    out = workdir / "stems"
    ok = run(
        [
            sys.executable, "-m", "demucs",
            "--two-stems=drums",
            "-d", "cpu",
            "-o", str(out),
            str(clip),
        ],
        "demucs",
    )
    if not ok:
        return None

    # demucs writes <out>/<model>/<clip stem>/{drums,no_drums}.wav
    drums = next(out.rglob("drums.wav"), None)
    bed = next(out.rglob("no_drums.wav"), None)
    if drums is None or bed is None:
        print("  ! demucs produced no stems", file=sys.stderr)
        return None
    return drums, bed


def pick_window(y: np.ndarray, sr: int, clip: float) -> float:
    """Return the start offset of the most energetic `clip`-second window.

    In practice this lands on the drop or a chorus rather than a quiet intro,
    which is what you want from a 30 second excerpt. Guards trim the head and
    tail so a clip never opens or closes on a fade.
    """
    total = len(y) / sr
    if total <= clip:
        return 0.0

    hop = int(sr * 0.1)
    rms = librosa.feature.rms(y=y, frame_length=hop * 2, hop_length=hop)[0]

    cells = int(clip / 0.1)
    guard = min(int(20 / 0.1), int(len(rms) * 0.15))
    lo = guard
    hi = max(lo + 1, len(rms) - cells - guard)
    if hi <= lo:
        return 0.0

    smoothed = np.convolve(rms, np.ones(cells) / cells, mode="valid")
    region = smoothed[lo:hi]
    if region.size == 0:
        return 0.0
    return float((lo + int(np.argmax(region))) * 0.1)


def snap_to_beat(y: np.ndarray, sr: int, offset: float) -> tuple[float, float]:
    """Nudge the clip start onto the nearest beat and report the tempo."""
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
    bpm = float(np.atleast_1d(tempo)[0])
    if len(beats) == 0:
        return offset, bpm
    nearest = beats[int(np.argmin(np.abs(beats - offset)))]
    # only snap if a beat is close, so we never jump into a different section
    if abs(nearest - offset) < 1.0:
        return float(nearest), bpm
    return offset, bpm


def detect(y: np.ndarray, sr: int, lanes: int):
    """Onset times, a brightness value per onset, and their strengths."""
    hop = 512
    n_mels = 128
    channels = list(np.linspace(0, n_mels, lanes + 1).astype(int))

    multi = librosa.onset.onset_strength_multi(
        y=y, sr=sr, hop_length=hop, channels=channels, n_mels=n_mels
    )
    combined = multi.sum(axis=0)

    frames = librosa.onset.onset_detect(
        onset_envelope=combined, sr=sr, hop_length=hop,
        backtrack=True, units="frames",
    )
    if len(frames) == 0:
        return np.array([]), np.array([]), np.array([])

    times = librosa.frames_to_time(frames, sr=sr, hop_length=hop)
    strength = combined[frames]

    # Brightness as the energy-weighted mean band index rather than a plain
    # argmax. argmax collapses onto whichever band is loudest overall, which on
    # a kick-heavy stem leaves the top lane nearly empty; a weighted centroid
    # keeps the ordering meaningful so the quantile split below can balance it.
    weights = multi[:, frames]
    idx = np.arange(multi.shape[0]).reshape(-1, 1)
    totals = weights.sum(axis=0)
    totals[totals == 0] = 1.0
    brightness = (weights * idx).sum(axis=0) / totals
    return times, brightness, strength


def thin(times, strength, min_gap: float, max_notes: int):
    """Keep the strongest onsets subject to spacing and a total ceiling."""
    order = np.argsort(-strength)
    kept: list[int] = []
    for i in order:
        if len(kept) >= max_notes:
            break
        if all(abs(times[k] - times[i]) >= min_gap for k in kept):
            kept.append(int(i))
    kept.sort(key=lambda k: times[k])
    return kept


def build_notes(times, brightness, keep, lanes: int):
    """Split kept onsets into lanes on brightness quantiles.

    Fixed frequency cutoffs leave the top lane empty on a kick-heavy stem;
    quantiles adapt to this particular track so every lane earns a roughly
    equal share while still ordering low to high — kick, snare, hat.
    """
    kept_brightness = np.array([brightness[k] for k in keep])
    cuts = [np.quantile(kept_brightness, (i + 1) / lanes) for i in range(lanes - 1)]

    notes = []
    run_len = 0
    last = -1
    for k in keep:
        lane = int(np.searchsorted(cuts, brightness[k]))
        lane = max(0, min(lanes - 1, lane))
        # break up long same-lane runs, which read as a stuck key
        if lane == last:
            run_len += 1
            if run_len >= 3:
                lane = (lane + 1) % lanes
                run_len = 0
        else:
            run_len = 0
        last = lane
        notes.append({"t": round(float(times[k]), 4), "lane": lane})
    return notes


def chart_file(path: Path, args) -> dict | None:
    print(f"  loading {path.name} ...", flush=True)
    y, sr = librosa.load(str(path), sr=SR, mono=True)
    duration = len(y) / sr

    offset = pick_window(y, sr, args.clip)
    offset, bpm = snap_to_beat(y, sr, offset)
    clip_len = min(args.clip, max(duration - offset, 0.0))

    with tempfile.TemporaryDirectory() as td:
        work = Path(td)
        clip_wav = work / f"{path.stem}.wav"
        if not cut_wav(path, clip_wav, offset, clip_len):
            return None

        drums_wav = bed_wav = None
        if args.stems:
            print("  separating drums (demucs, cpu) ...", flush=True)
            stems = separate(clip_wav, work)
            if stems is None:
                print("  ! falling back to the full mix", file=sys.stderr)
            else:
                drums_wav, bed_wav = stems

        # Chart against the drums when we have them: every note is then a real
        # drum hit, and the lane split becomes kick / snare / hat instead of an
        # arbitrary slice of a full mix.
        analysis_src = drums_wav if drums_wav else clip_wav
        ay, asr = librosa.load(str(analysis_src), sr=SR, mono=True)
        times, brightness, strength = detect(ay, asr, args.lanes)
        if len(times) == 0:
            print(f"  ! no onsets found in {path.name}", file=sys.stderr)
            return None

        keep = thin(times, strength, args.min_gap, int(clip_len * args.density))
        notes = build_notes(times, brightness, keep, args.lanes)

        per_lane = [sum(1 for n in notes if n["lane"] == i) for i in range(args.lanes)]
        print(
            f"  {path.stem}: {len(notes)} notes over {clip_len:.1f}s "
            f"({len(notes) / clip_len:.1f}/s), {bpm:.0f} bpm, "
            f"clip @ {offset:.1f}s, lanes {per_lane}"
        )

        bed_dest = path.parent / f"{path.stem}{BED_SUFFIX}"
        drums_dest = path.parent / f"{path.stem}{DRUMS_SUFFIX}"

        if not encode_clip(bed_wav or clip_wav, bed_dest, "128k"):
            return None
        result = {
            "id": path.stem,
            "bed": f"/songs/{bed_dest.name}",
            "drums": None,
            "gated": False,
            "offset": 0.0,
            "duration": round(clip_len, 3),
            "bpm": round(bpm, 1),
            "lanes": args.lanes,
            "notes": notes,
        }

        if drums_wav and encode_clip(drums_wav, drums_dest, "96k"):
            result["drums"] = f"/songs/{drums_dest.name}"
            result["gated"] = True
        else:
            drums_dest.unlink(missing_ok=True)

        sizes = " + ".join(
            f"{p.stat().st_size / 1_048_576:.2f} MB"
            for p in (bed_dest, drums_dest)
            if p.exists()
        )
        print(f"  encoded -> {sizes} base64")
        return result


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--clip", type=float, default=30.0)
    ap.add_argument("--lanes", type=int, default=3)
    ap.add_argument(
        "--min-gap", type=float, default=0.26,
        help="smallest gap between notes, seconds (higher = easier)",
    )
    ap.add_argument(
        "--density", type=float, default=2.6,
        help="ceiling on notes per second (lower = easier)",
    )
    ap.add_argument(
        "--no-stems", dest="stems", action="store_false",
        help="skip Demucs and chart the full mix instead",
    )
    args = ap.parse_args()

    if args.stems and shutil.which("ffmpeg") is None:
        pass  # imageio-ffmpeg supplies its own binary; nothing to check

    files = sorted(SONGS.glob("*.mp3"))
    if not files:
        print(f"no mp3 files in {SONGS}", file=sys.stderr)
        return 1

    print(f"charting {len(files)} file(s) -> {args.lanes} lanes, {args.clip:.0f}s clips")
    for path in files:
        result = chart_file(path, args)
        if result is None:
            continue
        out = path.with_suffix(".chart.json")
        out.write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(f"  wrote {out.relative_to(ROOT)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
