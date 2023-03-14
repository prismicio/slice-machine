import { parseNix } from "@antfu/ni";
import { PackageManager } from "@slicemachine/manager";

export const getExecuteCommand = async (args: {
	agent: PackageManager;
	script: string;
}): Promise<string> => {
	return (await parseNix(args.agent, [args.script])) || `npx ${args.script}`;
};
