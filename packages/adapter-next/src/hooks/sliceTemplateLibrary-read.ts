import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { SliceTemplateLibraryReadHook } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";

import * as CallToAction from "../sliceTemplates/CallToAction";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";

const initialTemplates = [CallToAction];

export const sliceTemplateLibraryRead: SliceTemplateLibraryReadHook<
	PluginOptions
> = async ({ templateIDs }, { helpers, options }) => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});
	const templates =
		templateIDs && templateIDs.length
			? initialTemplates.filter((t) => templateIDs?.includes(t.model.id))
			: initialTemplates;

	const templatesPromises = templates.map(async (t) => {
		const { mocks, model, createComponentContents, screenshotPaths } = t;

		const screenshotEntries = Object.entries(screenshotPaths);
		const screenshotPromises = screenshotEntries.map(([key, filePath]) => {
			return fs
				.readFile(
					fileURLToPath(new URL(path.join("..", filePath), import.meta.url)),
				)
				.then((data) => [key, data]);
		});
		const readScreenshots = await Promise.all(screenshotPromises);
		const screenshots = Object.fromEntries(readScreenshots);

		return {
			mocks,
			model,
			componentContents: createComponentContents(isTypeScriptProject),
			screenshots,
		};
	});

	const resolvedTemplates = await Promise.all(templatesPromises);

	return {
		templates: resolvedTemplates,
	};
};
