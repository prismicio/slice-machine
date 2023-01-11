import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { setupServer, SetupServerApi } from "msw/node";
import { createMockFactory, MockFactory } from "@prismicio/mock";
import { vol } from "memfs";
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

vi.mock("analytics-node", () => {
	const MockSegmentClient = vi.fn();

	MockSegmentClient.prototype.identify = vi.fn(
		(_message: unknown, callback: (error?: Error) => void) => {
			if (callback) {
				callback();
			}
		},
	);

	MockSegmentClient.prototype.track = vi.fn(
		(_message: unknown, callback: (error?: Error) => void) => {
			if (callback) {
				callback();
			}
		},
	);

	return {
		default: MockSegmentClient,
	};
});

const mswServer = setupServer();

beforeAll(() => {
	mswServer.listen({
		onUnhandledRequest(req, print) {
			if (req.headers.get("host")?.startsWith("127.0.0.1")) {
				return;
			}

			print.error();
		},
	});
});

beforeEach(async (ctx) => {
	ctx.mockPrismic = createMockFactory({ seed: ctx.meta.name });
	ctx.msw = mswServer;

	ctx.msw.resetHandlers();

	vi.clearAllMocks();
	vol.reset();

	await fs.mkdir(path.join(os.homedir()), { recursive: true });
	await fs.rm(path.join(os.homedir(), ".prismic"), { force: true });
	await fs.rm(path.join(os.homedir(), ".prismicrc"), { force: true });
	// Prevent .prismicrc from freaking out with memfs
	await fs.writeFile("/package.json", "{}");
});

afterAll(() => {
	mswServer.close();
});
