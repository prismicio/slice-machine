export function delay(time: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export function preferWroomBase(smApiUrl: string, baseUrl: string): string {
  try {
    const urlFromSmJson = new URL(smApiUrl);
    if (urlFromSmJson.hostname.endsWith(".wroom.io")) {
      urlFromSmJson.hostname = "wroom.io";
      return urlFromSmJson.origin;
    } else if (urlFromSmJson.hostname.endsWith(".wroom.test")) {
      urlFromSmJson.pathname = "wroom.test";
      return urlFromSmJson.origin;
    }
    return baseUrl;
  } catch {
    return baseUrl;
  }
}
