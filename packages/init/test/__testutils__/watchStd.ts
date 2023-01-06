import { Console } from "node:console";
import { hookStdout } from "hook-std";
import { hookStderr } from "hook-std";

export const watchStd = async (
	fn: () => void | Promise<void>,
): Promise<{ stdout: string[]; stderr: string[] }> => {
	const originalConsole = globalThis.console;

	// Hijack Vitest console spy, see: https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/runtime/setup.ts#L151-L156
	globalThis.console = new Console({
		stdout: process.stdout,
		stderr: process.stderr,
		colorMode: true,
		groupIndentation: 2,
	});

	const stdout: string[] = [];
	const stdoutHook = hookStdout((output) => {
		stdout.push(output);
	});

	const stderr: string[] = [];
	const stderrHook = hookStderr((output) => {
		stderr.push(output);
	});

	try {
		await fn();
	} catch (error) {
		stdoutHook.unhook();
		stderrHook.unhook();

		throw error;
	}

	stdoutHook.unhook();
	stderrHook.unhook();

	globalThis.console = originalConsole;

	return {
		stdout,
		stderr,
	};
};
