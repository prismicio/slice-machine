import path from "node:path";

import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";
import { SliceTemplateLibraryReadHookReturnType } from "../hooks/sliceTemplateLibrary-read";

import { checkIsTypeScriptProject } from "./checkIsTypeScriptProject";

import * as fs from "./lib/fsLimit";

export type ReadSliceTemplateLibraryArgs = {
	helpers: SliceMachineHelpers;
	dirName: string;
	templateIDs?: string[];
	templates: {
		mocks: SharedSliceContent[];
		screenshotPaths: Record<string, string>;
		model: SharedSlice;
	}[];
	componentFileNames: {
		js: string;
		ts: string;
	};
};

export const readSliceTemplateLibrary = async (
	args: ReadSliceTemplateLibraryArgs,
): Promise<SliceTemplateLibraryReadHookReturnType> => {
	const isTypeScriptProject = await checkIsTypeScriptProject(args);

	const {
		templateIDs,
		templates: initialTemplates,
		dirName,
		componentFileNames,
	} = args;

	const templates =
		templateIDs && templateIDs.length
			? initialTemplates.filter((t) => templateIDs?.includes(t.model.id))
			: initialTemplates;

	const templatesPromises = templates.map(async (t) => {
		const { mocks, model, screenshotPaths } = t;

		const screenshotEntries = Object.entries(screenshotPaths);
		const screenshotPromises = screenshotEntries.map(([key, filePath]) => {
			return fs
				.readFile(path.join(dirName, filePath))
				.then((data) => [key, data]);
		});
		const readScreenshots = await Promise.all(screenshotPromises);
		const screenshots = Object.fromEntries(readScreenshots);

		const fileName = isTypeScriptProject
			? componentFileNames.ts
			: componentFileNames.js;

		const componentContentsTemplate = await fs.readFile(
			path.join(dirName, model.name, fileName),
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
