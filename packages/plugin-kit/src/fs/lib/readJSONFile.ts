import * as fs from "node:fs/promises";

export async function readJSONFile<T = unknown>(path: string): Promise<T> {
	const contents = await fs.readFile(path, "utf8");

	return JSON.parse(contents);
}
