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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any) => any;

vi.mock("fs", async () => {
	const escapeOnigurumaMethod = (
		fsFn: AnyFunction,
		memfsFn: AnyFunction,
	): AnyFunction => {
		return (...args: unknown[]) => {
			if (args?.[0]?.toString().includes("vscode-oniguruma")) {
				return fsFn(...args);
			}

			return memfsFn(...args);
		};
	};

	const memfs: typeof import("memfs") = await vi.importActual("memfs");
	const _fs: typeof import("node:fs") = await vi.importActual("node:fs");

	const readFileSync = escapeOnigurumaMethod(
		_fs.readFileSync,
		memfs.fs.readFileSync,
	);
	const statSync = escapeOnigurumaMethod(_fs.statSync, memfs.fs.statSync);
	const realpathSync = escapeOnigurumaMethod(
		_fs.realpathSync,
		memfs.fs.realpathSync,
	);

	const vscodeOnigurumaFix = {
		readFileSync,
		statSync,
		realpathSync,
	};

	return {
		...memfs.fs,
		...vscodeOnigurumaFix,
		default: {
			...memfs.fs,
			...vscodeOnigurumaFix,
		},
	};
});

vi.mock("fs/promises", async () => {
	const escapeOnigurumaMethod = (
		fsFn: AnyFunction,
		memfsFn: AnyFunction,
	): AnyFunction => {
		return (...args: unknown[]) => {
			if (args?.[0]?.toString().includes("vscode-oniguruma")) {
				return fsFn(...args);
			}

			return memfsFn(...args);
		};
	};

	const memfs: typeof import("memfs") = await vi.importActual("memfs");
	const _fs: typeof import("node:fs/promises") = await vi.importActual(
		"node:fs/promises",
	);

	const readFile = escapeOnigurumaMethod(
		_fs.readFile,
		memfs.fs.promises.readFile,
	);

	const vscodeOnigurumaFix = {
		readFile,
	};

	return {
		...memfs.fs.promises,
		...vscodeOnigurumaFix,
		default: {
			...memfs.fs.promises,
			...vscodeOnigurumaFix,
		},
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
