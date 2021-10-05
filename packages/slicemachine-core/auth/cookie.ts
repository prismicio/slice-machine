import * as cookie from 'cookie'

const noEscape = (str: any) => str
export const parse = (cookieString: string, opts?: cookie.CookieParseOptions) => cookie.parse(cookieString, {decode: noEscape, ...opts})
export const serialize = (name: string, value: string, opts?: cookie.CookieSerializeOptions)  => cookie.serialize(name, value, {encode: noEscape, ...opts})