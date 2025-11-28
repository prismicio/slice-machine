import { parseNr, parseNix } from "@antfu/ni";
import { PackageManager } from "@prismicio/manager";

export const getRunScriptCommand = async (args: {
	agent: PackageManager;
	script: string;
}): Promise<string> => {
	return (await parseNr(args.agent, [args.script])) || `npm run ${args.script}`;
};

export const getExecuteCommand = async (args: {
	agent: PackageManager;
	script: string;
}): Promise<string> => {
	return (await parseNix(args.agent, [args.script])) || `npx ${args.script}`;
};
