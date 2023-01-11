import { expect, it, vi } from "vitest";

import { createPuppeteerMock } from "./__testutils__/createPuppeteerMock";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockSliceSimulatorEndpoint } from "./__testutils__/mockSliceSimulatorEndpoint";

import { createSliceMachineManager } from "../src";

const puppeteerMock = createPuppeteerMock();

vi.mock("puppeteer", () => {
	return puppeteerMock;
});

it("captures a Slice Simulator screenshot for a given Slice variation", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({
		adapter,
		localSliceSimulatorURL: "https://localhost:3000/slice-simulator",
	});
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();
	await manager.screenshots.initBrowserContext();

	const sliceMachineUIOrigin = "http://localhost:1234";
	const { sliceSimulatorEndpoint } = mockSliceSimulatorEndpoint(ctx, {
		sliceMachineUIOrigin,
		libraryID: "foo",
		sliceName: model.name,
		variationID: "baz",
		viewport: {
			width: 1200,
			height: 800,
		},
	});

	const screenshotData = Buffer.from("screenshot-data");
	puppeteerMock.__element__screenshot.mockReturnValueOnce(screenshotData);

	const res = await manager.screenshots.captureSliceSimulatorScreenshot({
		sliceMachineUIOrigin,
		libraryID: "foo",
		sliceID: model.id,
		variationID: "baz",
	});

	expect(res).toStrictEqual({
		data: screenshotData,
	});
	expect(puppeteerMock.__page__setViewport).toHaveBeenCalledWith({
		width: 1200,
		height: 800,
	});
	expect(puppeteerMock.__page__goto).toHaveBeenCalledWith(
		sliceSimulatorEndpoint,
	);
	expect(puppeteerMock.__page__waitForSelector).toHaveBeenCalledWith("#root", {
		timeout: 10_000,
	});
	expect(puppeteerMock.__page__$).toHaveBeenCalledWith("#root");
	expect(puppeteerMock.__element__screenshot).toHaveBeenCalledWith({
		encoding: "binary",
	});
});

it("can be configured to capture a specific viewport", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({
		adapter,
		localSliceSimulatorURL: "https://localhost:3000/slice-simulator",
	});
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();
	await manager.screenshots.initBrowserContext();

	const sliceMachineUIOrigin = "http://localhost:1234";
	const viewport = { width: 200, height: 100 };
	mockSliceSimulatorEndpoint(ctx, {
		sliceMachineUIOrigin,
		libraryID: "foo",
		sliceName: model.name,
		variationID: "baz",
		viewport,
	});

	const screenshotData = Buffer.from("screenshot-data");
	puppeteerMock.__element__screenshot.mockReturnValueOnce(screenshotData);

	const res = await manager.screenshots.captureSliceSimulatorScreenshot({
		sliceMachineUIOrigin,
		libraryID: "foo",
		sliceID: model.id,
		variationID: "baz",
		viewport,
	});

	expect(res).toStrictEqual({
		data: screenshotData,
	});
	expect(puppeteerMock.__page__setViewport).toHaveBeenCalledWith({
		width: viewport.width,
		height: viewport.height,
	});
});

it("throws if the root selector cannot be found", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({
		adapter,
		localSliceSimulatorURL: "https://localhost:3000/slice-simulator",
	});
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();
	await manager.screenshots.initBrowserContext();

	const sliceMachineUIOrigin = "http://localhost:1234";
	mockSliceSimulatorEndpoint(ctx, {
		sliceMachineUIOrigin,
		libraryID: "foo",
		sliceName: model.name,
		variationID: "baz",
		viewport: {
			width: 1200,
			height: 800,
		},
	});

	puppeteerMock.__page__$.mockReturnValueOnce(null);

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			sliceMachineUIOrigin,
			libraryID: "foo",
			sliceID: model.id,
			variationID: "baz",
		});
	}).rejects.toThrow(/could not find the element to screenshot/i);
});

it("throws if the Slice model cannot be found", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				throw new Error("not found");
			});
		},
	});
	const cwd = await createTestProject({
		adapter,
		localSliceSimulatorURL: "https://localhost:3000/slice-simulator",
	});
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();
	await manager.screenshots.initBrowserContext();

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			sliceMachineUIOrigin: "http://localhost:1234",
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/did not find a slice/i);
});

it("throws if a Slice Simulator screenshot URL is not accessible", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({
		adapter,
		localSliceSimulatorURL: "https://localhost:3000/slice-simulator",
	});
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();
	await manager.screenshots.initBrowserContext();

	const sliceMachineUIOrigin = "http://localhost:1234";
	mockSliceSimulatorEndpoint(ctx, {
		sliceMachineUIOrigin,
		libraryID: "foo",
		sliceName: model.name,
		variationID: "baz",
		viewport: {
			width: 1200,
			height: 800,
		},
		exists: false,
	});

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			sliceMachineUIOrigin,
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/slice simulator screenshot url is not accessible/i);
});

it("throws if a Slice Simulator URL is not configured", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();
	await manager.screenshots.initBrowserContext();

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			sliceMachineUIOrigin: "http://localhost:1234",
			libraryID: "foo",
			sliceID: model.id,
			variationID: "baz",
		});
	}).rejects.toThrow(/slice simulator url must be configured/i);
});

it("throws if a browser context has not been initialized", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			sliceMachineUIOrigin: "http://localhost:1234",
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/browser context has not been initialized/i);
});

it("throws if plugins have not been initialized", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({
		adapter,
		localSliceSimulatorURL: "https://localhost:3000/slice-simulator",
	});
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.screenshots.initBrowserContext();

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			sliceMachineUIOrigin: "http://localhost:1234",
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/plugins have not been initialized/i);
});
