import {
	writeCustomTypeModel,
	WriteCustomTypeModelArgs,
} from "./writeCustomTypeModel";

export type RenameCustomTypeArgs = WriteCustomTypeModelArgs;

export const renameCustomType = async (
	args: RenameCustomTypeArgs,
): Promise<void> => {
	await writeCustomTypeModel(args);
};
