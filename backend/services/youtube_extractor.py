"""Extracts transcripts from YouTube videos given a video URL."""

import re
from urllib.parse import parse_qs, urlparse

import requests
import yt_dlp
# pyrefly: ignore [missing-import]
from youtube_transcript_api import (
    NoTranscriptFound,
    TranscriptsDisabled,
    VideoUnavailable,
    YouTubeTranscriptApi,
)

_PREFERRED_LANGUAGES = ["hi", "hi-IN", "hi-orig", "hi-en", "en", "en-US", "en-GB", "en-orig", "en-IN"]


def _extract_video_id(url: str) -> str:
    """Parse a YouTube video ID out of common URL formats.

    Supports:
      - https://www.youtube.com/watch?v=VIDEO_ID
      - https://youtu.be/VIDEO_ID
      - https://www.youtube.com/embed/VIDEO_ID
      - https://www.youtube.com/shorts/VIDEO_ID
    """
    if not url or not isinstance(url, str):
        raise ValueError("YouTube URL must be a non-empty string.")

    url = url.strip()
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError(f"Invalid URL protocol '{parsed.scheme}'. Must be http or https.")

    if parsed.netloc in ("youtu.be", "www.youtu.be"):
        video_id = parsed.path.lstrip("/")
        if video_id:
            return video_id

    if "youtube.com" in parsed.netloc:
        if parsed.path == "/watch":
            query = parse_qs(parsed.query)
            video_id = query.get("v", [None])[0]
            if video_id:
                return video_id
        for prefix in ("/embed/", "/shorts/", "/v/"):
            if parsed.path.startswith(prefix):
                video_id = parsed.path[len(prefix):].split("/")[0]
                if video_id:
                    return video_id

    # Fallback: an 11-character YouTube ID pattern anywhere in the string.
    match = re.search(r"(?:v=|/)([0-9A-Za-z_-]{11})(?:[&?/]|$)", url)
    if match:
        return match.group(1)

    raise ValueError(
        f"Could not parse a video ID from '{url}'. "
        "Expected a youtube.com/watch?v=, youtu.be/, or youtube.com/embed/ URL."
    )


def _extract_via_ytdlp(url: str, video_id: str) -> tuple[str, str, str]:
    """Fallback transcript extraction using yt-dlp with mobile client simulation."""
    ydl_opts = {
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "subtitleslangs": ["hi", "hi-IN", "hi-orig", "hi-en", "en", "en-US", "en-GB", "en-orig", "en-IN", "all"],
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "ios", "mweb"]
            }
        },
        "quiet": True,
        "no_warnings": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        vid = info.get("id") or video_id
        title = info.get("title") or f"YouTube: {vid}"
        subs = info.get("subtitles") or {}
        auto_subs = info.get("automatic_captions") or {}

        selected_track = None
        for lang in ["hi", "hi-IN", "hi-orig", "hi-en", "en", "en-US", "en-GB", "en-orig", "en-IN"]:
            if lang in subs:
                selected_track = subs[lang]
                break
            elif lang in auto_subs:
                selected_track = auto_subs[lang]
                break

        if not selected_track and (subs or auto_subs):
            all_tracks = {**subs, **auto_subs}
            first_lang = next(iter(all_tracks))
            selected_track = all_tracks[first_lang]

        if not selected_track:
            raise ValueError(f"No transcript or subtitles available for video '{vid}'.")

        json_fmt = next((f for f in selected_track if f.get("ext") == "json3"), None)
        vtt_fmt = next((f for f in selected_track if f.get("ext") == "vtt"), None)
        sub_url = (
            json_fmt.get("url")
            if json_fmt
            else (vtt_fmt.get("url") if vtt_fmt else selected_track[0].get("url"))
        )

        res = requests.get(sub_url, timeout=15)
        if res.status_code != 200:
            raise ValueError(f"Failed to download transcript for video '{vid}'.")

        def _format_ts(ms: int) -> str:
            seconds = ms / 1000
            m, s = divmod(int(seconds), 60)
            h, m = divmod(m, 60)
            if h > 0:
                return f"[{h:02d}:{m:02d}:{s:02d}]"
            return f"[{m:02d}:{s:02d}]"

        text_parts = []
        if json_fmt:
            events = res.json().get("events", [])
            for event in events:
                t_start = event.get("tStartMs", 0)
                segs = event.get("segs", [])
                seg_text = "".join(s.get("utf8", "") for s in segs).strip()
                if seg_text and seg_text != "\n":
                    ts = _format_ts(t_start)
                    text_parts.append(f"{ts} {seg_text}")
        else:
            lines = res.text.splitlines()
            for line in lines:
                line = line.strip()
                if not line or line.startswith("WEBVTT") or "-->" in line or line.isdigit():
                    continue
                clean_line = re.sub(r"<[^>]+>", "", line).strip()
                if clean_line:
                    text_parts.append(clean_line)

        transcript_text = " ".join(text_parts).strip()
        if not transcript_text:
            raise ValueError(f"Transcript for video '{vid}' was empty.")

        return vid, title, transcript_text


def extract_youtube_transcript(url: str) -> tuple[str, str, str]:
    """Fetch a transcript for the given YouTube URL.

    Returns (video_id, title, transcript_text).
    Tries youtube-transcript-api first, then falls back to yt-dlp mobile
    client emulation if YouTube blocks direct API calls.
    """
    video_id = _extract_video_id(url)
    default_title = f"YouTube: {video_id}"

    try:
        api = YouTubeTranscriptApi()
        transcript_list = api.list(video_id)
        transcript = None

        # 1. Try preferred languages in manual transcripts
        try:
            transcript = transcript_list.find_manually_created_transcript(_PREFERRED_LANGUAGES)
        except Exception:
            pass

        # 2. Try preferred languages in generated/auto-captions (common for Hindi YouTube videos)
        if transcript is None:
            try:
                transcript = transcript_list.find_generated_transcript(_PREFERRED_LANGUAGES)
            except Exception:
                pass

        # 3. Try standard find_transcript
        if transcript is None:
            try:
                transcript = transcript_list.find_transcript(_PREFERRED_LANGUAGES)
            except Exception:
                pass

        # 4. Fall back to any available transcript track
        if transcript is None:
            try:
                transcript = next(iter(transcript_list))
            except StopIteration:
                transcript = None

        if transcript is not None:
            fetched = transcript.fetch()

            def _format_ts_sec(seconds: float) -> str:
                m, s = divmod(int(seconds), 60)
                h, m = divmod(m, 60)
                if h > 0:
                    return f"[{h:02d}:{m:02d}:{s:02d}]"
                return f"[{m:02d}:{s:02d}]"

            text_parts = []
            for snippet in fetched:
                text = getattr(snippet, "text", "").strip()
                if text:
                    ts = _format_ts_sec(getattr(snippet, "start", 0.0))
                    text_parts.append(f"{ts} {text}")

            transcript_text = " ".join(text_parts).strip()
            if transcript_text:
                return video_id, default_title, transcript_text
    except Exception:
        pass

    try:
        return _extract_via_ytdlp(url, video_id)
    except Exception as e:
        raise ValueError(
            f"Could not retrieve transcript for video '{video_id}': {e}"
        ) from e
