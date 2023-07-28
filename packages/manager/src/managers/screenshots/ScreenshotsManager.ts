import * as t from "io-ts";
import { fileTypeFromBuffer } from "file-type";
import fetch, { FormData, Blob, Response } from "../../lib/fetch";

import { checkIsURLAccessible } from "../../lib/checkIsURLAccessible";
import { createContentDigest } from "../../lib/createContentDigest";
import { decode } from "../../lib/decode";

import { S3ACL } from "../../types";
import { SLICE_MACHINE_USER_AGENT } from "../../constants/SLICE_MACHINE_USER_AGENT";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";

import { BaseManager } from "../BaseManager";

const SLICE_SIMULATOR_WAIT_FOR_SELECTOR = "#__iframe-ready";
const SLICE_SIMULATOR_WAIT_FOR_SELECTOR_TIMEOUT = 10_000; // ms
const SLICE_SIMULATOR_SCREENSHOT_SELECTOR = "#__iframe-renderer";

// TODO(DT-1534): Use Puppeteer types if we want reactive Puppeteer screenshots
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Viewport = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BrowserContext = any;

const DEFAULT_SCREENSHOT_VIEWPORT: Viewport = {
	width: 1200,
	height: 800,
};

function assertS3ACLInitialized(
	s3ACL: S3ACL | undefined,
): asserts s3ACL is NonNullable<typeof s3ACL> {
	if (s3ACL == undefined) {
		throw new Error(
			"An S3 ACL has not been initialized. Run `SliceMachineManager.screenshots.prototype.initS3ACL()` before re-calling this method.",
		);
	}
}

function assertBrowserContextInitialized(
	browserContext: BrowserContext | undefined,
): asserts browserContext is NonNullable<typeof browserContext> {
	if (browserContext == undefined) {
		throw new Error(
			"A browser context has not been initialized. Run `SliceMachineManager.screenshots.prototype.initBrowserContext()` before re-calling this method.",
		);
	}
}

/**
 * Encodes a part of a Slice Simulator URL to ensure it can be added to a URL
 * safely.
 *
 * The encoding logic must match Slice Machine UI's URL encoding practices.
 * Today, that requires the following:
 *
 * - Replace "/" with "--" (e.g. a Slice Library ID of "./slices" should turn into
 *   ".--slices")
 *
 * @param urlPart - A part of the URL.
 *
 * @returns `urlPart` encoded for use in a URL.
 */
