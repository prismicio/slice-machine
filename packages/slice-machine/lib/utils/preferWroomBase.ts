export default function preferWroomBase(smApiUrl: string): string {
  try {
    const urlFromSmJson = new URL(smApiUrl);
    if (urlFromSmJson.hostname.endsWith(".wroom.io")) {
      urlFromSmJson.hostname = "wroom.io";
      return urlFromSmJson.origin;
    } else if (urlFromSmJson.hostname.endsWith(".wroom.test")) {
      urlFromSmJson.hostname = "wroom.test";
      return urlFromSmJson.origin;
    }
    return "https://prismic.io";
  } catch {
    return "https://prismic.io";
  }
}
