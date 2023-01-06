import { TestContext } from "vitest";
import { rest } from "msw";

type MockSliceSimulatorEndpointConfig = {
	localSliceSimulatorURL: string;
} & (
	| {
			exists: false;
	  }
	| {
			libraryID: string;
			sliceID: string;
			variationID: string;
	  }
);

type MockSliceSimulatorEndpointReturnType = {
	sliceSimulatorEndpoint: string;
};

export const mockSliceSimulatorEndpoint = (
	ctx: TestContext,
	config: MockSliceSimulatorEndpointConfig,
): MockSliceSimulatorEndpointReturnType => {
	const sliceSimulatorEndpoint = new URL(config.localSliceSimulatorURL);
	if ("libraryID" in config) {
		sliceSimulatorEndpoint.searchParams.set("lid", config.libraryID);
		sliceSimulatorEndpoint.searchParams.set("sid", config.sliceID);
		sliceSimulatorEndpoint.searchParams.set("vid", config.variationID);
	}

	ctx.msw.use(
		rest.get(config.localSliceSimulatorURL, (req, res, ctx) => {
			if ("exists" in config) {
				if (!config.exists) {
					return res(ctx.status(404));
				}
			} else {
				if (
					req.url.searchParams.get("lid") === config.libraryID &&
					req.url.searchParams.get("sid") === config.sliceID &&
					req.url.searchParams.get("vid") === config.variationID
				) {
					return res(ctx.status(200));
				}
			}

			return res(ctx.status(404));
		}),
	);

	return {
		sliceSimulatorEndpoint: sliceSimulatorEndpoint.toString(),
	};
};
