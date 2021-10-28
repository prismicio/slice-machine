import * as cookie from "cookie";

const noEscape = (str: string) => str;

const AUTH_KEY = "prismic-auth";

export function parsePrismicAuthToken(cookieString: string): string {
  const parsed = parse(cookieString);
  return parsed[AUTH_KEY] ? parsed[AUTH_KEY] : "";
}

export function parse(cookieString: string): { [key: string]: string } {
  return cookie.parse(cookieString, { decode: noEscape });
}

export function serializeCookie(name: string, value: string): string {
  return cookie.serialize(name, value, { encode: noEscape });
}

export function serializeCookies(cookies: ReadonlyArray<string>): string {
  const newCookiesMap = cookies
    .map((str) => cookie.parse(str))
    .reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

  return Object.entries(newCookiesMap)
    .map(([key, value]) => {
      return serializeCookie(key, value);
    })
    .join("; ");
}
