import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { PrismicAuthState } from "../../src";

export const readPrismicAuthState = async (): Promise<
	PrismicAuthState | undefined
> => {
	try {
		const rawAuthState = await fs.readFile(
			path.join(os.homedir(), ".prismic"),
			"utf8",
		);

		return JSON.parse(rawAuthState);
	} catch {
		return undefined;
	}
};
