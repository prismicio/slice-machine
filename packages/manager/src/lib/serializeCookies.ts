import cookie from "cookie";

const COOKIE_SEPARATOR = "; ";

type Cookies = string | string[] | Record<string, string>;

const castParsedCookies = (cookies: Cookies): Record<string, string> => {
	if (Array.isArray(cookies)) {
		return cookie.parse(cookies.join(COOKIE_SEPARATOR));
	} else if (typeof cookies === "string") {
		return cookie.parse(cookies);
	} else {
		return cookies;
	}
};

type SerializeCookiesArgs = {
	cookieJar?: Cookies;
};

// TODO: If the `cookieJar` and multiple input types are not used anywhere,
// simplify this function to only serialize a given object of cookies into a
// string.
export const serializeCookies = (
	cookies: Cookies,
	args: SerializeCookiesArgs = {},
): string => {
	const cookiesToSerialize = {
		...castParsedCookies(args.cookieJar || {}),
		...castParsedCookies(cookies),
	};

	const items: string[] = [];

	for (const name in cookiesToSerialize) {
		items.push(
			cookie.serialize(name, cookiesToSerialize[name], {
				// Cookies need be stored raw (not encoded or escaped), so that consumers can format them the way they want them to be formatted.
				encode: (cookie) => cookie,
			}),
		);
	}

	return items.join(COOKIE_SEPARATOR);
};