const encodeSliceSimulatorURLPart = (urlPart: string): string => {
	return urlPart.replace(/\//g, "--");
};

type ScreenshotsManagerCaptureSliceSimulatorScreenshotArgs = {
	sliceMachineUIOrigin: string;
	libraryID: string;
	sliceID: string;
	variationID: string;
	viewport?: Viewport;
};

type ScreenshotsManagerCaptureSliceSimulatorScreenshotReturnType = {
	data: Buffer;
};

type ScreenshotsManagerUploadScreenshotArgs = {
	data: Buffer;
	keyPrefix?: string;
};

type ScreenshotsManagerUploadScreenshotReturnType = {
	url: string;
};

type ScreenshotsManagerDeleteScreenshotFolderArgs = {
	sliceID: string;
};

export class ScreenshotsManager extends BaseManager {
	private _browserContext: BrowserContext | undefined;
	private _s3ACL: S3ACL | undefined;

	async initBrowserContext(): Promise<void> {
		// TODO(DT-1534): Uncomment to enable Puppeteer screenshots or delete if we decide to remove Puppeteer
		//
		// if (this._browserContext) {
		// 	return;
		// }
		//
		// let puppeteer: typeof import("puppeteer");
		// try {
		// 	// Lazy-load Puppeteer only once it is needed.
		// 	puppeteer = await import("puppeteer");
		// } catch {
		// 	throw new InternalError(
		// 		"Screenshots require Puppeteer but Puppeteer was not found. Check that the `puppeteer` package is installed before trying again.",
		// 	);
		// }
		// try {
		// 	const browser = await puppeteer.launch({ headless: "new" });
		// 	this._browserContext = await browser.createIncognitoBrowserContext();
		// } catch (error) {
		// 	throw new InternalError(
		// 		"Error launching browser. If you're using an Apple Silicon Mac, check if Rosetta is installed.",
		// 	);
		// }
	}

	async initS3ACL(): Promise<void> {
		// TODO: we need to find a way to create a new AWS ACL only when necessary (e.g., when it has expired).
		// if (this._s3ACL) {
		// 	return;
		// }

		const awsACLURL = new URL("create", API_ENDPOINTS.AwsAclProvider);
		const awsACLRes = await this._fetch({ url: awsACLURL });

		const awsACLText = await awsACLRes.text();
		let awsACLJSON: unknown;
		try {
			awsACLJSON = JSON.parse(awsACLText);
		} catch (error) {
			// Response is not JSON
			throw new Error(
				`Invalid AWS ACL response from ${awsACLURL}: ${awsACLText}`,
			);
		}

		const { value: awsACL, error } = decode(
			t.intersection([
				t.type({
					values: t.type({
						url: t.string,
						fields: t.record(t.string, t.string),
					}),
					imgixEndpoint: t.string,
				}),
				t.partial({
					message: t.string,
					Message: t.string,
					error: t.string,
				}),
			]),
			awsACLJSON,
		);

		if (error) {
			throw new Error(`Invalid AWS ACL response from ${awsACLURL}`);
		}

		const errorMessage = awsACL.error || awsACL.message || awsACL.Message;
		if (errorMessage) {
			throw new Error(`Failed to create an AWS ACL: ${errorMessage}`);
		}

		this._s3ACL = {
			uploadEndpoint: awsACL.values.url,
			requiredFormDataFields: awsACL.values.fields,
			imgixEndpoint: awsACL.imgixEndpoint,
		};
	}

	// TODO: Abstract to a generic `captureScreenshot()` method that is
	// used within a Slice-specific method in SliceManager.
	async captureSliceSimulatorScreenshot(
		args: ScreenshotsManagerCaptureSliceSimulatorScreenshotArgs,
	): Promise<ScreenshotsManagerCaptureSliceSimulatorScreenshotReturnType> {
		assertBrowserContextInitialized(this._browserContext);

		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		if (!sliceMachineConfig.localSliceSimulatorURL) {
			// TODO: Provide a more helpful error message.
			throw new Error(
				"A local Slice Simulator URL must be configured in your Slice Machine configuration file.",
			);
		}

		const { model } = await this.slices.readSlice({
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});
		if (!model) {
			throw new Error(
				`Did not find a Slice in library "${args.libraryID}" with ID "${args.sliceID}".`,
			);
		}

		const viewport = args.viewport || DEFAULT_SCREENSHOT_VIEWPORT;

		// TODO: Change `model.name` to `args.sliceID`?
		// Making that change would require changing the screenshot
		// page path in Slice Machine UI.
		const url = new URL(
			`./${encodeSliceSimulatorURLPart(args.libraryID)}/${model.name}/${
				args.variationID
			}/screenshot`,
			args.sliceMachineUIOrigin,
		);
		url.searchParams.set("screenWidth", viewport.width.toString());
		url.searchParams.set("screenHeight", viewport.height.toString());

		const isURLAccessible = await checkIsURLAccessible(url.toString());

		if (!isURLAccessible) {
			throw new Error(
				`Slice Simulator screenshot URL is not accessible: ${url}`,
			);
		}

		const page = await this._browserContext.newPage();
		page.setViewport(viewport);

		await page.goto(url.toString(), { waitUntil: ["load", "networkidle0"] });
		await page.waitForSelector(SLICE_SIMULATOR_WAIT_FOR_SELECTOR, {
			timeout: SLICE_SIMULATOR_WAIT_FOR_SELECTOR_TIMEOUT,
		});

		const element = await page.$(SLICE_SIMULATOR_SCREENSHOT_SELECTOR);
		if (!element) {
			const baseURL = new URL(url.pathname, url.origin);

			throw new Error(
				`Slice Simulator did not find ${SLICE_SIMULATOR_WAIT_FOR_SELECTOR} on the page. Verify the URL is correct: ${baseURL}`,
			);
		}

		const data = (await element.screenshot({
			encoding: "binary",
			clip: {
				width: viewport.width,
				height: viewport.height,
				x: 0,
				y: 0,
			},
		})) as Buffer;

		return {
			data,
		};
	}

	async uploadScreenshot(
		args: ScreenshotsManagerUploadScreenshotArgs,
	): Promise<ScreenshotsManagerUploadScreenshotReturnType> {
		assertS3ACLInitialized(this._s3ACL);

		const formData = new FormData();

		for (const requiredFormDataFieldKey in this._s3ACL.requiredFormDataFields) {
			formData.append(
				requiredFormDataFieldKey,
				this._s3ACL.requiredFormDataFields[requiredFormDataFieldKey],
			);
		}

		const contentDigest = createContentDigest(args.data);
		const fileType = await fileTypeFromBuffer(args.data);
		const fileName = fileType
			? `${contentDigest}.${fileType.ext}`
			: contentDigest;
		const key = args.keyPrefix ? `${args.keyPrefix}/${fileName}` : fileName;

		formData.set("key", key);

		if (fileType) {
			formData.set("Content-Type", fileType.mime);
		}

		formData.set("file", new Blob([args.data], { type: fileType?.mime }));

		const res = await fetch(this._s3ACL.uploadEndpoint, {
			method: "POST",
			body: formData,
		});

		if (res.ok) {
			const url = new URL(key, this._s3ACL.imgixEndpoint);
			url.searchParams.set("auto", "compress,format");

			return {
				url: url.toString(),
			};
		} else {
			throw new Error(
				`Unable to upload screenshot with status code: ${res.status}`,
			);
		}
	}

	async deleteScreenshotFolder(
		args: ScreenshotsManagerDeleteScreenshotFolderArgs,
	): Promise<void> {
		const res = await this._fetch({
			// We're sending `args.sliceID` as `sliceName` because it's inconsistently
			// named in the ACL Provider API.
			body: { sliceName: args.sliceID },
			method: "POST",
			url: new URL("delete-folder", API_ENDPOINTS.AwsAclProvider),
		});
		if (!res.ok) {
			throw new Error(
				`Unable to delete screenshot folder with status code: ${res.status}`,
			);
		}
	}

	private async _fetch(args: {
		url: URL;
		method?: "GET" | "POST";
		body?: unknown;
	}): Promise<Response> {
		const authenticationToken = await this.user.getAuthenticationToken();
		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		return await fetch(args.url, {
			body: args.body ? JSON.stringify(args.body) : undefined,
			headers: {
				Authorization: `Bearer ${authenticationToken}`,
				Repository: sliceMachineConfig.repositoryName,
				"User-Agent": SLICE_MACHINE_USER_AGENT,
				...(args.body ? { "Content-Type": "application/json" } : {}),
			},
			method: args.method,
		});
	}
}
