import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import type { SliceTemplateLibraryReadHook } from "@slicemachine/plugin-kit";

import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";

import * as CallToAction from "../sliceTemplates/CallToAction";
import * as AlternateGrid from "../sliceTemplates/AlternateGrid";

import type { PluginOptions } from "../types";

const initialTemplates = [CallToAction, AlternateGrid];

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
			createComponentContents: (model: SharedSlice) =>
				createComponentContents(model, isTypeScriptProject),
			screenshots,
		};
	});

	const resolvedTemplates = await Promise.all(templatesPromises);

	return {
		templates: resolvedTemplates,
	};
};
