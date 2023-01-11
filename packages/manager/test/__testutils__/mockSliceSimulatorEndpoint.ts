import { TestContext } from "vitest";
import { rest } from "msw";

type MockSliceSimulatorEndpointConfig = {
	exists?: boolean;
	sliceMachineUIOrigin: string;
	libraryID: string;
	sliceName: string;
	variationID: string;
	viewport: {
		width: number;
		height: number;
	};
};

type MockSliceSimulatorEndpointReturnType = {
	sliceSimulatorEndpoint: string;
};

export const mockSliceSimulatorEndpoint = (
	ctx: TestContext,
	config: MockSliceSimulatorEndpointConfig,
): MockSliceSimulatorEndpointReturnType => {
	const screenshotEndpoint = new URL(
		`./${config.libraryID}/${config.sliceName}/${config.variationID}/screenshot`,
		config.sliceMachineUIOrigin,
	);

	ctx.msw.use(
		rest.get(screenshotEndpoint.toString(), (req, res, ctx) => {
			if (config.exists ?? true) {
				if (
					req.url.searchParams.get("screenWidth") ===
						config.viewport.width.toString() &&
					req.url.searchParams.get("screenHeight") ===
						config.viewport.height.toString()
				) {
					return res(ctx.status(200));
				} else {
					return res(ctx.status(500));
				}
			} else {
				return res(ctx.status(404));
			}
		}),
	);

	const screnshotEndpointWithURLParams = new URL(screenshotEndpoint);
	screnshotEndpointWithURLParams.searchParams.set(
		"screenWidth",
		config.viewport.width.toString(),
	);
	screnshotEndpointWithURLParams.searchParams.set(
		"screenHeight",
		config.viewport.height.toString(),
	);

	return {
		sliceSimulatorEndpoint: screnshotEndpointWithURLParams.toString(),
	};
};
