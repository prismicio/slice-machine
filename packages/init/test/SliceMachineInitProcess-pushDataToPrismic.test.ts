import { beforeEach, expect, it, Mock, TestContext, vi } from "vitest";
import { vol } from "memfs";

import { SliceMachinePlugin } from "@slicemachine/plugin-kit";

import { createSliceMachineInitProcess, SliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { mockPrismicRepositoryAPI } from "./__testutils__/mockPrismicRepositoryAPI";
import { mockPrismicCustomTypesAPI } from "./__testutils__/mockPrismicCustomTypesAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockAWSACLAPI } from "./__testutils__/mockAWSACLAPI";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { injectTestAdapter } from "./__testutils__/injectTestAdapter";
import { loginUser } from "./__testutils__/loginUser";
import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { watchStd } from "./__testutils__/watchStd";
import { spyManager } from "./__testutils__/spyManager";

const initProcess = createSliceMachineInitProcess();

// `fast-glob` struggles with VFS
vi.mock("globby", async () => {
	const memfs: typeof import("memfs") = await vi.importActual("memfs");

	return {
		globby: (_pattern: string, _options: { cwd: string }) => {
			const volSnapshot = memfs.vol.toJSON();

			return Object.keys(volSnapshot)
				.map((path) => {
					if (
						path.includes("documents") &&
						!path.includes("documents/index.json") &&
						path.endsWith(".json")
					) {
						return path.split("documents/")[1];
					}
				})
				.filter(Boolean);
		},
	};
});

beforeEach(async () => {
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
});

const mockAdapter = async (
	ctx: TestContext,
	initProcess: SliceMachineInitProcess,
	options?: {
		throwsOn?: ("slice-library:read" | "custom-type-library:read")[];
		empty?: ("slice-library:read" | "custom-type-library:read")[];
	},
): Promise<{
	adapter: SliceMachinePlugin;
	models: {
		sharedSliceModel: unknown;
		customTypeModel: unknown;
	};
	spiedHookHandlers: {
		sliceLibraryReadHookHandler: Mock;
		sliceReadHookHandler: Mock;
		customTypeLibraryReadHookHandler: Mock;
		customTypeReadHookHandler: Mock;
	};
}> => {
	const sharedSliceModel = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const customTypeModel = ctx.mockPrismic.model.customType();
	// TODO: maybe update @prismic/mock with the new custom-type format
	const customTypeModelWithFormat = { ...customTypeModel, format: "custom" };

	const sliceLibraryReadHookHandler = vi.fn(({ libraryID }) => {
		if (options?.throwsOn?.includes("slice-library:read")) {
			throw new Error(`Mocked error during \`slice-library:read\``);
		} else if (options?.empty?.includes("slice-library:read")) {
			return { id: libraryID, sliceIDs: [] };
		} else if (libraryID === "./slices") {
			return { id: libraryID, sliceIDs: ["id1", "id2"] };
		}

		throw new Error("not implemented");
	});
	const sliceReadHookHandler = vi.fn(() => {
		return { model: sharedSliceModel };
	});
	const customTypeLibraryReadHookHandler = vi.fn(() => {
		if (options?.throwsOn?.includes("custom-type-library:read")) {
			throw new Error(`Mocked error during \`custom-type-library:read\``);
		} else if (options?.empty?.includes("custom-type-library:read")) {
			return { ids: [] };
		}

		return { ids: ["id"] };
	});
	const customTypeReadHookHandler = vi.fn(() => {
		return { model: customTypeModel };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-library:read", sliceLibraryReadHookHandler);
			hook("slice:read", sliceReadHookHandler);
			hook("custom-type-library:read", customTypeLibraryReadHookHandler);
			hook("custom-type:read", customTypeReadHookHandler);
		},
	});
	injectTestAdapter({ initProcess, adapter });

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.upsertSliceMachineConfigurationAndStartPluginRunner();
	});

	return {
		adapter,
		models: {
			sharedSliceModel,
			customTypeModel: customTypeModelWithFormat,
		},
		spiedHookHandlers: {
			sliceLibraryReadHookHandler,
			sliceReadHookHandler,
			customTypeLibraryReadHookHandler,
			customTypeReadHookHandler,
		},
	};
};

type MockPrismicAPIsArgs = {
	initProcess: SliceMachineInitProcess;
	models: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		sharedSliceModel: any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		customTypeModel: any;
	};
	documents?: Record<string, unknown>;
};

