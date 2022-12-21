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
	const localSliceSimulatorURL = "https://localhost:3000/slice-simulator";
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter, localSliceSimulatorURL });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const { sliceSimulatorEndpoint } = mockSliceSimulatorEndpoint(ctx, {
		localSliceSimulatorURL,
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
	});

	const screenshotData = Buffer.from("screenshot-data");
	puppeteerMock.__element__screenshot.mockReturnValueOnce(screenshotData);

	await manager.screenshots.initBrowserContext();

	const res = await manager.screenshots.captureSliceSimulatorScreenshot({
		libraryID: "foo",
		sliceID: "bar",
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
	const localSliceSimulatorURL = "https://localhost:3000/slice-simulator";
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter, localSliceSimulatorURL });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockSliceSimulatorEndpoint(ctx, {
		localSliceSimulatorURL,
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
	});

	const screenshotData = Buffer.from("screenshot-data");
	puppeteerMock.__element__screenshot.mockReturnValueOnce(screenshotData);

	await manager.screenshots.initBrowserContext();

	const res = await manager.screenshots.captureSliceSimulatorScreenshot({
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
		viewport: { width: 200, height: 100 },
	});

	expect(res).toStrictEqual({
		data: screenshotData,
	});
	expect(puppeteerMock.__page__setViewport).toHaveBeenCalledWith({
		width: 200,
		height: 100,
	});
});

it("throws if the root selector cannot be found", async (ctx) => {
	const localSliceSimulatorURL = "https://localhost:3000/slice-simulator";
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter, localSliceSimulatorURL });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockSliceSimulatorEndpoint(ctx, {
		localSliceSimulatorURL,
		libraryID: "foo",
		sliceID: "bar",
		variationID: "baz",
	});

	await manager.screenshots.initBrowserContext();

	puppeteerMock.__page__$.mockReturnValueOnce(null);

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/could not find the element to screenshot/i);
});

it("throws if a Slice Simulator URL is not accessible", async (ctx) => {
	const localSliceSimulatorURL = "https://localhost:3000/slice-simulator";
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter, localSliceSimulatorURL });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockSliceSimulatorEndpoint(ctx, { localSliceSimulatorURL, exists: false });

	await manager.screenshots.initBrowserContext();

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/slice simulator url is not accessible/i);
});

it("throws if a Slice Simulator URL is not configured", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.screenshots.initBrowserContext();

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			libraryID: "foo",
			sliceID: "bar",
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

	await expect(async () => {
		await manager.screenshots.captureSliceSimulatorScreenshot({
			libraryID: "foo",
			sliceID: "bar",
			variationID: "baz",
		});
	}).rejects.toThrow(/browser context has not been initialized/i);
});
