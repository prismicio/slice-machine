import { SliceMachineHelpers } from "@slicemachine/plugin-kit";

export type BuildCustomTypeLibraryDirectoryPathArgs = {
	helpers: SliceMachineHelpers;
};

export const buildCustomTypeLibraryDirectoryPath = (
	args: BuildCustomTypeLibraryDirectoryPathArgs,
): string => {
	return args.helpers.joinPathFromRoot("customtypes");
};
