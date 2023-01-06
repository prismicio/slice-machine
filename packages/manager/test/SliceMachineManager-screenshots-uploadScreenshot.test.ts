import { expect, it } from "vitest";
import { Buffer } from "node:buffer";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockAWSACLAPI } from "./__testutils__/mockAWSACLAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";

it("uploads a screenshot to S3", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const screenshotData = Buffer.from("screenshot-data");

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	const { s3ACL } = mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
		uploadEndpoint: {
			expectedUploads: [{ file: screenshotData }],
		},
	});

	await manager.screenshots.initS3ACL();

	const res = await manager.screenshots.uploadScreenshot({
		data: screenshotData,
	});

	expect(res).toStrictEqual({
		url: new URL(
			"d70850dbc1e2db543553c50034432a5da660a1d5?auto=compress%2Cformat",
			s3ACL.imgixEndpoint,
		).toString(),
	});
});

it("supports custom asset key prefixes", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const screenshotData = Buffer.from("screenshot-data");

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	const { s3ACL } = mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
		uploadEndpoint: {
			expectedUploads: [{ file: screenshotData }],
		},
	});

	await manager.screenshots.initS3ACL();

	const res = await manager.screenshots.uploadScreenshot({
		data: screenshotData,
		keyPrefix: "key-prefix",
	});

	expect(res).toStrictEqual({
		url: new URL(
			"key-prefix/d70850dbc1e2db543553c50034432a5da660a1d5?auto=compress%2Cformat",
			s3ACL.imgixEndpoint,
		).toString(),
	});
});

it("automatically sends the screenshot's content type", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	// A very small GIF.
	const screenshotData = Buffer.from("R0lGODlhAQABAAAAACw=", "base64");

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	const { s3ACL } = mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
		uploadEndpoint: {
			expectedUploads: [
				{
					file: screenshotData,
					contentType: "image/gif",
				},
			],
		},
	});

	await manager.screenshots.initS3ACL();

	const res = await manager.screenshots.uploadScreenshot({
		data: screenshotData,
	});

	expect(res).toStrictEqual({
		url: new URL(
			"470f22af41a0856eff4fa6dd8b394a81149cfbd6.gif?auto=compress%2Cformat",
			s3ACL.imgixEndpoint,
		).toString(),
	});
});

it("throws if the upload was unsuccessful", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
		uploadEndpoint: {
			isSuccessful: false,
		},
	});

	await manager.screenshots.initS3ACL();

	await expect(async () => {
		await manager.screenshots.uploadScreenshot({
			data: Buffer.from("screenshot-data"),
		});
	}).rejects.toThrow(/unable to upload screenshot/i);
});

it("throws if an S3 ACL has not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.screenshots.uploadScreenshot({
			data: Buffer.from("screenshot-data"),
		});
	}).rejects.toThrow(/s3 acl has not been initialized/i);
});
