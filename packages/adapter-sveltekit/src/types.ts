export type PluginOptions = {
	/**
	 * Determines if generated files should be formatted using Prettier.
	 *
	 * @defaultValue `true`
	 */
	format?: boolean;

	/**
	 * The filepath at which generated TypeScript types will be saved.
	 *
	 * @defaultValue `prismicio-types.d.ts`
	 */
	generatedTypesFilePath?: string;

	/**
	 * Determines if generated files should be written in TypeScript or
	 * JavaScript.
	 *
	 * @defaultValue `true` if the project contains a `tsconfig.json`, `false` otherwise.
	 */
	typescript?: boolean;
};
