import { parseNi } from "@antfu/ni";
import { execaCommand, type ResultPromise, type Options } from "execa";

import { PackageManager } from "../types";

const EXTRA_INSTALL_FLAGS: Record<PackageManager, string[]> = {
	npm: ["--color=always", "--loglevel=info"],
	pnpm: [],
	yarn: [],
	"yarn@berry": [],
	"pnpm@6": [],
	bun: [],
	deno: [],
};

type InstallDependenciesArgs = {
	packageManager: PackageManager;
	dependencies: Record<string, string>;
	dev?: boolean;
	execa?: Options;
};

type InstallDependenciesReturnType = {
	execaProcess: ResultPromise;
};

const resolveCommand = (
	command: string | { command: string; args: string[] },
): string => {
	if (typeof command === "string") {
		return command;
	}

	return [command.command, ...command.args].join(" ");
};

export const installDependencies = async (
	args: InstallDependenciesArgs,
): Promise<InstallDependenciesReturnType> => {
	const commandArgs = Object.entries(args.dependencies).map(
		([pkg, range]) => `${pkg}@${range}`,
	);

	if (commandArgs.length && args.dev) {
		commandArgs.unshift("-D");
	}

	commandArgs.push(...EXTRA_INSTALL_FLAGS[args.packageManager]);

	const parsedCommand = await parseNi(args.packageManager, commandArgs);

	if (!parsedCommand) {
		throw new Error(
			"Failed to begin dependency installation (could not parse command)",
			{
				cause: {
					packageManager: args.packageManager,
					dependencies: args.dependencies,
				},
			},
		);
	}

	const command = resolveCommand(parsedCommand);

	const execaProcess = execaCommand(command, {
		encoding: "utf8",
		...args.execa,
	});

	return {
		execaProcess,
	};
};
