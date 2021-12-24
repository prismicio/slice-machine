import * as cookie from "cookie";
import { AUTH_KEY } from "../defaults";

const noEscape = (str: string) => str;

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
    .map((str) => parse(str))
    .reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

  return Object.entries(newCookiesMap)
    .map(([key, value]) => {
      return serializeCookie(key, value);
    })
    .join("; ");
}
