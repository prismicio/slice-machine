import { it, expect } from "vitest";
import { createSliceMachineManager } from "../src";
import { createTestProject } from "./__testutils__/createTestProject";
import { createTestPlugin } from "./__testutils__/createTestPlugin";

it("returns global Slice Machine state", async () => {
	const adapter = await createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		cwd,
		nativePlugins: {
			[adapter.meta.name]: adapter,
		},
	});
	await manager.plugins.initPlugins();
	await manager.user.logout();
	const result = await manager.getState();

	expect(result.env.endpoints).toStrictEqual({
		AwsAclProvider:
			"https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
		PrismicOembed: "https://oembed.prismic.io",
		PrismicAuthentication: "https://auth.prismic.io/",
		PrismicModels: "https://customtypes.prismic.io/",
		PrismicUser: "https://user-service.prismic.io/",
		PrismicWroom: "https://prismic.io/",
		PrismicUnsplash: "https://unsplash.prismic.io",
		SliceMachineV1:
			"https://21vvgrh0s6.execute-api.us-east-1.amazonaws.com/v1/",
	});
	expect(result.clientError).toStrictEqual({
		message: "__stub__",
		name: "__stub__",
		reason: "__stub__",
		status: 401,
	});
	expect(result.libraries).toStrictEqual([]);
	expect(result.customTypes).toStrictEqual([]);
	expect(result.remoteCustomTypes).toStrictEqual([]);
	expect(result.remoteSlices).toStrictEqual([]);
});
