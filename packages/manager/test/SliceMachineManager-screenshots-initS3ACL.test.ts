import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockAWSACLAPI } from "./__testutils__/mockAWSACLAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";

it("creates a reusable S3 ACL", async (ctx) => {
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

	const { s3ACL } = mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
	});

	// @ts-expect-error - Accessing an internal private property
	expect(manager.screenshots._s3ACL).toBe(undefined);

	await manager.screenshots.initS3ACL();

	// @ts-expect-error - Accessing an internal private property
	expect(manager.screenshots._s3ACL).toStrictEqual({
		uploadEndpoint: s3ACL.uploadEndpoint,
		requiredFormDataFields: s3ACL.requiredFormDataFields,
		imgixEndpoint: s3ACL.imgixEndpoint,
	});
});
