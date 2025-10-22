import { vi } from "vitest";
import * as path from "node:path";

export const mockNextJSVersion = (version: string) => {
	vi.doMock("node:fs/promises", async () => {
		const actual: typeof import("node:fs/promises") =
			await vi.importActual("node:fs/promises");

		return {
			...actual,
			readFile: async (...args: Parameters<(typeof actual)["readFile"]>) => {
				if (
					args[0]
						.toString()
						.endsWith(path.sep + path.join("next", "package.json"))
				) {
					return JSON.stringify({ version });
				}

				if (args[0].toString().endsWith("/next/package.json")) {
					return JSON.stringify({ version });
				}

				return actual.readFile(...args);
			},
		};
	});

	return () => vi.doUnmock("node:fs/promises");
};
