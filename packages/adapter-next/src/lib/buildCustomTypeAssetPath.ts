import { SliceMachineContext } from "@slicemachine/plugin-kit";
import * as path from "node:path";

import { PluginOptions } from "../types";

import { buildCustomTypeDirectoryPath } from "./buildCustomTypeDirectoryPath";

type BuildCustomTypeAssetPathArgs = {
	customTypeID: string;
	assetID: string;
	helpers: SliceMachineContext<PluginOptions>["helpers"];
};

export const buildCustomTypeAssetPath = (
	args: BuildCustomTypeAssetPathArgs,
): string => {
	return path.join(
		buildCustomTypeDirectoryPath({
			customTypeID: args.customTypeID,
			helpers: args.helpers,
		}),
		args.assetID,
	);
};
