# Scroll-Driven Video Hero

A frame-by-frame, scroll-controlled video hero in the style of
[terminal-industries.com](https://terminal-industries.com) and
[apple.com/airpods](https://www.apple.com/airpods). The user's scroll
position drives the video's playhead — there is no autoplay.

## Pattern

```
ScrollVideoHero (orchestrator)
├── HeroNavbar                  Fixed nav, gains backdrop-blur on scroll
└── <section h-[400vh]>         4× viewport heights of scroll runway
    └── <div sticky h-screen>   Pinned stage that everything renders into
        ├── ScrollVideoStage    The <video> + gradient overlays
        ├── ScrollNarrative     Manages the narrative panels
        │   └── NarrativePanel  One per beat — fades in/out by scroll
        └── ScrollProgressIndicator  Right-rail (desktop only)
```

The outer section is **400vh** tall so that scrolling through it produces
~3 full screens of timeline. The sticky inner div pins the stage to the
viewport so the video stays in place while scroll progress accumulates.

`useScrollVideo()` reads the section's `getBoundingClientRect().top`,
normalizes to `[0, 1]`, multiplies by `video.duration`, and eases
`video.currentTime` toward that target inside a single rAF loop.
Damping (`diff * 0.12`) gives a buttery feel and de-jitters Safari's
seek behaviour. An `IntersectionObserver` gates the rAF when the section
is offscreen.

## Swapping the video

Drop new files at:

```
apps/web/public/videos/
├── hero-parking.mp4          # 1080p, ≤ 8 MB, used at ≥768 px
├── hero-parking-720.mp4      # 720p,  ≤ 4 MB, used at <768 px
└── hero-parking-poster.jpg   # First frame, ≤ 200 KB
```

### Compression (ffmpeg)

```bash
# Desktop 1080p
ffmpeg -i input.mp4 -vcodec libx264 -crf 23 -preset slow -an \
  -movflags +faststart -vf "scale=1920:1080" hero-parking.mp4

# Mobile 720p
ffmpeg -i input.mp4 -vcodec libx264 -crf 25 -preset slow -an \
  -movflags +faststart -vf "scale=1280:720" hero-parking-720.mp4

# Poster
ffmpeg -i input.mp4 -ss 00:00:00 -vframes 1 -q:v 2 hero-parking-poster.jpg
```

Notes:

- `-an` strips audio (always — the video is muted).
- `-movflags +faststart` puts the moov atom at the front so playback can
  begin before the file is fully downloaded.
- Aim for **6–10 seconds** of footage. Longer videos make scroll feel
  sluggish; shorter videos give the narrative beats too little air.

## Editing the narrative

All German copy and the `start`/`end` timing for each beat live in:

```
apps/web/src/data/heroNarrative.ts
```

`<highlight>...</highlight>` segments inside `headline` are rendered in
`#0066FF`. Add/remove beats freely — `ScrollProgressIndicator` and
`ScrollNarrative` adapt automatically. Just keep `start` and `end` in
`[0, 1]` and ensure `start < end`.

## iOS Safari

Safari refuses programmatic `currentTime` writes until the user has both
interacted with the page **and** the video has been played at least
once. `useVideoUnlock()` listens for the first `touchstart` / `click` /
`scroll`, calls `play()`, and immediately pauses — at that point the
seek API unlocks. To verify on a real device:

1. Open `/landing` on iOS Safari.
2. Tap anywhere — the page should "click" to life and the next scroll
   should advance the playhead.
3. If the video stays static after interaction, check that `<video>` has
   `playsInline` and `muted` (Safari demands both).

## Reduced motion

Users with `prefers-reduced-motion: reduce` (and any user where the
video fails to load) are routed to `StaticHeroFallback`: each beat is
rendered as its own full-height section with no scroll-binding. CTAs
and copy are identical, so no information is lost.

## Performance budget

| Asset            | Target     |
| ---------------- | ---------- |
| Hero video (1080) | ≤ 8 MB    |
| Hero video (720)  | ≤ 4 MB    |
| Poster image     | ≤ 200 KB   |
| Total page JS    | ≤ 2 MB gz  |

All scroll work happens inside a single rAF loop. The tick is paused
when the section leaves the viewport via `IntersectionObserver`. Rapid
seeks throw on Safari and are caught silently.

## Things that will bite you

- **Variable-FPS source video**: scrubbing looks awful. Always re-encode
  to a constant frame rate (`-vsync cfr`) before shipping.
- **Audio tracks**: even muted, an audio track triples decode cost on
  mobile Safari. Strip with `-an`.
- **HEVC**: don't. H.264 only — broadest device support and predictable
  seek behaviour.
- **moov atom at the end**: without `+faststart`, the browser must
  download the entire file before any frame is decodable. Always
  `+faststart`.
