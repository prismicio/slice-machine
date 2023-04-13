import * as fs from "node:fs/promises";
import { PathLike } from "node:fs";

export const checkPathExists = async (path: PathLike): Promise<boolean> => {
	try {
		await fs.access(path);

		return true;
	} catch {
		return false;
	}
};
