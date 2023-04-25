import * as path from "node:path";
import * as t from "io-ts";
import * as rc9 from "rc9";

import { decode } from "./decode";

const PRISMICRC = ".prismicrc";

const Prismicrc = t.partial({
	telemetry: t.boolean,
});
type Prismicrc = t.TypeOf<typeof Prismicrc>;

export const readRawPrismicrc = (dir?: string): Prismicrc => {
	const rawPrismicrc = dir
		? rc9.read({ dir, name: PRISMICRC })
		: rc9.readUser(PRISMICRC);

	const { value: prismicrc, error } = decode(Prismicrc, rawPrismicrc);

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

export const writePrismicrc = (config: Prismicrc, dir?: string): void => {
	const { value: validatedConfig, error } = decode(Prismicrc, config);

	if (error) {
		throw new Error(`Failed to validate config: ${error.errors.join(", ")}`);
	}

	dir
		? rc9.write(validatedConfig, { dir, name: PRISMICRC })
		: rc9.writeUser(validatedConfig, PRISMICRC);
};

export const updatePrismicrc = (config: Prismicrc, dir?: string): Prismicrc => {
	const { value: validatedConfig, error } = decode(Prismicrc, config);

	if (error) {
		throw new Error(`Failed to validate config: ${error.errors.join(", ")}`);
	}

	return dir
		? rc9.update(validatedConfig, { dir, name: PRISMICRC })
		: rc9.updateUser(validatedConfig, PRISMICRC);
};