const mockPrismicAPIs = async (
	ctx: TestContext,
	args: MockPrismicAPIsArgs,
): Promise<void> => {
	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);
	const token = await loginUser(initProcess, prismicAuthLoginResponse);

	mockPrismicCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			expect(await req.json()).toStrictEqual({
				...args.models.sharedSliceModel,
				variations: args.models.sharedSliceModel.variations.map(
					(variation: Record<string, unknown>) => {
						return {
							...variation,
							imageUrl: expect.any(String),
						};
					},
				),
			});

			return res(ctx.status(201));
		},
		async onCustomTypeGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onCustomTypeInsert(req, res, ctx) {
			const want = args.models.customTypeModel;
			const got = await req.json();
			expect(got).toStrictEqual(want);

			return res(ctx.status(201));
		},
	});
	mockAWSACLAPI(ctx, {
		createEndpoint: {
			// @ts-expect-error - Accessing protected property
			expectedPrismicRepository: initProcess.context.repository?.domain || "",
			expectedAuthenticationToken: token,
		},
	});

	const documents = args.documents || {
		baz: { qux: "quux" },
		corge: { grault: "garply" },
	};

	if (Object.keys(documents).length > 0) {
		const preparedDocuments: Record<string, unknown> = {};

		for (const documentKey in documents) {
			const document = documents[documentKey];

			preparedDocuments[`./en-us/${documentKey}.json`] =
				typeof document === "string"
					? document
					: JSON.stringify(documents[documentKey]);
		}

		vol.fromJSON(
			{
				"./index.json": JSON.stringify({ signature: "foo" }),
				...preparedDocuments,
			},
			"/documents",
		);
	}

	mockPrismicRepositoryAPI(ctx, {
		starterDocumentsEndpoint: {
			expectedAuthenticationToken: token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			// @ts-expect-error - Accessing protected property
			domain: initProcess.context.repository?.domain || "",
			signature: "foo",
			documents,
		},
	});
};

// Everything

it("pushes data to Prismic", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(stdout).toMatch(/Pushed all slices/);
	expect(stdout).toMatch(/Pushed all types/);
	expect(stdout).toMatch(/Pushed all documents/);
	expect(stdout).toMatch(/Pushed data to Prismic/);
});

it("skips pushing anything to Prismic when no-push flag is set", async (ctx) => {
	const initProcess = createSliceMachineInitProcess({ push: false });
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedManager.slices.pushSlice).not.toHaveBeenCalled();
	expect(spiedManager.customTypes.pushCustomType).not.toHaveBeenCalled();
	expect(spiedManager.prismicRepository.pushDocuments).not.toHaveBeenCalled();
});

// Slices

it("pushes slices to Prismic", async (ctx) => {
	const { models, spiedHookHandlers } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedHookHandlers.sliceLibraryReadHookHandler).toHaveBeenCalledOnce();
	expect(spiedManager.slices.pushSlice).toHaveBeenCalledTimes(2);
	expect(stdout).toMatch(/Pushed all slices/);
});

it("skips pushing slices to Prismic when no-push-slices flag is set", async (ctx) => {
	const initProcess = createSliceMachineInitProcess({ pushSlices: false });
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
	const { models, spiedHookHandlers } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedHookHandlers.sliceLibraryReadHookHandler).not.toHaveBeenCalled();
	expect(spiedHookHandlers.sliceReadHookHandler).not.toHaveBeenCalled();
	expect(spiedManager.slices.pushSlice).not.toHaveBeenCalled();
});

it("skips pushing slices to Prismic when no-push flag is set", async (ctx) => {
	const initProcess = createSliceMachineInitProcess({ push: false });
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
	const { models, spiedHookHandlers } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedHookHandlers.sliceLibraryReadHookHandler).not.toHaveBeenCalled();
	expect(spiedHookHandlers.sliceReadHookHandler).not.toHaveBeenCalled();
	expect(spiedManager.slices.pushSlice).not.toHaveBeenCalled();
});

it("skips pushing slices to Prismic when no slices are available", async (ctx) => {
	const { models, spiedHookHandlers } = await mockAdapter(ctx, initProcess, {
		empty: ["slice-library:read"],
	});
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedHookHandlers.sliceLibraryReadHookHandler).toHaveBeenCalledOnce();
	expect(spiedHookHandlers.sliceReadHookHandler).not.toHaveBeenCalled();
	expect(spiedManager.slices.pushSlice).not.toHaveBeenCalled();
	expect(stdout).toMatch(/No slice to push/);
});

it("throws when it fails to read slice libraries", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess, {
		throwsOn: ["slice-library:read"],
	});
	await mockPrismicAPIs(ctx, { initProcess, models });

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.pushDataToPrismic();
		}),
	).rejects.toMatch(/Failed to read slice libraries/);
});

// Custom types

it("pushes types to Prismic", async (ctx) => {
	const { models, spiedHookHandlers } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(
		spiedHookHandlers.customTypeLibraryReadHookHandler,
	).toHaveBeenCalledOnce();
	expect(spiedHookHandlers.customTypeReadHookHandler).toHaveBeenCalledOnce();
	expect(spiedManager.customTypes.pushCustomType).toHaveBeenCalledOnce();
	expect(stdout).toMatch(/Pushed all types/);
});

it("skips pushing types to Prismic when no-push-custom-types flag is set", async (ctx) => {
	const initProcess = createSliceMachineInitProcess({ pushCustomTypes: false });
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
	const { models, spiedHookHandlers } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(
		spiedHookHandlers.customTypeLibraryReadHookHandler,
	).not.toHaveBeenCalled();
	expect(spiedHookHandlers.customTypeReadHookHandler).not.toHaveBeenCalled();
	expect(spiedManager.customTypes.pushCustomType).not.toHaveBeenCalled();
});

