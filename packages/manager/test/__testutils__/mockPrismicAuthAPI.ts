import { TestContext } from "vitest";
import { rest } from "msw";

type MockPrismicAuthAPIConfig = {
	validateEndpoint?: {
		isValid?: boolean;
	};
	refreshtokenEndpoint?: {
		isSuccessful?: boolean;
		refreshedToken?: string;
	};
};

type MockPrismicUserAPIReturnType = {
	refreshedToken: string;
};

export const mockPrismicAuthAPI = (
	ctx: TestContext,
	config?: MockPrismicAuthAPIConfig,
): MockPrismicUserAPIReturnType => {
	const validateEndpointConfig = {
		isValid: true,
		...(config?.validateEndpoint || {}),
	};

	const refreshtokenEndpointConfig = {
		isSuccessful: true,
		refreshedToken: "refreshed-token",
		...(config?.refreshtokenEndpoint || {}),
	};

	ctx.msw.use(
		rest.get("https://auth.prismic.io/validate", (_req, res, ctx) => {
			if (validateEndpointConfig.isValid) {
				return res();
			} else {
				return res(ctx.status(401));
			}
		}),
		rest.get("https://auth.prismic.io/refreshtoken", (_req, res, ctx) => {
			if (refreshtokenEndpointConfig.isSuccessful) {
				return res(ctx.text(refreshtokenEndpointConfig.refreshedToken));
			} else {
				return res(ctx.status(401));
			}
		}),
	);

	return {
		refreshedToken: refreshtokenEndpointConfig.refreshedToken,
	};
};
