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
};

export const mockSliceMachineAPI = (
	ctx: TestContext,
	config: MockSliceMachineAPIConfig,
): void => {
	// TODO: Update the default endpoint to the correct deployed URL.
	const endpoint = config.endpoint ?? "https://slice-machine-api.example/";

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
								ctx.json(config.environmentsV1Endpoint?.environments),
								ctx.status(200),
							);
						} else {
							return res(ctx.status(400));
						}
					} else {
						return res(ctx.status(400));
					}
				},
			),
		);
	}
};
