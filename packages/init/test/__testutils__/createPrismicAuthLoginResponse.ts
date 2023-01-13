export type PrismicAuthLoginResponse = {
	email: string;
	cookies: string[];
	_token: string;
};

export const createPrismicAuthLoginResponse = (
	loginResponse?: Partial<PrismicAuthLoginResponse>,
): PrismicAuthLoginResponse => {
	const response = {
		email: `name@example.com`,
		cookies: ["prismic-auth=token", "SESSION=session"],
		_token: "token",
		...loginResponse,
	};

	return response;
};
