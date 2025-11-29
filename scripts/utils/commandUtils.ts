import { spawn, spawnSync } from "node:child_process";
import chalk from "chalk";

export class CommandError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export function handleUncaughtException(error: Error): void {
	if (error instanceof CommandError) {
		console.error(chalk.red(error.message));
		process.exitCode = 2;
	} else {
		console.error(error);
		process.exitCode = 1;
	}
}

interface ExecOptions {
	dryRun?: boolean;
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	stdio?: "inherit" | "pipe" | "ignore";
}

interface ExecResult {
	stdout: string;
	stderr: string;
	exitCode: number;
}

export async function exec(
	file: string,
	args: string[] = [],
	options: ExecOptions = {},
): Promise<ExecResult | void> {
	const { dryRun, ...spawnOptions } = options;
	if (dryRun === true) {
		console.log(chalk.blue(escapeCommand(file, args)));
		return;
	}

	return new Promise((resolve, reject) => {
		const child = spawn(file, args, {
			...spawnOptions,
			stdio: spawnOptions.stdio ?? "pipe",
		});

		let stdout = "";
		let stderr = "";

		if (child.stdout) {
			child.stdout.on("data", (data) => {
				stdout += data.toString();
			});
		}

		if (child.stderr) {
			child.stderr.on("data", (data) => {
				stderr += data.toString();
			});
		}

		child.on("error", (error) => {
			reject(error);
		});

		child.on("close", (exitCode) => {
			const result = {
				stdout: stdout.trim(),
				stderr: stderr.trim(),
				exitCode: exitCode ?? 0,
			};

			if (exitCode === 0) {
				resolve(result);
			} else {
				const error = new Error(
					`Command failed with exit code ${exitCode}: ${escapeCommand(file, args)}`,
				) as Error & { exitCode: number; stdout: string; stderr: string };
				error.exitCode = exitCode ?? 1;
				error.stdout = result.stdout;
				error.stderr = result.stderr;
				reject(error);
			}
		});
	});
}

export function execSync(
	file: string,
	args: string[] = [],
	options: ExecOptions = {},
): ExecResult | void {
	const { dryRun, ...spawnOptions } = options;
	if (dryRun === true) {
		console.log(chalk.blue(escapeCommand(file, args)));
		return;
	}

	const result = spawnSync(file, args, {
		...spawnOptions,
		stdio: spawnOptions.stdio ?? "pipe",
		encoding: "utf8",
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		const error = new Error(
			`Command failed with exit code ${result.status}: ${escapeCommand(file, args)}`,
		) as Error & { exitCode: number; stdout: string; stderr: string };
		error.exitCode = result.status ?? 1;
		error.stdout = (result.stdout?.toString() ?? "").trim();
		error.stderr = (result.stderr?.toString() ?? "").trim();
		throw error;
	}

	return {
		stdout: (result.stdout?.toString() ?? "").trim(),
		stderr: (result.stderr?.toString() ?? "").trim(),
		exitCode: result.status ?? 0,
	};
}

// Adapted from: https://github.com/sindresorhus/execa/blob/ec380db676f8380320b5c41eb444135220e241ca/lib/command.js#L24.
function escapeCommand(file: string, args: string[] = []): string {
	return [file, ...args].map(escapeArg).join(" ");
}

// Adapted from: https://github.com/sindresorhus/execa/blob/ec380db676f8380320b5c41eb444135220e241ca/lib/command.js#L12-L20.
function escapeArg(arg: string): string {
	return /^[\w-.]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '\\"')}"`;
}
