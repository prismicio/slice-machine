import { parseNr, parseNlx } from "@antfu/ni";
import { PackageManager } from "@prismicio/manager";

const resolveCommand = (
	command: string | { command: string; args: string[] } | undefined,
	fallback: string,
): string => {
	if (!command) {
		return fallback;
	}
	if (typeof command === "string") {
		return command;
	}

	return `${command.command} ${command.args.join(" ")}`;
};

export const getRunScriptCommand = async (args: {
	agent: PackageManager;
	script: string;
}): Promise<string> => {
	const command = await parseNr(args.agent, [args.script]);

	return resolveCommand(command, `npm run ${args.script}`);
};

export const getExecuteCommand = async (args: {
	agent: PackageManager;
	script: string;
}): Promise<string> => {
	const command = await parseNlx(args.agent, [args.script]);

	return resolveCommand(command, `npx ${args.script}`);
};
