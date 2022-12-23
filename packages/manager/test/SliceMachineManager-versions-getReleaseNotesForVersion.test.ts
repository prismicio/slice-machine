import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";
import { mockGitHubReleasesAPI } from "./__testutils__/mockGitHubReleasesAPI";

it("returns release notes from GitHub for a given version", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockGitHubReleasesAPI(ctx, {
		repositoryName: "slice-machine",
		repositoryOwner: "prismicio",
		batchEndpoint: {
			releases: [
				{ name: "0.1.0", body: "notes for 0.1.0" },
				{ name: "0.2.0", body: "notes for 0.2.0" },
			],
		},
	});

	const res = await manager.versions.getReleaseNotesForVersion({
		version: "0.1.0",
	});

	expect(res).toStrictEqual("notes for 0.1.0");
});

it("returns undefined if the release does not exist", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockGitHubReleasesAPI(ctx, {
		repositoryName: "slice-machine",
		repositoryOwner: "prismicio",
		batchEndpoint: {
			releases: [],
		},
		individualEndpoint: {
			releases: [],
		},
	});

	const res = await manager.versions.getReleaseNotesForVersion({
		version: "0.1.0",
	});

	expect(res).toBe(undefined);
});

it("returns undefined if the release does not have notes", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockGitHubReleasesAPI(ctx, {
		repositoryName: "slice-machine",
		repositoryOwner: "prismicio",
		batchEndpoint: {
			releases: [{ name: "0.1.0", body: null }],
		},
	});

	const res = await manager.versions.getReleaseNotesForVersion({
		version: "0.1.0",
	});

	expect(res).toBe(undefined);
});

it("uses cached release notes to minimize network requests", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockGitHubReleasesAPI(ctx, {
		repositoryName: "slice-machine",
		repositoryOwner: "prismicio",
		batchEndpoint: {
			releases: [
				{ name: "0.1.0", body: "notes for 0.1.0" },
				{ name: "0.2.0", body: "notes for 0.2.0" },
			],
		},
	});

	let gitHubAPICallsCount = 0;
	ctx.msw.events.on("request:match", (req) => {
		if (
			req.url.toString() ===
			"https://api.github.com/repos/prismicio/slice-machine/releases"
		) {
			gitHubAPICallsCount++;
		}
	});

	await manager.versions.getReleaseNotesForVersion({
		version: "0.1.0",
	});
	const res = await manager.versions.getReleaseNotesForVersion({
		version: "0.2.0",
	});

	expect(res).toStrictEqual("notes for 0.2.0");
	expect(gitHubAPICallsCount).toBe(1);
});

it("requests individual versions if not included in the initial batch request", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockGitHubReleasesAPI(ctx, {
		repositoryName: "slice-machine",
		repositoryOwner: "prismicio",
		batchEndpoint: {
			releases: [
				{ name: "0.1.0", body: "notes for 0.1.0" },
				{ name: "0.2.0", body: "notes for 0.2.0" },
			],
		},
		individualEndpoint: {
			releases: [
				{
					packageName: "slice-machine-ui",
					tag: "0.3.0",
					release: { name: "0.3.0", body: "notes for 0.3.0" },
				},
			],
		},
	});

	const res = await manager.versions.getReleaseNotesForVersion({
		version: "0.3.0",
	});

	expect(res).toStrictEqual("notes for 0.3.0");
});
