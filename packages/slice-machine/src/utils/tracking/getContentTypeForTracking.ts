/**
 * Determines the content type of a given URL's pathname. This method is
 * designed for the `field:*` tracking event, but may be used elsewhere.
 *
 * @param pathname - A URL's pathname.
 *
 * @throws {Error} Thrown when not on a slice, custom type, or page type page.
 */
export function getContentTypeForTracking(
  pathname: string,
): "page type" | "custom type" | "slice" {
  if (pathname.startsWith("/slices/")) {
    return "slice";
  } else if (pathname.startsWith("/custom-types/")) {
    return "custom type";
  } else if (pathname.startsWith("/page-types/")) {
    return "page type";
  }

  throw new Error(`Did not detect a content type from: ${pathname}`);
}
