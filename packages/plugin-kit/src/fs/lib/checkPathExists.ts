import { PathLike } from "node:fs";

import * as fs from "./fsLimit";

export async function checkPathExists(path: PathLike): Promise<boolean> {
	try {
		await fs.access(path);

		return true;
	} catch {
		return false;
	}
}
