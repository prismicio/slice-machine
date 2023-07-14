///////////////////////////////////////////////////////////////////////////////
//
// Project helpers
//
///////////////////////////////////////////////////////////////////////////////

export { checkIsTypeScriptProject } from "./checkIsTypeScriptProject";

///////////////////////////////////////////////////////////////////////////////
//
// Slice helpers
//
///////////////////////////////////////////////////////////////////////////////

export { buildSliceDirectoryPath } from "./buildSliceDirectoryPath";
export type { BuildSliceDirectoryPathArgs } from "./buildSliceDirectoryPath";

export { buildSliceFilePath } from "./buildSliceFilePath";
export type { BuildSliceFilePathArgs } from "./buildSliceFilePath";

export { buildSliceLibraryDirectoryPath } from "./buildSliceLibraryDirectoryPath";
export type { BuildSliceLibraryDirectoryPathArgs } from "./buildSliceLibraryDirectoryPath";

export { writeSliceFile } from "./writeSliceFile";
export type { WriteSliceFileArgs } from "./writeSliceFile";

export { readSliceModel } from "./readSliceModel";
export type {
	ReadSliceModelArgs,
	ReadSliceModelReturnType,
} from "./readSliceModel";

export { deleteAllSliceFiles } from "./deleteAllSliceFiles";
export type { DeleteAllSliceFilesArgs } from "./deleteAllSliceFiles";

///////////////////////////////////////////////////////////////////////////////
//
// Custom type helpers
//
///////////////////////////////////////////////////////////////////////////////

export { buildCustomTypeDirectoryPath } from "./buildCustomTypeDirectoryPath";
export type { BuildCustomTypeDirectoryPathArgs } from "./buildCustomTypeDirectoryPath";

export { buildCustomTypeFilePath } from "./buildCustomTypeFilePath";
export type { BuildCustomTypeFilePathArgs } from "./buildCustomTypeFilePath";

export { buildCustomTypeLibraryDirectoryPath } from "./buildCustomTypeLibraryDirectoryPath";
export type { BuildCustomTypeLibraryDirectoryPathArgs } from "./buildCustomTypeLibraryDirectoryPath";

export { writeCustomTypeFile } from "./writeCustomTypeFile";
export type { WriteCustomTypeFileArgs } from "./writeCustomTypeFile";

export { writeCustomTypeModel } from "./writeCustomTypeModel";
export type { WriteCustomTypeModelArgs } from "./writeCustomTypeModel";

export { readCustomTypeModel } from "./readCustomTypeModel";
export type {
	ReadCustomTypeModelArgs,
	ReadCustomTypeModelReturnType,
} from "./readCustomTypeModel";
