import { parseNi, detect as niDetect } from "@antfu/ni";
import {
	ExecaChildProcess,
	execaCommand,
	Options as ExacaOptions,
} from "execa";

export type Agent = Exclude<Awaited<ReturnType<typeof niDetect>>, null>;

const EXTRA_AGENT_FLAGS: Record<Agent, string[]> = {
	npm: ["--color=always", "--loglevel=info"],
	pnpm: ["--color"], // TODO: Validate that flags are correct
	yarn: ["--color"],
	"yarn@berry": ["--color"], // TODO: Validate that flags are correct
	"pnpm@6": ["--color"], // TODO: Validate that flags are correct
	bun: ["--color"], // TODO: Validate that flags are correct
};

type InstallArgs = {
	agent: Agent;
	dependencies?: Record<string, string>;
	dev?: boolean;
	execa?: ExacaOptions;
};

export const install = async (
	args: InstallArgs
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

	// Fail hard if process fails
	execaProcess.catch((error) => {
		throw error;
	});

	return { execaProcess };
};

export const detect = (): Promise<Agent | null> => {
	// We auto install agent for now otherwise ni could cause some issues with prompt
	return niDetect({ autoInstall: true });
};
