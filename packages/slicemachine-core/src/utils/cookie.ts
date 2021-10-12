import * as cookie from "cookie";

const noEscape = (str: string) => str;

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
