import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import path from "node:path";

export type BuildSliceLibraryDirectoryPathArgs = {
	libraryID: string;
	absolute?: boolean;
	helpers: SliceMachineHelpers;
};

export function buildSliceLibraryDirectoryPath(
	args: BuildSliceLibraryDirectoryPathArgs,
): string {
	return args.absolute
		? args.helpers.joinPathFromRoot(args.libraryID)
		: path.join(args.libraryID);
}
