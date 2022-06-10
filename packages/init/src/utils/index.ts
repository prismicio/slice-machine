import { ApplicationMode } from "@slicemachine/client";
import util from "util";
import { exec } from "child_process";
export * as logs from "./logs";
export { Auth } from "./auth";
export * from "./client";

export function findArgument(args: string[], name: string): string | undefined {
  const flagIndex: number = args.indexOf(`--${name}`);

  if (flagIndex === -1) return;
  if (args.length < flagIndex + 2) return;

  const flagValue = args[flagIndex + 1];

  if (flagValue.startsWith("--")) return;
  return flagValue;
}

export const execCommand: (
  command: string
) => Promise<{ stderr: string; stdout: string }> = util.promisify(exec);

export function getApplicationMode(
  argumentValue: string | undefined
): ApplicationMode | null {
  switch (argumentValue) {
    case ApplicationMode.PROD:
    case ApplicationMode.STAGE:
    case ApplicationMode.DEV:
      return argumentValue;
    default:
      return null;
  }
}
