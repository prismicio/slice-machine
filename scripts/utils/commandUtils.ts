import chalk from "chalk";
import {
  execa,
  type ExecaChildProcess,
  type Options as ExecaOptions,
  type ExecaReturnValue,
} from "execa";

export class CommandError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function handleUncaughtException(error: Error): void {
  if (error instanceof CommandError) {
    console.error(chalk.stderr.red(error.message));
    process.exitCode = 2;
  } else {
    console.error(error);
    process.exitCode = 1;
  }
}

export function exec(
  file: string,
  args?: string[],
  options?: ExecaOptions & { dryRun?: false },
): ExecaChildProcess;
export async function exec(
  file: string,
  args?: string[],
  options?: ExecaOptions & { dryRun?: true },
): Promise<void>;
export async function exec(
  file: string,
  args?: string[],
  options?: ExecaOptions & { dryRun?: boolean },
): Promise<ExecaReturnValue | void>;
export async function exec(
  file: string,
  args?: string[],
  options: ExecaOptions & { dryRun?: boolean } = {},
): Promise<ExecaReturnValue | void> {
  const { dryRun, ...execaOptions } = options;
  if (dryRun === true) {
    console.log(chalk.blue(escapeCommand(file, args)));
  } else {
    return await execa(file, args, execaOptions);
  }
}

// Adapted from: https://github.com/sindresorhus/execa/blob/ec380db676f8380320b5c41eb444135220e241ca/lib/command.js#L24.
function escapeCommand(file: string, args: string[] = []): string {
  return [file, ...args].map(escapeArg).join(" ");
}

// Adapted from: https://github.com/sindresorhus/execa/blob/ec380db676f8380320b5c41eb444135220e241ca/lib/command.js#L12-L20.
function escapeArg(arg: string): string {
  return /^[\w-.]+$/.test(arg) ? arg : `"${arg.replace(/"/g, '\\"')}"`;
}
