import * as fs from "node:fs/promises";
import { PathLike } from "node:fs";
import { fsLimit } from "./fsLimit";

export async function checkPathExists(path: PathLike): Promise<boolean> {
	try {
		await fsLimit(() => fs.access(path));

		return true;
	} catch {
		return false;
	}
}
