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
	console.log("THIS IS NOT CALLED");
	return {
		templates: [{ model: {}, mocks: "", componentContents: "hi!"}]
	}
	const templates =
		templateIds && templateIds.length
			? initialTemplates.filter((t) => templateIds?.includes(t.model.id))
			: initialTemplates;

	return {
		templates: templates.map((t) => ({
			...t,
			componentContents: t.createComponentContents(isTypeScriptProject),
			createComponentContents: undefined,
		})),
	};
};
