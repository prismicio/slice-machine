import { parseNi, detect as niDetect } from "@antfu/ni";
import {
	ExecaChildProcess,
	execaCommand,
	Options as ExacaOptions,
} from "execa";

export type PackageManagerAgent = Exclude<
	Awaited<ReturnType<typeof niDetect>>,
	null
>;

const EXTRA_AGENT_FLAGS: Record<PackageManagerAgent, string[]> = {
	npm: ["--color=always", "--loglevel=info"],
	pnpm: ["--color"], // TODO: Validate that flags are correct
	yarn: ["--color"],
	"yarn@berry": ["--color"], // TODO: Validate that flags are correct
	"pnpm@6": ["--color"], // TODO: Validate that flags are correct
	bun: ["--color"], // TODO: Validate that flags are correct
};

type InstallDependenciesArgs = {
	agent: PackageManagerAgent;
	dependencies?: Record<string, string>;
	dev?: boolean;
	execa?: ExacaOptions;
};

export const installDependencies = async (
	args: InstallDependenciesArgs
): Promise<{ execaProcess: ExecaChildProcess }> => {
	const commandArgs = args.dependencies
		? Object.entries(args.dependencies).map(([pkg, range]) => `${pkg}@${range}`)
		: [];

	if (commandArgs.length && args.dev) {
		commandArgs.unshift("-D");
	}

	commandArgs.push(...EXTRA_AGENT_FLAGS[args.agent]);

	const command = await parseNi(args.agent, commandArgs);

	if (!command) {
		throw new Error(
			"Failed to begin dependency installation (could not parse command)"
		);
	}

	const execaProcess = execaCommand(command, {
		encoding: "utf-8",
		...args.execa,
	});

	return { execaProcess };
};

export const detectPackageManager = async (): Promise<PackageManagerAgent> => {
	// We auto install agent for now otherwise ni could cause some issues with prompt
	const agent = await niDetect({ autoInstall: true });

	if (!agent) {
		throw new Error("Failed to detect project's framework");
	}

	return agent;
};
