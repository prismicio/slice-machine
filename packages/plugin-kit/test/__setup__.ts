import { beforeEach } from "vitest";
import { createMockFactory, MockFactory } from "@prismicio/mock";

declare module "vitest" {
	export interface TestContext {
		mock: MockFactory;
	}
}

beforeEach((ctx) => {
	ctx.mock = createMockFactory({ seed: ctx.meta.name });
});
