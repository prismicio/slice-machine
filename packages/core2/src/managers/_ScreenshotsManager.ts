import * as t from "io-ts";
import { fileTypeFromBuffer } from "file-type";
import fetch, { FormData, Blob } from "node-fetch";
// puppeteer is lazy-loaded in captureSliceSimulatorScreenshot
import type { BrowserContext, Viewport } from "puppeteer";

import { checkIsURLAccessible } from "../lib/checkIsURLAccessible";
import { createContentDigest } from "../lib/createContentDigest";
import { decode } from "../lib/decode";

import { S3ACL } from "../types";
import { APIEndpoints, SLICE_MACHINE_USER_AGENT } from "../constants";

import { BaseManager } from "./_BaseManager";

const SLICE_SIMULATOR_LOAD_TIMEOUT = 10_000; // ms
const SLICE_SIMULATOR_ROOT_SELECTOR = "#root";

const DEFAULT_SCREENSHOT_VIEWPORT: Viewport = {
	width: 1200,
	height: 800,
};

export function assertS3ACLInitialized(
	s3ACL: S3ACL | undefined,
): asserts s3ACL is NonNullable<typeof s3ACL> {
	if (s3ACL == undefined) {
		throw new Error(
			"An S3 ACL has not yet been initialized. Run `SliceMachineManager.screenshots.prototype.initS3ACL()` before re-calling this method.",
		);
	}
}

export function assertBrowserContextInitialized(
	browserContext: BrowserContext | undefined,
): asserts browserContext is NonNullable<typeof browserContext> {
	if (browserContext == undefined) {
		throw new Error(
			"A browser context has not yet been initialized. Run `SliceMachineManager.screenshots.prototype.initBrowserContext()` before re-calling this method.",
		);
	}
}

type ScreenshotsManagerCaptureSliceSimulatorScreenshotArgs = {
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

export class ScreenshotsManager extends BaseManager {
	browserContext: BrowserContext | undefined;
	s3ACL: S3ACL | undefined;

	async initBrowserContext(): Promise<void> {
		if (this.browserContext) {
			return;
		}

		// Lazy-load Puppeteer only once it is needed.
		const puppeteer = await import("puppeteer");

		const browser = await puppeteer.launch();

		this.browserContext = await browser.createIncognitoBrowserContext();
	}

	async initS3ACL(): Promise<void> {
		if (this.s3ACL) {
			return;
		}

		const sliceMachineConfig = await this.project.getSliceMachineConfig();
		const authenticationToken = await this.user.getAuthenticationToken();

		const awsACLURL = new URL("create", APIEndpoints.AwsAclProvider);
		const awsACLRes = await fetch(awsACLURL.toString(), {
			headers: {
				Authorization: `Bearer ${authenticationToken}`,
				"User-Agent": SLICE_MACHINE_USER_AGENT,
				Repository: sliceMachineConfig.repositoryName,
			},
		});
		const awsACLJSON = await awsACLRes.json();

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

		this.s3ACL = {
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
		assertBrowserContextInitialized(this.browserContext);

		const sliceMachineConfig = await this.project.getSliceMachineConfig();

		if (!sliceMachineConfig.localSliceSimulatorURL) {
			// TODO: Provide a more helpful error message.
			throw new Error(
				"A local Slice Simulator URL must be configured in your Slice Machine configuration file.",
			);
		}

		const url = new URL(sliceMachineConfig.localSliceSimulatorURL);
		url.searchParams.set("lid", args.libraryID);
		url.searchParams.set("sid", args.sliceID);
		url.searchParams.set("vid", args.variationID);

		const isURLAccessible = await checkIsURLAccessible(url.toString());

		if (!isURLAccessible) {
			throw new Error(`Slice Simulator URL is not accessible: ${url}`);
		}

		const page = await this.browserContext.newPage();
		page.setViewport(args.viewport || DEFAULT_SCREENSHOT_VIEWPORT);

		// TODO: I removed `goto`'s `{ waitUntil: "networkidle2" }` option.
		// Good idea? Bad idea?
		await page.goto(url.toString());
		await page.waitForSelector(SLICE_SIMULATOR_ROOT_SELECTOR, {
			timeout: SLICE_SIMULATOR_LOAD_TIMEOUT,
		});

		const element = await page.$(SLICE_SIMULATOR_ROOT_SELECTOR);
		if (!element) {
			const baseURL = new URL(url.pathname, url.origin);

			throw new Error(
				`Slice Simulator could not find the element to screenshot. Verify the URL is correct: ${baseURL}`,
			);
		}

		const data = (await element.screenshot({ encoding: "binary" })) as Buffer;

		return {
			data,
		};
	}

	async uploadScreenshot(
		args: ScreenshotsManagerUploadScreenshotArgs,
	): Promise<ScreenshotsManagerUploadScreenshotReturnType> {
		assertS3ACLInitialized(this.s3ACL);

		const formData = new FormData();

		for (const requiredFormDataFieldKey in this.s3ACL.requiredFormDataFields) {
			formData.append(
				requiredFormDataFieldKey,
				this.s3ACL.requiredFormDataFields[requiredFormDataFieldKey],
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

		const res = await fetch(this.s3ACL.uploadEndpoint, {
			method: "POST",
			body: formData,
		});

		if (res.ok) {
			const url = new URL(key, this.s3ACL.imgixEndpoint);
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
}
