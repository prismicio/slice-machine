import type {
	SliceTemplateLibraryReadHook,
	SliceTemplateLibraryReadHookData,
} from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";

import * as CallToAction from "../sliceTemplates/CallToAction";
import { checkIsTypeScriptProject } from "@slicemachine/plugin-kit/fs";

const initialTemplates = [CallToAction];

export const sliceTemplateLibraryRead: SliceTemplateLibraryReadHook<
	PluginOptions
> = async (args: SliceTemplateLibraryReadHookData, { helpers }) => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
	});

	const templates =
		args.templateIds && args.templateIds.length
			? initialTemplates.filter((t) => args.templateIds?.includes(t.model.id))
			: initialTemplates;

	return {
		templates: templates.map((t) => ({
			...t,
			componentContents: t.createComponentContents(isTypeScriptProject),
			createComponentContents: undefined,
		})),
	};
};
