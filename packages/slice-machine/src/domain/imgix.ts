/**
 * Adds Imgix resize + format params to a screenshot URL for display only.
 *
 * Slice screenshots are uploaded at full resolution and served through Imgix.
 * The stored/model URL must stay full-resolution so the CLI and Type Builder
 * receive the max-resolution image. This helper produces a resized, format-
 * optimized variant to render in the editor without changing what is stored.
 *
 * Non-Imgix URLs (blob:, data:, relative paths, other hosts) are returned
 * untouched so local previews (blob object URLs) and any non-Imgix source keep
 * working exactly as before.
 */
export function addImgixDisplayParams(
  rawUrl: string | undefined,
  options: { width: number },
): string | undefined {
  if (rawUrl === undefined || rawUrl === "") return rawUrl;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    // Relative paths, blob: without a parseable base, or garbage strings.
    return rawUrl;
  }

  // Only rewrite http(s) URLs. This excludes blob: and data: URLs used for
  // locally-read screenshots.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return rawUrl;
  }

  // The Imgix endpoint is config-driven (returned by the AWS ACL provider as
  // `imgixEndpoint`), so we cannot pin an exact host. Guard by hostname
  // containing "imgix" so we never rewrite arbitrary third-party hosts.
  if (!url.hostname.includes("imgix")) {
    return rawUrl;
  }

  // `fit=max` preserves aspect ratio and never upscales: screenshots smaller
  // than `width` are served untouched, larger ones are downscaled. We only set
  // the width so Imgix can choose the height. `auto=format,compress` lets Imgix
  // serve WebP/AVIF when supported. `set` overrides any pre-existing params.
  url.searchParams.set("auto", "format,compress");
  url.searchParams.set("fit", "max");
  url.searchParams.set("w", String(options.width));

  return url.toString();
}
