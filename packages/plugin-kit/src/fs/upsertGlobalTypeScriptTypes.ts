import { detectTypesProvider, generateTypes } from "prismic-ts-codegen";

import { SliceMachineActions } from "../createSliceMachineActions";

import { writeProjectFile, WriteProjectFileArgs } from "./writeProjectFile";
import {
	GLOBAL_TYPESCRIPT_TYPES_FILENAME,
	NON_EDITABLE_FILE_BANNER,
} from "./constants";

/**
 * Arguments for `upsertGlobalContentTypes()`.
 */
export type UpsertGlobalTypeScriptTypesArgs = {
	filename?: string;
	actions: SliceMachineActions;
} & Omit<WriteProjectFileArgs, "filename" | "contents">;

/**
 * Creates a globally accessible TypeScript file containing types representing
 * the Prismic repository's content.
 *
 * @returns The file path to the written file.
 */
export const upsertGlobalTypeScriptTypes = async (
	args: UpsertGlobalTypeScriptTypesArgs,
): Promise<string> => {
	const project = await args.helpers.getProject();

	const [customTypeModelDescriptors, sharedSliceModelDescriptors] =
		await Promise.all([
			args.actions.readAllCustomTypeModels(),
			args.actions.readAllSliceModels(),
		]);

	const customTypeModels = customTypeModelDescriptors.map(
		(customTypeModelDescriptors) => {
			return customTypeModelDescriptors.model;
		},
	);
	const sharedSliceModels = sharedSliceModelDescriptors.map(
		(sharedSliceModelDescriptors) => {
			return sharedSliceModelDescriptors.model;
		},
	);

	let contents = generateTypes({
		customTypeModels,
		sharedSliceModels,
		clientIntegration: {
			includeCreateClientInterface: true,
			includeContentNamespace: true,
		},
		typesProvider: await detectTypesProvider({ cwd: project.root }),
	});

	contents = `${NON_EDITABLE_FILE_BANNER}\n\n${contents}`;

	return await writeProjectFile({
		...args,
		filename: args.filename || GLOBAL_TYPESCRIPT_TYPES_FILENAME,
		contents,
	});
};
