import { parseNx } from "@antfu/ni";
import { PackageManager } from "@slicemachine/manager";

export const getExecuteCommand = async (args: {
	agent: PackageManager;
	script: string;
}): Promise<string> => {
	return (await parseNx(args.agent, [args.script])) || `npx ${args.script}`;
};
