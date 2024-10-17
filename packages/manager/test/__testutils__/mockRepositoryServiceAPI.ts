import { TestContext } from "vitest";
import { PathParams, rest, RestRequest } from "msw";

type MockRepositoryServiceAPIConfig = {
	endpoint?: string;
	fetchEndpoint?: {
		steps: string[];
		expectedAuthenticationToken: string;
		expectedCookies: string[];
	};
	toggleStepEndpoint?: {
		steps: string[];
		expectedAuthenticationToken: string;
		expectedCookies: string[];
	};
	toggleEndpoint?: {
		isDismissed: boolean;
		expectedAuthenticationToken: string;
		expectedCookies: string[];
	};
};

export const mockRepositoryServiceAPI = (
	ctx: TestContext,
	config: MockRepositoryServiceAPIConfig,
): void => {
	const endpoint = config?.endpoint ?? "https://prismic.io/";

	const checkAuth = (
		expected: {
			expectedAuthenticationToken: string;
			expectedCookies: string[];
		},
		req: RestRequest<never, PathParams<string>>,
	) => {
		return (
			req.headers.get("Authorization") ===
				`Bearer ${config?.fetchEndpoint?.expectedAuthenticationToken}` &&
			req.headers.get("Cookie") ===
				config?.fetchEndpoint?.expectedCookies.join("; ")
		);
	};

	ctx.msw.use(
		rest.get(new URL(`./onboarding`, endpoint).toString(), (req, res, ctx) => {
			if (!config.fetchEndpoint) {
				return res(ctx.status(418));
			}

			if (checkAuth(config.fetchEndpoint, req)) {
				return res(
					ctx.json({
						onboarding: {
							completedSteps: config.fetchEndpoint.steps,
							isDismissed: false,
							context: {
								framework: "next",
								starterId: null,
							},
						},
					}),
					ctx.status(200),
				);
			}

			return res(ctx.status(418));
		}),
	);

	ctx.msw.use(
		rest.get(
			new URL(`./onboarding/reviewAndPush/toggle`, endpoint).toString(),
			(req, res, ctx) => {
				if (!config.toggleStepEndpoint) {
					return res(ctx.status(418));
				}

				if (checkAuth(config.toggleStepEndpoint, req)) {
					res(ctx.json({ completedSteps: config.toggleStepEndpoint.steps }));
				}

				return res(ctx.status(418));
			},
		),
	);

	ctx.msw.use(
		rest.get(
			new URL(`./onboarding/toggle`, endpoint).toString(),
			(req, res, ctx) => {
				if (!config.toggleEndpoint) {
					return res(ctx.status(418));
				}

				if (checkAuth(config.toggleEndpoint, req)) {
					res(ctx.json({ isDismissed: config.toggleEndpoint.isDismissed }));
				}

				return res(ctx.status(418));
			},
		),
	);
};
