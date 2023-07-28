import { expect, it, TestContext, vi } from "vitest";
import { vol } from "memfs";
import { execaCommand } from "execa";

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
import { watchStd } from "./__testutils__/watchStd";
import { spyManager, SpyManagerReturnType } from "./__testutils__/spyManager";

const existingRepo = "existing-repo";
const prepareEnvironment = async (
	ctx: TestContext,
	initProcess: SliceMachineInitProcess,
	repositoryName: string,
	isNewRepo = false,
): Promise<{ spiedManager: SpyManagerReturnType }> => {
	vol.fromJSON(
		{
			"./package.json": JSON.stringify({
				name: "package-base",
				version: "0.0.0",
			}),
		},
		"/",
	);

	// Mock adapter
	const sharedSliceModel = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const customTypeModel = ctx.mockPrismic.model.customType();
	// TODO: update @prismicio/mock so that custom-type includes the "format" property
	const customTypeModelWithFormat = { ...customTypeModel, format: "custom" };

	const sliceLibraryReadHookHandler = vi.fn(({ libraryID }) => {
		if (libraryID === "./slices") {
			return { id: libraryID, sliceIDs: ["id1", "id2"] };
		}

		throw new Error("not implemented");
	});
	const sliceReadHookHandler = vi.fn(() => {
		return { model: sharedSliceModel };
	});
	const customTypeLibraryReadHookHandler = vi.fn(() => {
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
	adapter.meta.name = UNIVERSAL.adapterName;
	injectTestAdapter({
		initProcess,
		adapter,
		overrideFrameworkAdapter: false,
	});

	// Mock APIs
	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	mockPrismicUserAPI(ctx, {
		repositoriesEndpoint: {
			expectedAuthenticationToken: prismicAuthLoginResponse._token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			repositories: isNewRepo
				? []
				: [
						{
							domain: repositoryName,
							name: "Repository Name",
							role: "Administrator",
						},
				  ],
		},
	});
	mockPrismicAuthAPI(ctx);
	const token = await loginUser(initProcess, prismicAuthLoginResponse);

	mockPrismicCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			expect(await req.json()).toStrictEqual({
				...sharedSliceModel,
				variations: sharedSliceModel.variations.map((variation) => {
					return {
						...variation,
						imageUrl: expect.any(String),
					};
				}),
			});

			return res(ctx.status(201));
		},
		async onCustomTypeGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onCustomTypeInsert(req, res, ctx) {
			expect(await req.json()).toStrictEqual(customTypeModelWithFormat);

			return res(ctx.status(201));
		},
	});
	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: repositoryName,
			expectedAuthenticationToken: token,
		},
	});

	vol.fromJSON(
		{
			"./index.json": JSON.stringify({ signature: "foo" }),
			"./en-us/baz.json": JSON.stringify({ qux: "quux" }),
			"./en-us/corge.json": JSON.stringify({ grault: "garply" }),
		},
		"/documents",
	);

	const documents = {
		baz: { qux: "quux" },
		corge: { grault: "garply" },
	};
	mockPrismicRepositoryAPI(ctx, {
		existsEndpoint: {
			isSuccessful: true,
			expectedAuthenticationToken: token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			existingRepositories: isNewRepo
				? [existingRepo]
				: [repositoryName, existingRepo],
		},
		newEndpoint: {
			expectedAuthenticationToken: token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			domain: repositoryName,
		},
		starterDocumentsEndpoint: {
			expectedAuthenticationToken: token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			domain: repositoryName,
			signature: "foo",
			documents,
		},
	});

	// Mock execa
	const spiedManager = spyManager(initProcess);
	spiedManager.project.installDependencies.mockImplementation((args) => {
		const execaProcess = execaCommand(
			`echo 'mock command ran: ${JSON.stringify(args)}'`,
			{ encoding: "utf-8" },
		);

		return Promise.resolve({
			execaProcess,
		});
	});

	return { spiedManager };
};

it("runs it all", async (ctx) => {
	const repositoryName = "repo-admin";
	const initProcess = createSliceMachineInitProcess({
		repository: repositoryName,
		cwd: "/",
		startSlicemachine: false,
	});
	await prepareEnvironment(ctx, initProcess, repositoryName);

	const { stdout } = await watchStd(() => {
		return initProcess.run();
	});

	// Starts
	expect(stdout).toMatch(/Init command started/);
	// Uses repository name
	expect(stdout.join("")).toContain(repositoryName);
	// Succeed
	expect(stdout).toMatch(/Init command successful/);
});

it.skip("runs it all with new repo", async (ctx) => {
	const repositoryName = "new-repo";
	const initProcess = createSliceMachineInitProcess({
		repository: repositoryName,
		cwd: "/",
	});
	await prepareEnvironment(ctx, initProcess, repositoryName, true);

	const { stdout } = await watchStd(() => {
		return initProcess.run();
	});

	// Starts
	expect(stdout).toMatch(/Init command started/);
	// Uses repository name
	expect(stdout.join("")).toContain(repositoryName);
	// Creates repository
	expect(stdout).toMatch(/Created new repository/);
	// Succeed
	expect(stdout).toMatch(/Init command successful/);
});

it("outputs get started final message", async (ctx) => {
	const repositoryName = "repo-admin";
	const initProcess = createSliceMachineInitProcess({
		repository: repositoryName,
		cwd: "/",
		startSlicemachine: false,
	});
	await prepareEnvironment(ctx, initProcess, repositoryName);

	const { stdout } = await watchStd(() => {
		return initProcess.run();
	});

	// Pretty final message
	expect(stdout.pop()).toMatchSnapshot(`
		"
		YOUR REPOSITORY
			Dashboard            https://repo-admin.prismic.io
			API                  https://repo-admin.cdn.prismic.io/api/v2
		
		RESOURCES
			Documentation        https://prismic.dev/init/next-11-13
			Getting help         https://community.prismic.io
		
		
		GETTING STARTED
			Run Slice Machine    npm run slicemachine
			Run your project     npm run dev
		
		Getting help             https://community.prismic.io
		"
	`);
});

it("adapts get started final message depending on context", async (ctx) => {
	const repositoryName = "repo-admin";
	const initProcess = createSliceMachineInitProcess({
		repository: repositoryName,
		cwd: "/",
		startSlicemachine: false,
	});
	await prepareEnvironment(ctx, initProcess, repositoryName);
	await vol.promises.writeFile(
		"/package.json",
		JSON.stringify({
			name: "package-base",
			version: "0.0.0",
			scripts: {
				slicemachine: "another script",
			},
		}),
	);

	const { stdout } = await watchStd(() => {
		return initProcess.run();
	});

	// Pretty final message
	expect(stdout.pop()).toMatch(/npx start-slicemachine/);
});

it("tracks thrown errors", async (ctx) => {
	const initProcess = createSliceMachineInitProcess({
		repository: existingRepo,
		cwd: "/",
	});
	const { spiedManager } = await prepareEnvironment(
		ctx,
		initProcess,
		"repo-admin",
	);

	await expect(
		watchStd(() => {
			return initProcess.run();
		}),
	).rejects.toThrow();
	expect(spiedManager.telemetry.track).toHaveBeenLastCalledWith(
		expect.objectContaining({
			event: "command:init:end",
			framework: expect.any(String),
			success: false,
			error: expect.any(String),
		}),
	);
});
