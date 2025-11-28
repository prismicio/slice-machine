import * as path from "node:path";
import * as z from "zod";
import * as rc9 from "rc9";

import { decode } from "./decode";

const PRISMICRC = ".prismicrc";

const PrismicrcSchema = z.object({
	telemetry: z.boolean().optional(),
});
type Prismicrc = z.infer<typeof PrismicrcSchema>;

export const readRawPrismicrc = (dir?: string): Prismicrc => {
	const rawPrismicrc = dir
		? rc9.read({ dir, name: PRISMICRC })
		: rc9.readUser(PRISMICRC);

	const { value: prismicrc, error } = decode(PrismicrcSchema, rawPrismicrc);

	if (error) {
		throw new Error(
			`Failed to parse ${
				dir ? path.resolve(dir, PRISMICRC) : `~/${PRISMICRC}`
			}: ${error.errors.join(", ")}`,
		);
	}

	return prismicrc;
};

export const readPrismicrc = (dir: string): Prismicrc => {
	const userPrismicrc = readRawPrismicrc();
	const projectPrismicrc = readRawPrismicrc(dir);

	return {
		...userPrismicrc,
		...projectPrismicrc,
	};
};
