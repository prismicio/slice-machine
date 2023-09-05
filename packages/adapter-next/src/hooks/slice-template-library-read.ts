import fs from "node:fs";
import path from "node:path";

import type {
	SliceTemplateLibraryReadHook,
	SliceTemplateLibraryReadHookData,
} from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";

import * as CallToAction from "../sliceTemplates/CallToAction";

const initialTemplates = [CallToAction];

export const sliceTemplateLibraryRead: SliceTemplateLibraryReadHook<
	PluginOptions
> = async ({
	templateIds,
	isTypeScriptProject,
}: SliceTemplateLibraryReadHookData) => {
	const templates =
		templateIds && templateIds.length
			? initialTemplates.filter((t) => templateIds?.includes(t.model.id))
			: initialTemplates;

	return {
		templates: templates.map((t) => {
			const { mocks, model, createComponentContents, screenshotPaths } = t;

			return {
				mocks,
				model,
				componentContents: createComponentContents(isTypeScriptProject),
				screenshots: Object.entries(screenshotPaths).reduce(
					(acc, curr) => ({
						...acc,
						[curr[0]]: fs.readFileSync(
							path.join(globalThis.__dirname, curr[1]),
						),
					}),
					{},
				),
			};
		}),
	};
};
