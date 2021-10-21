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

export function serialize(name: string, value: string): string {
  return cookie.serialize(name, value, { encode: noEscape });
}
