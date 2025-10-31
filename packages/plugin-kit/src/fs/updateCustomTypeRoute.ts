import {
	writeCustomTypeModel,
	WriteCustomTypeModelArgs,
} from "./writeCustomTypeModel";

export type UpdateCustomTypeRouteArgs = WriteCustomTypeModelArgs;

export const updateCustomTypeRoute = async (
	args: UpdateCustomTypeRouteArgs,
): Promise<void> => {
	await writeCustomTypeModel(args);
};
