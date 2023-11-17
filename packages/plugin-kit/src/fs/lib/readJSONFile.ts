import * as fs from "./fsLimit";

export async function readJSONFile<T = unknown>(path: string): Promise<T> {
	const contents = await fs.readFile(path, "utf8");

	return JSON.parse(contents);
}
