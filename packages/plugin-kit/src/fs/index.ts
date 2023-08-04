///////////////////////////////////////////////////////////////////////////////
//
// Project helpers
//
///////////////////////////////////////////////////////////////////////////////

export { checkIsTypeScriptProject } from "./checkIsTypeScriptProject";

export { upsertGlobalTypeScriptTypes } from "./upsertGlobalTypeScriptTypes";
export type { UpsertGlobalTypeScriptTypesArgs } from "./upsertGlobalTypeScriptTypes";

export { checkHasProjectFile } from "./checkHasProjectFile";
export type { CheckHasProjectFileArgs } from "./checkHasProjectFile";

export { writeProjectFile } from "./writeProjectFile";
export type { WriteProjectFileArgs } from "./writeProjectFile";

export { readProjectFile } from "./readProjectFile";
export type { ReadProjectFileArgs } from "./readProjectFile";

export { deleteProjectFile } from "./deleteProjectFile";
export type { DeleteProjectFileArgs } from "./deleteProjectFile";

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

export { readSliceLibrary } from "./readSliceLibrary";
export type {
	ReadSliceLibraryArgs,
	ReadSliceLibraryReturnType,
} from "./readSliceLibrary";

export { writeSliceFile } from "./writeSliceFile";
export type { WriteSliceFileArgs } from "./writeSliceFile";

export { writeSliceModel } from "./writeSliceModel";
export type { WriteSliceModelArgs } from "./writeSliceModel";

export { readSliceFile } from "./readSliceFile";
export type { ReadSliceFileArgs } from "./readSliceFile";

export { readSliceModel } from "./readSliceModel";
export type {
	ReadSliceModelArgs,
	ReadSliceModelReturnType,
} from "./readSliceModel";

export { renameSlice } from "./renameSlice";
export type { RenameSliceArgs } from "./renameSlice";

export { deleteSliceFile } from "./deleteSliceFile";
export type { DeleteSliceFileArgs } from "./deleteSliceFile";

export { deleteSliceDirectory } from "./deleteSliceDirectory";
export type { DeleteSliceDirectoryArgs } from "./deleteSliceDirectory";

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

export { readCustomTypeLibrary } from "./readCustomTypeLibrary";
export type {
	ReadCustomTypeLibraryArgs,
	ReadCustomTypeLibraryReturnType,
} from "./readCustomTypeLibrary";

export { writeCustomTypeFile } from "./writeCustomTypeFile";
export type { WriteCustomTypeFileArgs } from "./writeCustomTypeFile";

export { writeCustomTypeModel } from "./writeCustomTypeModel";
export type { WriteCustomTypeModelArgs } from "./writeCustomTypeModel";

export { readCustomTypeFile } from "./readCustomTypeFile";
export type { ReadCustomTypeFileArgs } from "./readCustomTypeFile";

export { readCustomTypeModel } from "./readCustomTypeModel";
export type {
	ReadCustomTypeModelArgs,
	ReadCustomTypeModelReturnType,
} from "./readCustomTypeModel";

export { renameCustomType } from "./renameCustomType";
export type { RenameCustomTypeArgs } from "./renameCustomType";

export { deleteCustomTypeFile } from "./deleteCustomTypeFile";
export type { DeleteCustomTypeFileArgs } from "./deleteCustomTypeFile";

export { deleteCustomTypeDirectory } from "./deleteCustomTypeDirectory";
export type { DeleteCustomTypeDirectoryArgs } from "./deleteCustomTypeDirectory";
