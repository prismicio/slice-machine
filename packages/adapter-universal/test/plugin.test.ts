import { test, expect } from "vitest";
import { createSliceMachinePluginRunner } from "@slicemachine/plugin-kit";

import adapter from "../src";

test("throws an error on setup", async (ctx) => {
	// @ts-expect-error - Fix this error when you have time.
	ctx.project.config.adapter = adapter;

	ctx.pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });

	await expect(async () => {
		await ctx.pluginRunner.init();
	}).rejects.toThrow(/cannot be used as an adapter/);
});
