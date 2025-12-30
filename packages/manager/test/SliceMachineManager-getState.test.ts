import { it, expect } from "vitest";
import { UnauthenticatedError, createSliceMachineManager } from "../src";
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
		AwsAclProvider: "https://acl-provider.prismic.io/",
		PrismicEmbed: "https://oembed.prismic.io",
		PrismicAuthentication: "https://auth.prismic.io/",
		PrismicModels: "https://customtypes.prismic.io/",
		PrismicUser: "https://user-service.prismic.io/",
		PrismicWroom: "https://prismic.io/",
		PrismicUnsplash: "https://unsplash.prismic.io/",
		SliceMachineV1: "https://sm-api.prismic.io/v1/",
		RepositoryService: "https://api.internal.prismic.io/repository/",
		LocaleService: "https://api.internal.prismic.io/locale/",
		CustomTypeService: "https://api.internal.prismic.io/custom-type/",
		GitService: "https://api.internal.prismic.io/git/",
	});
	expect(result.clientError).toStrictEqual({
		name: new UnauthenticatedError().name,
		message: "__stub__",
		reason: "__stub__",
		status: 401,
	});
	expect(result.libraries).toStrictEqual([]);
	expect(result.customTypes).toStrictEqual([]);
	expect(result.remoteCustomTypes).toStrictEqual([]);
	expect(result.remoteSlices).toStrictEqual([]);
});
