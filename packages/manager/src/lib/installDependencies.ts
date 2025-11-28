import { parseNi } from "@antfu/ni";
import {
	ExecaChildProcess,
	execaCommand,
	Options as ExacaOptions,
} from "execa";

import { PackageManager } from "../types";

const EXTRA_INSTALL_FLAGS: Record<PackageManager, string[]> = {
	npm: ["--color=always", "--loglevel=info"],
	pnpm: [],
	yarn: [],
	"yarn@berry": [],
	"pnpm@6": [],
	bun: [],
};

type InstallDependenciesArgs = {
	packageManager: PackageManager;
	dependencies: Record<string, string>;
	dev?: boolean;
	execa?: ExacaOptions;
};

type InstallDependenciesReturnType = {
	execaProcess: ExecaChildProcess;
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

	const command = await parseNi(args.packageManager, commandArgs);

	if (!command) {
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

	const execaProcess = execaCommand(command, {
		encoding: "utf-8",
		...args.execa,
	});

	return {
		execaProcess,
	};
};
