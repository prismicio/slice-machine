import { vi } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createRequire } from "node:module";

export const stubOniguruma = async (): Promise<void> => {
	const thisRequire = createRequire(import.meta.url);
	const modulePath = path.dirname(
		thisRequire.resolve("vscode-oniguruma/package.json"),
	);
	const onigWasmPath = path.join(modulePath, "release", "onig.wasm");

	const _fs: typeof fs = await vi.importActual("node:fs/promises");
	const onigWasm = await _fs.readFile(onigWasmPath);

	await fs.mkdir(modulePath, { recursive: true });
	await fs.writeFile(
		path.join(modulePath, "package.json"),
		JSON.stringify({
			name: "vscode-oniguruma",
			main: "release/main.js",
		}),
	);
	await fs.mkdir(path.join(modulePath, "release"));
	await fs.writeFile(path.join(modulePath, "release/main.js"), "");

	await fs.mkdir(path.basename(onigWasmPath), { recursive: true });
	await fs.writeFile(onigWasmPath, onigWasm);
};
