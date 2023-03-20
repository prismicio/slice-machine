import { parseNr } from "@antfu/ni";
import { PackageManager } from "@slicemachine/manager";

export const getRunScriptCommand = async (args: {
	agent: PackageManager;
	script: string;
}): Promise<string> => {
	return (await parseNr(args.agent, [args.script])) || `npm run ${args.script}`;
};
