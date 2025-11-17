import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { setupServer, SetupServer } from "msw/node";
import { createMockFactory, MockFactory } from "@prismicio/mock";
import { vol } from "memfs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

declare module "vitest" {
	export interface TestContext {
		mockPrismic: MockFactory;
		msw: SetupServer;
	}
}

vi.mock("chalk", async () => {
	const chalk: typeof import("chalk") = await vi.importActual("chalk");

	return {
		...chalk,
		default: new chalk.Instance({ level: 0 }),
	};
});

vi.mock("log-symbols", async () => {
	return {
		info: "i",
		success: "s",
		warning: "!",
		error: "e",
		default: {
			info: "i",
			success: "s",
			warning: "!",
			error: "e",
		},
	};
});

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

vi.mock("@segment/analytics-node", () => {
	const MockSegmentClient = vi.fn();

	MockSegmentClient.prototype.identify = vi.fn(
		(_message: unknown, callback?: (error?: unknown) => void) => {
			if (callback) {
				callback();
			}
		},
	);

	MockSegmentClient.prototype.track = vi.fn(
		(_message: unknown, callback?: (error?: unknown) => void) => {
			if (callback) {
				callback();
			}
		},
	);

	MockSegmentClient.prototype.on = vi.fn();

	return {
		Analytics: MockSegmentClient,
	};
});

vi.mock("@anthropic-ai/claude-agent-sdk", () => {
	return {
		createClient: vi.fn(),
		Agent: vi.fn(),
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
