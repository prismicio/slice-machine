import type {
	SliceMachineActions,
	SliceMachineHelpers,
} from "@slicemachine/plugin-kit";
import { detectTypesProvider, generateTypes } from "prismic-ts-codegen";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { NON_EDITABLE_FILE_BANNER } from "./constants";

/**
 * Arguments for `upsertGlobalContentTypes()`.
 */
type UpsertGlobalTypeScriptTypesArgs = {
	filePath?: string;
	format?: boolean;
	actions: SliceMachineActions;
	helpers: SliceMachineHelpers;
};

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

	const filePath = args.helpers.joinPathFromRoot(
		args.filePath || "prismicio-types.d.ts",
	);

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

	if (args.format) {
		contents = await args.helpers.format(contents, filePath);
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, contents);

	return filePath;
};
