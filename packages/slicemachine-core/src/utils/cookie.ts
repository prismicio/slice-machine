import * as cookie from "cookie";

const noEscape = (str: string) => str;

const AUTH_KEY = "prismic-auth";

export function parsePrismicAuthToken(cookieString: string): string {
  const parsed = parse(cookieString, { decode: noEscape });
  return parsed[AUTH_KEY] ? parsed[AUTH_KEY] : "";
}

export function parse(
  cookieString: string,
  opts?: cookie.CookieParseOptions
): { [key: string]: string } {
  return cookie.parse(cookieString, { decode: noEscape, ...opts });
}

export function serialize(
  name: string,
  value: string,
  opts?: cookie.CookieSerializeOptions
): string {
  return cookie.serialize(name, value, { encode: noEscape, ...opts });
}
