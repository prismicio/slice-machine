import type { Viewport } from "puppeteer";
import fetch from "node-fetch";

import type { SliceMachineConfig } from "../types";

const PAGE_LOAD_TIMEOUT = 10000; // ms

const DEFAULT_VIEWPORT: Viewport = {
	width: 1200,
	height: 800,
};

const ROOT_SELECTOR = "#root";

const testURLAccess = async (url: string) => {
	const res = await fetch(url);

	return res.ok;
};

type CaptureSliceSimulatorScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
	projectConfig: SliceMachineConfig;
	viewport?: Viewport;
};

type CaptureSliceSimulatorScreenshotReturnType = {
	data: Buffer;
};

export const captureSliceSimulatorScreenshot = async (
	args: CaptureSliceSimulatorScreenshotArgs,
): Promise<CaptureSliceSimulatorScreenshotReturnType> => {
	if (!args.projectConfig.localSliceSimulatorURL) {
		// TODO: Provide a more helpful error message.
		throw new Error(
			"A local Slice Simulator URL must be configured in your Slice Machine configuration file.",
		);
	}

	const url = new URL(args.projectConfig.localSliceSimulatorURL);
	url.searchParams.set("lid", args.libraryID);
	url.searchParams.set("sid", args.sliceID);
	url.searchParams.set("vid", args.variationID);

	const isURLAccessible = await testURLAccess(url.toString());

	if (!isURLAccessible) {
		throw new Error(`Slice Simulator URL is not accessible: ${url}`);
	}

	// Lazy-load Puppeteer only once it is needed.
	const puppeteer = await import("puppeteer");

	const browser = await puppeteer.launch();

	const context = await browser.createIncognitoBrowserContext();
	const page = await context.newPage();
	page.setViewport(args.viewport || DEFAULT_VIEWPORT);

	await page.goto(url.toString(), { waitUntil: "networkidle2" });
	await page.waitForSelector(ROOT_SELECTOR, { timeout: PAGE_LOAD_TIMEOUT });

	const element = await page.$(ROOT_SELECTOR);
	if (!element) {
		const baseURL = new URL(url.pathname, url.origin);

		throw new Error(
			`Slice Simulator could not find the element to screenshot. Verify the URL is correct: ${baseURL}`,
		);
	}

	const data = (await element.screenshot({ encoding: "binary" })) as Buffer;

	await context.close();

	return {
		data,
	};
};
