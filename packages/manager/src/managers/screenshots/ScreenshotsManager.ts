import * as t from "io-ts";
import { fileTypeFromBuffer } from "file-type";
import pLimit from "p-limit";
import fetch, { FormData, Blob, Response } from "../../lib/fetch";

import { createContentDigest } from "../../lib/createContentDigest";
import { decode } from "../../lib/decode";

import { S3ACL } from "../../types";
import { SLICE_MACHINE_USER_AGENT } from "../../constants/SLICE_MACHINE_USER_AGENT";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";

import { BaseManager } from "../BaseManager";

function assertS3ACLInitialized(
	s3ACL: S3ACL | undefined,
): asserts s3ACL is NonNullable<typeof s3ACL> {
	if (s3ACL == undefined) {
		throw new Error(
			"An S3 ACL has not been initialized. Run `SliceMachineManager.screenshots.prototype.initS3ACL()` before re-calling this method.",
		);
	}
}

const uploadScreenshotLimit = pLimit(10);

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
	private _s3ACL: S3ACL | undefined;

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
				{
					cause: error,
				},
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
			throw new Error(`Invalid AWS ACL response from ${awsACLURL}`, {
				cause: error,
			});
		}

		const errorMessage = awsACL.error || awsACL.message || awsACL.Message;
		if (errorMessage) {
			throw new Error(`Failed to create an AWS ACL: ${errorMessage}`, {
				cause: error,
			});
		}

		this._s3ACL = {
			uploadEndpoint: awsACL.values.url,
			requiredFormDataFields: awsACL.values.fields,
			imgixEndpoint: awsACL.imgixEndpoint,
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

		const s3ACLEndpoint = this._s3ACL.uploadEndpoint;
		const res = await uploadScreenshotLimit(() =>
			fetch(s3ACLEndpoint, {
				method: "POST",
				body: formData,
			}),
		);

		if (res.ok) {
			const url = new URL(key, this._s3ACL.imgixEndpoint);
			url.searchParams.set("auto", "compress,format");

			return {
				url: url.toString(),
			};
		} else {
			const text = await res.text();
			throw new Error(
				`Unable to upload screenshot with status code: ${res.status}`,
				{
					cause: text,
				},
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
			const text = await res.text();
			throw new Error(
				`Unable to delete screenshot folder with status code: ${res.status}`,
				{
					cause: text,
				},
			);
		}
	}

	private async _fetch(args: {
		url: URL;
		method?: "GET" | "POST";
		body?: unknown;
	}): Promise<Response> {
		const authenticationToken = await this.user.getAuthenticationToken();
		const repositoryName = await this.project.getResolvedRepositoryName();

		return await fetch(args.url, {
			body: args.body ? JSON.stringify(args.body) : undefined,
			headers: {
				Authorization: `Bearer ${authenticationToken}`,
				Repository: repositoryName,
				"User-Agent": SLICE_MACHINE_USER_AGENT,
				...(args.body ? { "Content-Type": "application/json" } : {}),
			},
			method: args.method,
		});
	}
}
