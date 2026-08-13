# Eustace Madawu — Cinematic Portfolio Advertisement

A 56-second cinematic tech-luxury profile built from the real portfolio interface, Eustace Madawu photography, original product footage, generated environment plates, a professional voiceover, and an original electronic score.

## Final deliverable

- **Video:** `eustace-madawu-cinematic-ad.mp4`
- **Runtime:** 56.02 seconds
- **Picture:** 1920×1080, 30 fps, H.264 High, yuv420p
- **Audio:** AAC stereo, 48 kHz
- **Captions:** `captions-v2.srt`
- **Homepage poster:** `scenes/01-portrait.jpg`

## Creative direction

The spot uses an obsidian/cyan tech-luxury world, floating portfolio UI, layered product screens, restrained kinetic type, camera pushes, cut-driven sound design, and a concise narration. The sequence moves through identity, engineering capabilities, Makeke, Hit Campus Guide, people-first leadership, visual themes, contact, and a direct end card.

## Narration

> Some portfolios tell you what someone can do. This one shows you. Meet Eustace Madawu — software engineer, product builder, and people-first leader from Harare. Move through a digital experience designed like the work itself: clear, responsive, and built with intent. Explore full-stack engineering, product strategy, data, and automation. See Makeke turn fragmented bakery supply into one connected marketplace. Watch Hit Campus Guide make every destination easier to find. Discover leadership grounded in people, programmes, and real responsibility. Change the mood. Follow the flow. Start a conversation in seconds. This is more than a portfolio. It is proof of execution — from idea, to interface, to impact. Eustace Madawu. Build what comes next.

## Rebuild

From the repository root:

```bash
deliverables/portfolio-ad-v2/build_video.sh
```

The rebuild uses ImageMagick, Python 3, and the repository-local ffmpeg binary installed at `node_modules/@ffmpeg-installer/linux-x64/ffmpeg`. It regenerates scene composites, the original score and SFX, motion clips, and the final MP4. Intermediate build files are intentionally ignored.