it("skips pushing types to Prismic when no-push flag is set", async (ctx) => {
	const initProcess = createSliceMachineInitProcess({ push: false });
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
	const { models, spiedHookHandlers } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(
		spiedHookHandlers.customTypeLibraryReadHookHandler,
	).not.toHaveBeenCalled();
	expect(spiedHookHandlers.customTypeReadHookHandler).not.toHaveBeenCalled();
	expect(spiedManager.customTypes.pushCustomType).not.toHaveBeenCalled();
});

it("skips pushing types to Prismic when no types are available", async (ctx) => {
	const { models, spiedHookHandlers } = await mockAdapter(ctx, initProcess, {
		empty: ["custom-type-library:read"],
	});
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(
		spiedHookHandlers.customTypeLibraryReadHookHandler,
	).toHaveBeenCalledOnce();
	expect(spiedHookHandlers.customTypeReadHookHandler).not.toHaveBeenCalled();
	expect(spiedManager.customTypes.pushCustomType).not.toHaveBeenCalled();
	expect(stdout).toMatch(/No custom type to push/);
});

it("throws when it fails to read slice libraries", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess, {
		throwsOn: ["custom-type-library:read"],
	});
	await mockPrismicAPIs(ctx, { initProcess, models });

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.pushDataToPrismic();
		}),
	).rejects.toMatch(/Failed to read custom type libraries/);
});

// Documents

it("pushes documents to Prismic", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedManager.prismicRepository.pushDocuments).toHaveBeenCalledOnce();
	expect(stdout).toMatch(/Pushed all documents/);
});

it("skips documents that cannot be parsed", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, {
		initProcess,
		models,
		documents: {
			// We purposely leave out the "corge" document because
			// it will not be sent.
			baz: { qux: "quux" },
		},
	});
	const spiedManager = spyManager(initProcess);
	vol.fromJSON(
		{
			"./index.json": JSON.stringify({ signature: "foo" }),
			"./en-us/baz.json": JSON.stringify({ qux: "quux" }),
			// This document contains invalid JSON and will be skipped.
			"./en-us/corge.json": "invalid JSON",
		},
		"/documents",
	);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedManager.prismicRepository.pushDocuments).toHaveBeenCalledOnce();
	expect(stdout).toMatch(new RegExp(`skipped document.*en-us/corge.json`, "i"));
	expect(stdout).toMatch(/Pushed all documents/);
});

it("skips pushing documents to Prismic when no-push-documents flag is set", async (ctx) => {
	const initProcess = createSliceMachineInitProcess({ pushDocuments: false });
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedManager.prismicRepository.pushDocuments).not.toHaveBeenCalled();
});

it("skips pushing documents to Prismic when no-push flag is set", async (ctx) => {
	const initProcess = createSliceMachineInitProcess({ push: false });
	setContext(initProcess, {
		packageManager: "npm",
		framework: UNIVERSAL,
		repository: {
			domain: "repo-admin",
			exists: true,
		},
	});
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	const spiedManager = spyManager(initProcess);

	await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedManager.prismicRepository.pushDocuments).not.toHaveBeenCalled();
});

it("skips pushing documents to Prismic when no documents directory is available", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, {
		initProcess,
		models,
		documents: {},
	});
	const spiedManager = spyManager(initProcess);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedManager.prismicRepository.pushDocuments).not.toHaveBeenCalled();
	expect(stdout).toMatch(/No document to push/);
});

it("skips pushing documents to Prismic when no documents are available", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, {
		initProcess,
		models,
		documents: {},
	});
	const spiedManager = spyManager(initProcess);
	vol.fromJSON(
		{
			"./index.json": JSON.stringify({ signature: "foo" }),
		},
		"/documents",
	);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(spiedManager.prismicRepository.pushDocuments).not.toHaveBeenCalled();
	expect(stdout).toMatch(/No document to push/);
});

// Cleanup

it("pushes data to Prismic", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(stdout).toMatch(/Pushed all slices/);
	expect(stdout).toMatch(/Pushed all types/);
	// expect(stdout).toMatch(/Pushed all documents/);
	expect(stdout).toMatch(/Pushed data to Prismic/);
});

it("cleans up documents directory", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(
		Object.keys(vol.toJSON()).filter((path) => path.includes("documents")),
	).toStrictEqual([]);
	expect(stdout).toMatch(/Cleaned up data push artifacts/);
});

it("does not throw if process cannot clean up documents directory", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, {
		initProcess,
		models,
		documents: {},
	});

	expect(
		Object.keys(vol.toJSON()).filter((path) => path.includes("documents")),
	).toStrictEqual([]);

	const { stdout } = await watchStd(() => {
		// @ts-expect-error - Accessing protected method
		return initProcess.pushDataToPrismic();
	});

	expect(stdout).toMatch(/Cleaned up data push artifacts/);
});

it("throws if context is missing repository", async (ctx) => {
	const { models } = await mockAdapter(ctx, initProcess);
	await mockPrismicAPIs(ctx, { initProcess, models });
	updateContext(initProcess, {
		repository: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.pushDataToPrismic();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository selection must be available through context to run `pushDataToPrismic`"',
	);
});
