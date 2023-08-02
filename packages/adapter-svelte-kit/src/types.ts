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
};
