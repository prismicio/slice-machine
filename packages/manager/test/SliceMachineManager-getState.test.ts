import { it, expect } from "vitest";
import { createSliceMachineManager } from "../src";
import { createTestProject } from "./__testutils__/createTestProject";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

it("returns global Slice Machine state", async (ctx) => {
	const adapter = await createTestPlugin();
	const cwd = await createTestProject({ adapter });
	mockPrismicUserAPI(ctx);
	const manager = createSliceMachineManager({
		cwd,
		nativePlugins: {
			[adapter.meta.name]: adapter,
		},
	});
	await manager.plugins.initPlugins();
	const result = await manager.getState();

	expect(result.env.endpoints).toMatchInlineSnapshot(`
		{
		  "AwsAclProvider": "https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
		  "Oembed": "https://oembed.prismic.io/",
		  "PrismicAuthentication": "https://auth.prismic.io/",
		  "PrismicModels": "https://customtypes.prismic.io/",
		  "PrismicUser": "https://user.internal-prismic.io/",
		  "PrismicWroom": "https://prismic.io/",
		  "Unsplash": "https://unsplash.prismic.io/",
		}
	`);
	expect(result.clientError).toMatchInlineSnapshot(`
		{
		  "message": "__stub__",
		  "name": "__stub__",
		  "reason": "__stub__",
		  "status": 401,
		}
	`);
	expect(result.libraries).toStrictEqual([]);
	expect(result.customTypes).toStrictEqual([]);
	expect(result.remoteCustomTypes).toStrictEqual([]);
	expect(result.remoteSlices).toStrictEqual([]);
});
