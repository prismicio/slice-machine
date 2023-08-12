export type PluginOptions = {
	/**
	 * Determines if generated files should be formatted using Prettier.
	 *
	 * @defaultValue `true`
	 */
	format?: boolean;

	/**
	 * Determines if Slice components should be lazy loaded when rendered.
	 *
	 * @defaultValue `true`
	 */
	lazyLoadSlices?: boolean;

	/**
	 * Determines if generated files should be written in TypeScript or
	 * JavaScript.
	 *
	 * @defaultValue `true` if the project contains a `tsconfig.json`, `false` otherwise.
	 */
	typescript?: boolean;

	/**
	 * The filepath at which generated TypeScript types will be saved.
	 *
	 * @defaultValue `prismicio-types.d.ts`
	 */
	generatedTypesFilePath?: string;
};
