import { TestContext } from "vitest";
import { rest } from "msw";

import { Environment } from "../../src";

type MockSliceMachineAPIConfig = {
	endpoint?: string;
	environmentsV1Endpoint?: {
		isSuccessful?: boolean;
		expectedAuthenticationToken: string;
		expectedCookies: string[];
		environments: Environment[];
	};
	gitGitHubCreateAuthStateV1Endpoint?: {
		isSuccessful?: boolean;
		expectedAuthenticationToken: string;
		key: string;
		expiresAt: Date;
	};
};

export const mockSliceMachineAPI = (
	ctx: TestContext,
	config: MockSliceMachineAPIConfig,
): void => {
	// TODO: Update the default endpoint to the correct deployed URL.
	const endpoint =
		config.endpoint ??
		"https://21vvgrh0s6.execute-api.us-east-1.amazonaws.com/v1/";

	if (config.environmentsV1Endpoint) {
		ctx.msw.use(
			rest.get(
				new URL(`./environments`, endpoint).toString(),
				(req, res, ctx) => {
					if (config.environmentsV1Endpoint?.isSuccessful ?? true) {
						if (
							req.headers.get("Authorization") ===
								`Bearer ${config.environmentsV1Endpoint?.expectedAuthenticationToken}` &&
							req.headers.get("Cookie") ===
								config.environmentsV1Endpoint?.expectedCookies.join("; ")
						) {
							return res(
								ctx.json({
									results: config.environmentsV1Endpoint?.environments,
								}),
								ctx.status(200),
							);
						} else {
							return res(ctx.status(418));
						}
					} else {
						return res(ctx.status(418));
					}
				},
			),
		);
	}

	if (config.gitGitHubCreateAuthStateV1Endpoint) {
		ctx.msw.use(
			rest.get(
				new URL(`./git/github/create-auth-state`, endpoint).toString(),
				(req, res, ctx) => {
					if (
						config.gitGitHubCreateAuthStateV1Endpoint &&
						(config.gitGitHubCreateAuthStateV1Endpoint.isSuccessful ?? true)
					) {
						if (
							req.headers.get("Authorization") ===
							`Bearer ${config.gitGitHubCreateAuthStateV1Endpoint.expectedAuthenticationToken}`
						) {
							return res(
								ctx.json({
									key: config.gitGitHubCreateAuthStateV1Endpoint.key,
									expiresAt:
										config.gitGitHubCreateAuthStateV1Endpoint.expiresAt,
								}),
								ctx.status(200),
							);
						} else {
							return res(ctx.status(418));
						}
					} else {
						return res(ctx.status(418));
					}
				},
			),
		);
	}
};
