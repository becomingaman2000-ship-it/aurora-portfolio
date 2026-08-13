# Portfolio advertisement

The finished 60-second, landscape portfolio walkthrough is:

- `eustace-madawu-portfolio-ad.mp4`
- 1920×1080 at 30 fps
- H.264 video with stereo AAC audio
- English narration, original ambient music, and burned-in captions

The sequence demonstrates the portfolio's home, about, services, projects, leadership, theme switching, and contact flow. It combines animated browser captures with a short excerpt from the Makeke pitch walkthrough.

## Rebuild

From the repository root:

```bash
./deliverables/portfolio-ad/build_video.sh
```

The script uses the local ffmpeg installer when available (or a system `ffmpeg`), creates the original music bed with `make_music.py`, assembles the approved captures, mixes the narration, burns in `captions.srt`, and removes its temporary render files.
