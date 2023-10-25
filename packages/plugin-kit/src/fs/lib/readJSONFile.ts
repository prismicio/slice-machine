import * as fs from "node:fs/promises";
import { fsLimit } from "./fsLimit";

export async function readJSONFile<T = unknown>(path: string): Promise<T> {
	const contents = await fsLimit(() => fs.readFile(path, "utf8"));

	return JSON.parse(contents);
}
