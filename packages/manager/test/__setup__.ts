import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { setupServer, SetupServer } from "msw/node";
import { createMockFactory, MockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { createSliceMachineManager, SliceMachineManager } from "../src";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { APIFixture, createAPIFixture } from "./__testutils__/createAPIFixture";

declare module "vitest" {
	export interface TestContext {
		mockPrismic: MockFactory;
		msw: SetupServer;
		sliceMachineUIDirectory: string;
		manager: SliceMachineManager;
		api: APIFixture;
		login: () => Promise<void>;
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

	const realpathSyncFn = (
		path: string | Buffer,
		options?: { encoding?: BufferEncoding },
	) => {
		try {
			return _fs.realpathSync(path, options);
		} catch {
			// If real fs fails, try memfs
			return memfs.fs.realpathSync(path, options);
		}
	};

	const readFileSync = escapeOnigurumaMethod(
		_fs.readFileSync,
		memfs.fs.readFileSync,
	);
	const statSync = escapeOnigurumaMethod(_fs.statSync, memfs.fs.statSync);
	const realpathSync = escapeOnigurumaMethod(
		realpathSyncFn,
		memfs.fs.realpathSync,
	);

	const vscodeOnigurumaFix = {
		readFileSync,
		statSync,
	};

	return {
		...memfs.fs,
		...vscodeOnigurumaFix,
		realpathSync,
		default: {
			...memfs.fs,
			...vscodeOnigurumaFix,
			realpathSync,
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

vi.mock("@segment/analytics-node", async () => {
	const actual: typeof import("@segment/analytics-node") =
		await vi.importActual("@segment/analytics-node");

	vi.spyOn(actual.Analytics.prototype, "track").mockImplementation(
		(_params, callback) => {
			callback?.();
		},
	);

	vi.spyOn(actual.Analytics.prototype, "identify").mockImplementation(
		(_params, callback) => {
			callback?.();
		},
	);

	vi.spyOn(actual.Analytics.prototype, "group").mockImplementation(
		(_params, callback) => {
			callback?.();
		},
	);

	vi.spyOn(actual.Analytics.prototype, "on").mockImplementation(
		() => actual.Analytics.prototype,
	);

	return actual;
});

vi.mock("@amplitude/experiment-node-server", () => {
	class RemoteEvaluationClient {
		fetchV2() {
			return {
				"test-variant-on": {
					value: "on",
				},
				"test-variant-off": {
					value: "off",
				},
			};
		}
	}

	const Experiment = {
		initializeRemote: vi.fn(() => new RemoteEvaluationClient()),
	};

	return {
		Experiment,
		RemoteEvaluationClient,
	};
});

vi.mock("@anthropic-ai/claude-agent-sdk", () => {
	return {
		createClient: vi.fn(),
		Agent: vi.fn(),
		query: vi.fn(),
	};
});

vi.mock("execa", async () => {
	const execa: typeof import("execa") = await vi.importActual("execa");

	return {
		...execa,
		execaCommand: ((command: string, options: Record<string, unknown>) => {
			// Replace command with simple `echo`
			return execa.execaCommand(`echo 'mock command ran: ${command}'`, options);
		}) as typeof execa.execaCommand,
	};
});

const mswServer = setupServer();

beforeAll(() => {
	mswServer.listen({ onUnhandledRequest: "error" });
});

beforeEach(async (ctx) => {
	ctx.mockPrismic = createMockFactory({ seed: ctx.task.name });
	ctx.msw = mswServer;

	ctx.msw.resetHandlers();

	vi.clearAllMocks();

	await fs.mkdir(path.join(os.homedir()), { recursive: true });
	await fs.rm(path.join(os.homedir(), ".prismic"), { force: true });
	await fs.rm(path.join(os.homedir(), ".prismicrc"), { force: true });

	ctx.sliceMachineUIDirectory = path.dirname(
		MOCK_SLICE_MACHINE_PACKAGE_JSON_PATH,
	);

	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	await manager.plugins.initPlugins();

	ctx.manager = manager;
	ctx.login = async () => {
		await manager.user.login({
			email: `name@example.com`,
			cookies: ["prismic-auth=token", "SESSION=session"],
		});
	};

	const api = createAPIFixture({ manager, mswServer });
	api.mockPrismicUser(
		"./profile",
		{
			userId: "userId",
			shortId: "shortId",
			intercomHash: "intercomHash",
			email: "email",
			firstName: "firstName",
			lastName: "lastName",
		},
		{ checkAuthentication: false },
	);
	api.mockPrismicAuthentication("./validate", undefined, {
		checkAuthentication: false,
	});
	api.mockPrismicAuthentication("./refreshtoken", undefined, {
		checkAuthentication: false,
	});

	ctx.api = api;
});

afterAll(() => {
	mswServer.close();
});
