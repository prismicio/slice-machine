import prettier from "prettier";
import { stripIndent } from "common-tags";

type FormatOptions = {
	prettier?: prettier.Options;
	/**
	 * Determines if a newline is included at the end of the formatted result.
	 *
	 * @defaultValue `true`
	 */
	includeNewlineAtEnd?: boolean;
};

export const format = async (
	source: string,
	filePath: string,
	options?: FormatOptions,
): Promise<string> => {
	let formatted = stripIndent(source);

	const prettierOptions = await prettier.resolveConfig(filePath);

	formatted = prettier.format(formatted, {
		...prettierOptions,
		filepath: filePath,
		...(options?.prettier ?? {}),
	});

	if (options?.includeNewlineAtEnd === false) {
		formatted.replace(/[\r\n]+$/, "");
	}

	return formatted;
};
