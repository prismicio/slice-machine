import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { SliceTemplateLibraryReadHook } from "@slicemachine/plugin-kit";

import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";

import * as Hero from "../sliceTemplates/Hero";
import * as CallToAction from "../sliceTemplates/CallToAction";
import * as AlternateGrid from "../sliceTemplates/AlternateGrid";
import * as CustomerLogos from "../sliceTemplates/CustomerLogos";

import type { PluginOptions } from "../types";

const initialTemplates = [Hero, CallToAction, AlternateGrid, CustomerLogos];

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
		const { mocks, model, screenshotPaths } = t;

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

		const fileName = isTypeScriptProject ? "typescript.tsx" : "javascript.jsx";

		// import fileNames object from templates if ever needed
		const componentContentsTemplate = await fs.readFile(
			fileURLToPath(
				new URL(path.join("..", model.name, fileName), import.meta.url),
			),
			"utf-8",
		);

		return {
			mocks,
			model,
			componentContentsTemplate,
			screenshots,
		};
	});

	const resolvedTemplates = await Promise.all(templatesPromises);

	return {
		templates: resolvedTemplates,
	};
};
