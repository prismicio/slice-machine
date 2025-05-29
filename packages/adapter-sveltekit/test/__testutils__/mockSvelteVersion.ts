import { HookCleanupCallback, vi } from "vitest";

export const mockSvelteVersion = (version: string): HookCleanupCallback => {
	vi.doMock("node:fs/promises", async () => {
		const actual: typeof import("node:fs/promises") =
			await vi.importActual("node:fs/promises");

		return {
			...actual,
			readFile: async (...args: Parameters<(typeof actual)["readFile"]>) => {
				if (args[0].toString().endsWith("/svelte/package.json")) {
					return JSON.stringify({ version });
				}

				return actual.readFile(...args);
			},
		};
	});

	return () => vi.doUnmock("node:fs/promises");
};
