import { SliceMachineHelpers } from "@slicemachine/plugin-kit";

export type BuildSliceLibraryDirectoryPathArgs = {
	libraryID: string;
	helpers: SliceMachineHelpers;
};

export function buildSliceLibraryDirectoryPath(
	args: BuildSliceLibraryDirectoryPathArgs,
): string {
	return args.helpers.joinPathFromRoot(args.libraryID);
}
