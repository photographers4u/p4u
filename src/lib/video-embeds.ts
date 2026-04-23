const INSTAGRAM_REEL_HOSTS = new Set(["instagram.com", "www.instagram.com"]);
const YOUTUBE_HOSTS = new Set([
  "m.youtube.com",
  "music.youtube.com",
  "www.youtube.com",
  "youtube.com",
]);
const YOUTUBE_SHORT_HOST = "youtu.be";
const INSTAGRAM_REEL_CODE_PATTERN = /^[A-Za-z0-9_-]{5,80}$/;
const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function getParsedUrl(value: string) {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function getPathSegments(url: URL) {
  return url.pathname.split("/").filter(Boolean);
}

export function getInstagramReelCode(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const url = getParsedUrl(value.trim());

  if (!url || !INSTAGRAM_REEL_HOSTS.has(url.hostname.toLowerCase())) {
    return null;
  }

  const [mediaType, shortcode] = getPathSegments(url);

  if (
    mediaType !== "reel" ||
    !shortcode ||
    !INSTAGRAM_REEL_CODE_PATTERN.test(shortcode)
  ) {
    return null;
  }

  return shortcode;
}

export function getYouTubeVideoId(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const url = getParsedUrl(value.trim());

  if (!url) {
    return null;
  }

  const host = url.hostname.toLowerCase();
  let videoId: string | null = null;

  if (host === YOUTUBE_SHORT_HOST) {
    videoId = getPathSegments(url)[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(host)) {
    const [route, id] = getPathSegments(url);

    if (route === "watch") {
      videoId = url.searchParams.get("v");
    } else if (route === "embed" || route === "shorts" || route === "live") {
      videoId = id ?? null;
    }
  }

  return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
}

export function isInstagramReelUrl(value: string) {
  return Boolean(getInstagramReelCode(value));
}

export function isYouTubeVideoUrl(value: string) {
  return Boolean(getYouTubeVideoId(value));
}

export function getInstagramReelEmbedUrl(value: string | null | undefined) {
  const shortcode = getInstagramReelCode(value);

  return shortcode ? `https://www.instagram.com/reel/${shortcode}/embed` : null;
}

export function getYouTubeVideoEmbedUrl(value: string | null | undefined) {
  const videoId = getYouTubeVideoId(value);

  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}
