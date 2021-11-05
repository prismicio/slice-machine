import util from "util";
import { exec } from "child_process";

export function findArgument(args: string[], name: string): string | null {
  const flagIndex: number = args.indexOf(`--${name}`);

  if (flagIndex === -1) return null;
  if (args.length < flagIndex + 2) return null;

  const flagValue = args[flagIndex + 1];

  if (flagValue.startsWith("--")) return null;
  return flagValue;
}

export const execCommand: (
  command: string
) => Promise<{ stderr: string; stdout: string }> = util.promisify(exec);
