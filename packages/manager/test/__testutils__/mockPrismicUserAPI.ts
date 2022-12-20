import { TestContext } from "vitest";
import { rest } from "msw";

import { PrismicUserProfile } from "../../src";

type MockPrismicUserAPIConfig = {
	profile?: Partial<PrismicUserProfile>;
	isValid?: boolean;
};

type MockPrismicUserAPIReturnType = {
	profile: PrismicUserProfile;
};

export const mockPrismicUserAPI = (
	ctx: TestContext,
	config?: MockPrismicUserAPIConfig,
): MockPrismicUserAPIReturnType => {
	const profile: PrismicUserProfile = {
		userId: "userId",
		shortId: "shortId",
		intercomHash: "intercomHash",
		email: "email",
		firstName: "firstName",
		lastName: "lastName",
		...config?.profile,
	};

	ctx.msw.use(
		rest.get("https://user.internal-prismic.io/profile", (_req, res, ctx) => {
			if (config?.isValid ?? true) {
				return res(ctx.json(profile));
			} else {
				return res(ctx.status(401));
			}
		}),
	);

	return {
		profile,
	};
};
