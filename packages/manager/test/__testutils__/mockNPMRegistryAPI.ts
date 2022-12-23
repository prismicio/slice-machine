import { TestContext } from "vitest";
import { rest } from "msw";

type MockNPMRegistryAPIConfig = {
	packageName: string;
	versions: string[];
};

export const mockNPMRegistryAPI = (
	ctx: TestContext,
	config: MockNPMRegistryAPIConfig,
): void => {
	const versions = config.versions.reduce<Record<string, unknown>>(
		(acc, curr) => {
			acc[curr] = {};

			return acc;
		},
		{},
	);

	ctx.msw.use(
		rest.get(
			new URL(config.packageName, "https://registry.npmjs.org/").toString(),
			(_req, res, ctx) => {
				return res(ctx.json({ versions }));
			},
		),
	);
};
