import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { setupServer, SetupServerApi } from "msw/node";
import { createMockFactory, MockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

declare module "vitest" {
	export interface TestContext {
		mockPrismic: MockFactory;
		msw: SetupServerApi;
	}
}

vi.mock("fs", async () => {
	const memfs: typeof import("memfs") = await vi.importActual("memfs");

	return {
		...memfs.fs,
		default: memfs.fs,
	};
});

vi.mock("fs/promises", async () => {
	const memfs: typeof import("memfs") = await vi.importActual("memfs");

	return {
		...memfs.fs.promises,
		default: memfs.fs.promises,
	};
});

const mswServer = setupServer();

beforeAll(() => {
	mswServer.listen({ onUnhandledRequest: "error" });
});

beforeEach(async (ctx) => {
	ctx.mockPrismic = createMockFactory({ seed: ctx.meta.name });
	ctx.msw = mswServer;

	ctx.msw.resetHandlers();

	vi.clearAllMocks();

	await fs.mkdir(path.join(os.homedir()), { recursive: true });
	await fs.rm(path.join(os.homedir(), ".prismic"), { force: true });
	await fs.rm(path.join(os.homedir(), ".prismicrc"), { force: true });
});

afterAll(() => {
	mswServer.close();
});
