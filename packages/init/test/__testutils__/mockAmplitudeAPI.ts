import { TestContext } from "vitest";
import { rest } from "msw";

type MockAmplitudeAPIConfig = {
	experiment: string;
	variant: string;
};

type MockAmplitudeAPIReturnType = {
	value: string;
};

export const mockAmplitudeAPI = (
	ctx: TestContext,
	config?: MockAmplitudeAPIConfig,
): MockAmplitudeAPIReturnType => {
	const value = config?.variant ?? "off";

	ctx.msw.use(
		rest.get(
			"https://api.lab.amplitude.com/sdk/v2/vardata",
			(_req, res, ctx) => {
				return res(
					ctx.json({
						value,
					}),
				);
			},
		),
	);

	return {
		value,
	};
};
