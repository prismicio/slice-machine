import type { SliceMachineContext } from "@slicemachine/plugin-kit";
import { generateTypes } from "prismic-ts-codegen";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import type { PluginOptions } from "../types";
import { NON_EDITABLE_FILE_BANNER } from "../constants";

/**
 * Arguments for `upsertGlobalContentTypes()`.
 */
type UpsertGlobalTypesArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"actions" | "helpers" | "options"
>;

/**
 * Creates a globally accessible TypeScript file containing types representing
 * the Prismic repository's content.
 */
export const upsertGlobalContentTypes = async ({
	actions,
	helpers,
	options,
}: UpsertGlobalTypesArgs): Promise<void> => {
	const filePath = helpers.joinPathFromRoot("prismicio.d.ts");

	const [customTypeModelDescriptors, sharedSliceModelDescriptors] =
		await Promise.all([
			actions.readAllCustomTypeModels(),
			actions.readAllSliceModels(),
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
	});

	contents = `${NON_EDITABLE_FILE_BANNER}\n\n${contents}`;

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, contents);
};
