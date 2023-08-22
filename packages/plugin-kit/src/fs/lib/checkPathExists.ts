import * as fs from "node:fs/promises";
import { PathLike } from "node:fs";

export async function checkPathExists(path: PathLike): Promise<boolean> {
	try {
		await fs.access(path);

		return true;
	} catch {
		return false;
	}
}
