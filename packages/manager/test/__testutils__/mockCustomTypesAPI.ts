import { TestContext } from "vitest";
import { rest } from "msw";

type MockCustomTypesAPIConfig = {
	onCustomTypeGet?: Parameters<typeof rest.get>[1];
	onCustomTypeInsert?: Parameters<typeof rest.post>[1];
	onCustomTypeUpdate?: Parameters<typeof rest.post>[1];
};

export const mockCustomTypesAPI = (
	ctx: TestContext,
	config?: MockCustomTypesAPIConfig,
): void => {
	if (config?.onCustomTypeGet) {
		ctx.msw.use(
			rest.get(
				"https://customtypes.prismic.io/customtypes/:id",
				(req, res, ctx) => {
					const customResponse = config.onCustomTypeGet?.(req, res, ctx);

					if (customResponse) {
						return customResponse;
					} else {
						return res(ctx.status(404));
					}
				},
			),
		);
	}

	if (config?.onCustomTypeInsert) {
		ctx.msw.use(
			rest.post(
				"https://customtypes.prismic.io/customtypes/insert",
				config.onCustomTypeInsert,
			),
		);
	}

	if (config?.onCustomTypeUpdate) {
		ctx.msw.use(
			rest.post(
				"https://customtypes.prismic.io/customtypes/update",
				config.onCustomTypeUpdate,
			),
		);
	}
};
