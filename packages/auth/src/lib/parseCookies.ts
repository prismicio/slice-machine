import cookie from "cookie";

export const parseCookies = (cookies: string): Record<string, string> => {
	return cookie.parse(cookies, {
		// Don't escape any values.
		decode: (value) => value,
	});
};
