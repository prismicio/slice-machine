export default function preferWroomBase(smApiUrl: string): string {
  try {
    const url = new URL(smApiUrl);
    const suffixes = [
      ".wroom.io",
      ".wroom.test",
      ".dev-tools-wroom.com",
      ".marketing-tools-wroom.com",
      ".platform-wroom.com",
    ];

    const matchingSuffix = suffixes.find((suffix) =>
      url.hostname.endsWith(suffix),
    );

    if (matchingSuffix !== undefined) {
      url.hostname = matchingSuffix.slice(1);
      return url.origin;
    }

    return "https://prismic.io";
  } catch {
    return "https://prismic.io";
  }
}
