import http from "node:http";
import { beforeEach, expect, it, TestContext, vi } from "vitest";
import { stdin as mockStdin } from "mock-stdin";

import { createSliceMachineInitProcess, SliceMachineInitProcess } from "../src";
import { UNIVERSAL } from "../src/lib/framework";

import {
	createPrismicAuthLoginResponse,
	PrismicAuthLoginResponse,
} from "./__testutils__/createPrismicAuthLoginResponse";
import { mockPrismicRepositoryAPI } from "./__testutils__/mockPrismicRepositoryAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { loginUser } from "./__testutils__/loginUser";
import { setContext } from "./__testutils__/setContext";
import { updateContext } from "./__testutils__/updateContext";
import { spyManager } from "./__testutils__/spyManager";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess();
const spiedManager = spyManager(initProcess);

vi.mock("open", () => {
	return {
		default: vi.fn(),
	};
});

beforeEach(() => {
	setContext(initProcess, {
		framework: UNIVERSAL,
		repository: {
			domain: "new-repo",
			exists: false,
		},
	});
});

const mockPrismicAPIs = async (
	ctx: TestContext,
	initProcess: SliceMachineInitProcess,
	domain?: string,
): Promise<{
	prismicAuthLoginResponse: PrismicAuthLoginResponse;
}> => {
	const prismicAuthLoginResponse = createPrismicAuthLoginResponse();
	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);
	const token = await loginUser(initProcess, prismicAuthLoginResponse);

	mockPrismicRepositoryAPI(ctx, {
		newEndpoint: {
			expectedAuthenticationToken: token,
			expectedCookies: prismicAuthLoginResponse.cookies,
			// @ts-expect-error - Accessing protected property
			domain: domain ?? initProcess.context.repository?.domain,
		},
	});

	return { prismicAuthLoginResponse };
};

const loginAndCreateRepositoryWithStdin = async (
	prismicAuthLoginResponse: PrismicAuthLoginResponse,
) => {
	const stdin = mockStdin();

	// @ts-expect-error - Accessing protected method
	const promise = initProcess.createNewRepository();

	await new Promise((res) => setTimeout(res, 50));

	stdin.send("o").restore();

	await new Promise((res) => setTimeout(res, 50));

	const port: number =
		spiedManager.user.getLoginSessionInfo.mock.results[0].value.port;

	const body = JSON.stringify(prismicAuthLoginResponse);

	// We use low-level `http` because node-fetch has some issue with 127.0.0.1 on CIs
	const request = http.request({
		host: "127.0.0.1",
		port: `${port}`,
		path: "/",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(body),
		},
	});
	request.write(body);
	request.end();

	return promise;
};

it("create repository from context", async (ctx) => {
	await mockPrismicAPIs(ctx, initProcess);

	await watchStd(async () => {
		// @ts-expect-error - Accessing protected method
		return initProcess.createNewRepository();
	});

	expect(spiedManager.prismicRepository.create).toHaveBeenCalledOnce();
	expect(spiedManager.prismicRepository.create).toHaveBeenNthCalledWith(1, {
		domain: "new-repo",
		framework: UNIVERSAL.wroomTelemetryID,
		starterId: undefined,
	});
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository?.exists).toBe(true);
});

it("creates repository with a retry after a first fail", async (ctx) => {
	const { prismicAuthLoginResponse } = await mockPrismicAPIs(ctx, initProcess);

	// Mock only the first create call to reject first one and resole the second one
	spiedManager.prismicRepository.create.mockImplementationOnce(() => {
		return Promise.reject(new Error("Failed to create repository"));
	});

	await watchStd(async () => {
		await loginAndCreateRepositoryWithStdin(prismicAuthLoginResponse);
	});

	expect(spiedManager.prismicRepository.create).toHaveBeenCalledTimes(2);
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository?.exists).toBe(true);
});

it("fail to create repository after a second fail", async (ctx) => {
	const { prismicAuthLoginResponse } = await mockPrismicAPIs(ctx, initProcess);

	// Mock create call to reject first and second calls
	spiedManager.prismicRepository.create.mockImplementation(() => {
		return Promise.reject(new Error("Failed to create repository"));
	});

	await watchStd(async () => {
		await expect(
			loginAndCreateRepositoryWithStdin(prismicAuthLoginResponse),
		).rejects.toThrow("Failed to create repository");
	});

	expect(spiedManager.prismicRepository.create).toHaveBeenCalledTimes(2);
	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.repository?.exists).toBe(false);
});

it("throws if context is missing framework", async () => {
	updateContext(initProcess, {
		framework: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.createNewRepository();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Project framework must be available through context to run `createNewRepository`"',
	);
});

it("throws if context is missing repository", async () => {
	updateContext(initProcess, {
		repository: undefined,
	});

	await expect(
		watchStd(() => {
			// @ts-expect-error - Accessing protected method
			return initProcess.createNewRepository();
		}),
	).rejects.toThrowErrorMatchingInlineSnapshot(
		'"Repository selection must be available through context to run `createNewRepository`"',
	);
});
