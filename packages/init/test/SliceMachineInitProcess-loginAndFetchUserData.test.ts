import * as path from "node:path";

import { beforeEach, expect, it, vi } from "vitest";
import { stdin as mockStdin } from "mock-stdin";
import open from "open";

import { PrismicRepository } from "@slicemachine/manager";

import { createSliceMachineInitProcess } from "../src";

import { mockUserManager } from "./__testutils__/mockUserManager";
import { mockPrismicRepositoryManager } from "./__testutils__/mockPrismicRepositoryManager";
import { mockTelemetryManager } from "./__testutils__/mockTelemetryManager";
import { watchStd } from "./__testutils__/watchStd";

const initProcess = createSliceMachineInitProcess({
	cwd: path.resolve(__dirname, "__fixtures__/base"),
});

const loginAndFetchUserDataWithStdin = async () => {
	const stdin = mockStdin();

	// @ts-expect-error - Accessing protected method
	const promise = initProcess.loginAndFetchUserData();

	await new Promise((res) => setTimeout(res, 50));

	stdin.send("o").restore();

	return promise;
};

beforeEach(() => {
	vi.mock("open", () => {
		return {
			default: vi.fn(),
		};
	});
});

it("logs in user if logged out", async () => {
	const userSpy = mockUserManager(initProcess, {
		isLoggedIn: false,
		userProfile: true,
	});
	mockPrismicRepositoryManager(initProcess, { repositories: [] });
	mockTelemetryManager(initProcess);

	const { stdout } = await watchStd(loginAndFetchUserDataWithStdin);

	expect(userSpy.getLoginSessionInfo).toHaveBeenCalledOnce();
	expect(userSpy.nodeLoginSession).toHaveBeenCalledOnce();
	expect(open).toHaveBeenCalledOnce();
	expect(open).toHaveBeenNthCalledWith(
		1,
		// @ts-expect-error - Mocked instance
		userSpy.getLoginSessionInfo.results[0][1].url,
	);
	expect(stdout.join("\n")).toMatch(/Logged in/);
});

it("uses existing session if already logged in", async () => {
	const userSpy = mockUserManager(initProcess, {
		isLoggedIn: true,
		userProfile: true,
	});
	mockPrismicRepositoryManager(initProcess, { repositories: [] });
	mockTelemetryManager(initProcess);

	const { stdout } = await watchStd(async () => {
		// @ts-expect-error - Accessing protected method
		return initProcess.loginAndFetchUserData();
	});

	expect(userSpy.nodeLoginSession).not.toHaveBeenCalled();
	expect(stdout.join("\n")).toMatch(/Logged in/);
});

it("fetches user profile", async () => {
	const userProfile = {
		email: "john@example.com",
		firstName: "john",
		lastName: "doe",
		intercomHash: "#",
		shortId: "00",
		userId: "0000",
	};

	mockUserManager(initProcess, { userProfile });
	mockPrismicRepositoryManager(initProcess, { repositories: [] });
	mockTelemetryManager(initProcess);

	await watchStd(loginAndFetchUserDataWithStdin);

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.userProfile).toStrictEqual(userProfile);
});

it("identifies user", async () => {
	const userProfile = {
		email: "john@example.com",
		firstName: "john",
		lastName: "doe",
		intercomHash: "#",
		shortId: "00",
		userId: "0000",
	};

	mockUserManager(initProcess, { userProfile });
	mockPrismicRepositoryManager(initProcess, { repositories: [] });
	const telemetrySpy = mockTelemetryManager(initProcess);

	await watchStd(loginAndFetchUserDataWithStdin);

	expect(telemetrySpy.identify).toHaveBeenCalledOnce();
	expect(telemetrySpy.identify).toHaveBeenNthCalledWith(1, {
		userID: userProfile.shortId,
		intercomHash: userProfile.intercomHash,
	});
	expect(telemetrySpy.track).toHaveBeenCalledOnce();
	expect(telemetrySpy.track).toHaveBeenNthCalledWith(
		1,
		expect.objectContaining({
			event: "command:init:identify",
		}),
	);
});

it("fetches repositories", async () => {
	const repositories: PrismicRepository[] = [
		{
			domain: "wroom",
			name: "Wroom",
			role: "Administrator",
		},
	];

	mockUserManager(initProcess, { userProfile: true });
	mockPrismicRepositoryManager(initProcess, { repositories });
	mockTelemetryManager(initProcess);

	await watchStd(loginAndFetchUserDataWithStdin);

	// @ts-expect-error - Accessing protected property
	expect(initProcess.context.userRepositories).toStrictEqual(repositories);
});
