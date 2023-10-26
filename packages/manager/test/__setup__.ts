import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { setupServer, SetupServer } from "msw/node";
import { createMockFactory, MockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

declare module "vitest" {
	export interface TestContext {
		mockPrismic: MockFactory;
		msw: SetupServer;
		sliceMachineUIDirectory: string;
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
	const _fs: typeof import("node:fs/promises") =
		await vi.importActual("node:fs/promises");

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

export const MOCK_BASE_DIRECTORY = "/foo/bar/baz";

const MOCK_SLICE_MACHINE_PACKAGE_JSON_PATH = `${MOCK_BASE_DIRECTORY}/baz/slice-machine-ui/package.json`;

vi.mock("module", async () => {
	const actual = (await vi.importActual(
		"node:module",
	)) as typeof import("node:module");

	return {
		...actual,
		createRequire: (...args) => {
			const actualCreateRequire = actual.createRequire(...args);

			if (args[0].toString().includes("prettier")) {
				return actualCreateRequire;
			}

			return {
				...actualCreateRequire,
				resolve: (id: string) => {
					if (id === "slice-machine-ui/package.json") {
						return MOCK_SLICE_MACHINE_PACKAGE_JSON_PATH;
					} else if (id.startsWith("test-plugin-")) {
						return `${MOCK_BASE_DIRECTORY}/${id}`;
					}

					return actualCreateRequire.resolve(id);
				},
			};
		},
	} as typeof actual;
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

	ctx.sliceMachineUIDirectory = path.dirname(
		MOCK_SLICE_MACHINE_PACKAGE_JSON_PATH,
	);
});

afterAll(() => {
	mswServer.close();
});
