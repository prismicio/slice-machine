import { expect, it } from "vitest";
import { Buffer } from "node:buffer";
import { rest } from "msw";

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

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	const { createEndpoint } = mockAWSACLAPI(ctx, {
		expectedPrismicRepository: sliceMachineConfig.repositoryName,
		expectedAuthenticationToken: authenticationToken,
	});

	ctx.msw.use(
		rest.post(createEndpoint.uploadEndpoint, (req, res, ctx) => {
			// TODO: Validate form data

			return res(ctx.status(200));
		}),
	);

	await manager.screenshots.initS3ACL();

	const res = await manager.screenshots.uploadScreenshot({
		data: Buffer.from("screenshot-data"),
	});

	expect(res).toStrictEqual({
		url: new URL(
			"d70850dbc1e2db543553c50034432a5da660a1d5?auto=compress%2Cformat",
			createEndpoint.imgixEndpoint,
		).toString(),
	});
});

it.todo("supports custom asset key prefixes", async (ctx) => {});

it.todo("throws if the upload was unsuccessful", async (ctx) => {});

it.todo("throws if an S3 ACL has not been initialized", async (ctx) => {});
